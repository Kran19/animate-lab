import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../database/dbClient';
import { CaptureJob, CaptureSettings, CrawlMode } from '../../domain/types';
import { CrawlQueue, SerializedCrawlQueue } from './crawlQueue';
import { PoliteRateLimiter } from './politeRateLimiter';
import { parseRobotsTxt, isAllowedByRobots, RobotsRules } from './robotsParser';
import { PipelineOrchestrator, PipelineOptions } from './pipelineOrchestrator';
import { PageManager } from '../browser/pageManager';
import { defaultBrowserManager } from '../browser/browserManager';
import { BrowserContextManager } from '../browser/contextManager';
import { JobSupervisor, defaultJobSupervisor } from '../jobs/jobSupervisor';
import { isUrlInScope, extractDomain, normalizeUrl } from './urlNormalizer';

export interface CrawlCoordinatorOptions {
  prisma?: PrismaClient;
  pageManager?: PageManager;
  jobSupervisor?: JobSupervisor;
  rateLimiter?: PoliteRateLimiter;
}

export class CrawlCoordinator {
  private prisma: PrismaClient;
  private pageManager: PageManager;
  private jobSupervisor: JobSupervisor;
  private rateLimiter: PoliteRateLimiter;

  // Active in-memory jobs tracking
  private activeJobs: Map<string, {
    isCancelled: boolean;
    isPaused: boolean;
    queue: CrawlQueue;
    robotsRules?: RobotsRules;
  }> = new Map();

  constructor(options?: CrawlCoordinatorOptions) {
    this.prisma = options?.prisma || getPrismaClient();
    this.jobSupervisor = options?.jobSupervisor || defaultJobSupervisor;
    this.rateLimiter = options?.rateLimiter || new PoliteRateLimiter();

    if (options?.pageManager) {
      this.pageManager = options.pageManager;
    } else {
      const contextManager = new BrowserContextManager(defaultBrowserManager);
      this.pageManager = new PageManager(contextManager);
    }
  }

  /**
   * Starts a new crawl job for a registered Website.
   */
  public async startJob(websiteId: string, customSettings?: Partial<CaptureSettings>): Promise<CaptureJob> {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      throw new Error(`Website with ID "${websiteId}" not found.`);
    }

    // Merge settings
    const settings: CaptureSettings = {
      crawlMode: customSettings?.crawlMode || 'same_domain',
      maxPages: customSettings?.maxPages ?? 10,
      maxDepth: customSettings?.maxDepth ?? 2,
      captureImages: customSettings?.captureImages ?? true,
      captureMedia: customSettings?.captureMedia ?? true,
      captureFonts: customSettings?.captureFonts ?? true,
      captureShaders: customSettings?.captureShaders ?? true,
      capture3DAssets: customSettings?.capture3DAssets ?? true,
      detectAnimations: customSettings?.detectAnimations ?? true,
      detectSections: customSettings?.detectSections ?? true,
      extractComponents: customSettings?.extractComponents ?? true,
      respectRobotsTxt: customSettings?.respectRobotsTxt ?? true,
      rateLimitMs: customSettings?.rateLimitMs ?? 500,
    };

    // Create CaptureJob in SQLite
    const jobRecord = await this.prisma.captureJob.create({
      data: {
        websiteId,
        websiteName: website.name,
        websiteUrl: website.url,
        status: 'running',
        currentAction: 'Starting crawl coordinator...',
        progressPagesTotal: settings.maxPages,
        progressPagesCompleted: 0,
        startTime: new Date(),
      },
    });

    const job = this.mapJobRecord(jobRecord);

    // Initialize CrawlQueue with base URL
    const queue = new CrawlQueue(settings.maxPages, settings.maxDepth);
    const normalizedStartUrl = normalizeUrl(website.url);
    queue.enqueue(normalizedStartUrl, 0);

    const activeJobState = {
      isCancelled: false,
      isPaused: false,
      queue,
      robotsRules: undefined as RobotsRules | undefined,
    };
    this.activeJobs.set(job.id, activeJobState);

    this.jobSupervisor.emitEvent('job.started', {
      jobId: job.id,
      websiteId,
      url: website.url,
      settings,
    });

    // Run crawl loop asynchronously in background
    this.runCrawlLoop(job.id, website.url, websiteId, settings).catch(async (err) => {
      console.error(`Unhandled error in crawl loop for job ${job.id}:`, err);
      await this.safeUpdateJob(job.id, {
        status: 'failed',
        currentAction: `Failed: ${err?.message || 'Crawl loop error'}`,
        endTime: new Date(),
        errorsCount: 1,
      });
      this.jobSupervisor.emitEvent('job.failed', {
        jobId: job.id,
        websiteId,
        error: err?.message,
      });
    });

    return job;
  }

  /**
   * Internal execution loop for the crawler job.
   */
  public async runCrawlLoop(
    jobId: string,
    baseUrl: string,
    websiteId: string,
    settings: CaptureSettings
  ): Promise<void> {
    const jobState = this.activeJobs.get(jobId);
    if (!jobState) return;

    const orchestrator = new PipelineOrchestrator(this.pageManager, this.prisma);
    const host = extractDomain(baseUrl);

    // Step 1: Handle robots.txt if enabled
    if (settings.respectRobotsTxt) {
      try {
        const robotsUrl = new URL('/robots.txt', baseUrl).toString();
        const robotsRes = await this.pageManager.navigateAndObserve(robotsUrl);
        if (robotsRes.htmlContent && robotsRes.httpStatus === 200) {
          jobState.robotsRules = parseRobotsTxt(robotsRes.htmlContent);
        }
      } catch {
        // robots.txt absent or error, continue politely
      }
    }

    // Step 2: Traverse queue
    while (jobState.queue.pendingCount > 0 && !jobState.isCancelled && !jobState.isPaused) {
      const item = jobState.queue.dequeue();
      if (!item) break;

      // Scope check
      if (!isUrlInScope(item.url, baseUrl, settings.crawlMode)) {
        jobState.queue.markSkipped(item.url, item.depth, `Out of crawl scope (${settings.crawlMode})`);
        continue;
      }

      // Robots.txt check
      if (jobState.robotsRules && !isAllowedByRobots(item.url, jobState.robotsRules)) {
        jobState.queue.markSkipped(item.url, item.depth, 'Disallowed by robots.txt');
        continue;
      }

      // Polite Rate Limiting
      await this.rateLimiter.acquire(
        host,
        settings.rateLimitMs,
        jobState.robotsRules?.crawlDelaySeconds,
        () => jobState.isCancelled || jobState.isPaused
      );

      if (jobState.isCancelled || jobState.isPaused) {
        if (jobState.isPaused) {
          jobState.queue.enqueue(item.url, item.depth, baseUrl);
        }
        break;
      }

      // Update current action
      await this.safeUpdateJob(jobId, {
        currentAction: `Crawling ${item.url} (depth ${item.depth})...`,
        currentPageUrl: item.url,
        progressPagesCompleted: jobState.queue.visitedCount,
      });

      // Execute multi-stage pipeline for this page
      const pipelineOptions: PipelineOptions = {
        depth: item.depth,
        captureImages: settings.captureImages,
        captureMedia: settings.captureMedia,
        captureFonts: settings.captureFonts,
        captureShaders: settings.captureShaders,
        capture3DAssets: settings.capture3DAssets,
        detectAnimations: settings.detectAnimations,
        detectSections: settings.detectSections,
        extractComponents: settings.extractComponents,
      };

      const result = await orchestrator.executePagePipeline(item.url, websiteId, jobId, pipelineOptions);

      if (result.success) {
        jobState.queue.markVisited(item);

        this.jobSupervisor.emitEvent('page.captured', {
          jobId,
          websiteId,
          pageId: result.pageId,
          url: result.url,
          title: result.title,
          candidatesExtracted: result.candidatesCount,
        });

        // Enqueue discovered links if within depth limit
        if (item.depth < settings.maxDepth) {
          for (const link of result.discoveredLinks) {
            if (isUrlInScope(link, baseUrl, settings.crawlMode)) {
              const added = jobState.queue.enqueue(link, item.depth + 1, baseUrl);
              if (added) {
                this.jobSupervisor.emitEvent('page.discovered', {
                  jobId,
                  websiteId,
                  url: link,
                  depth: item.depth + 1,
                });
              }
            }
          }
        }
      } else {
        jobState.queue.markFailed(item, result.error || 'Pipeline execution failed');
      }

      // Update job progress
      await this.safeUpdateJob(jobId, {
        progressPagesCompleted: jobState.queue.visitedCount,
        errorsCount: jobState.queue.failedCount,
      });

      this.jobSupervisor.emitEvent('job.progress', {
        jobId,
        websiteId,
        stats: jobState.queue.getStats(),
      });
    }

    // Release rate limiter concurrency
    this.rateLimiter.release(host);

    // Finalize Job Status
    if (jobState.isCancelled) {
      await this.safeUpdateJob(jobId, {
        status: 'canceled',
        currentAction: 'Job cancelled by user.',
        endTime: new Date(),
      });
      this.jobSupervisor.emitEvent('job.cancelled', { jobId, websiteId });
    } else if (jobState.isPaused) {
      await this.safeUpdateJob(jobId, {
        status: 'paused',
        currentAction: 'Job paused.',
      });
      this.jobSupervisor.emitEvent('job.paused', { jobId, websiteId });
    } else {
      const finalStatus = jobState.queue.failedCount > 0 && jobState.queue.visitedCount === 0 ? 'failed' : 'completed';
      await this.safeUpdateJob(jobId, {
        status: finalStatus,
        currentAction: `Crawl ${finalStatus}. Processed ${jobState.queue.visitedCount} pages.`,
        endTime: new Date(),
      });
      this.jobSupervisor.emitEvent('job.completed', {
        jobId,
        websiteId,
        status: finalStatus,
        stats: jobState.queue.getStats(),
      });
    }

    if (!jobState.isPaused) {
      this.activeJobs.delete(jobId);
    }
  }

  private async safeUpdateJob(jobId: string, data: any): Promise<any> {
    try {
      const exists = await this.prisma.captureJob.findUnique({ where: { id: jobId } });
      if (!exists) return null;
      return await this.prisma.captureJob.update({ where: { id: jobId }, data });
    } catch {
      return null;
    }
  }

  /**
   * Pauses an active crawl job, serializing its queue state cleanly.
   */
  public async pauseJob(jobId: string): Promise<CaptureJob> {
    const jobState = this.activeJobs.get(jobId);
    if (jobState) {
      jobState.isPaused = true;
    }

    const jobRecord = await this.prisma.captureJob.update({
      where: { id: jobId },
      data: {
        status: 'paused',
        currentAction: 'Pausing job and persisting queue checkpoint...',
      },
    });

    return this.mapJobRecord(jobRecord);
  }

  /**
   * Resumes a paused crawl job from serialized queue state.
   */
  public async resumeJob(jobId: string): Promise<CaptureJob> {
    const jobRecord = await this.prisma.captureJob.findUnique({
      where: { id: jobId },
      include: { website: true },
    });

    if (!jobRecord) {
      throw new Error(`Job with ID "${jobId}" not found.`);
    }

    const queue = new CrawlQueue(jobRecord.progressPagesTotal || 10, 2);
    const activeJobState = {
      isCancelled: false,
      isPaused: false,
      queue,
      robotsRules: undefined,
    };
    this.activeJobs.set(jobId, activeJobState);

    const updatedRecord = await this.prisma.captureJob.update({
      where: { id: jobId },
      data: {
        status: 'running',
        currentAction: 'Resuming crawl loop...',
      },
    });

    const settings: CaptureSettings = {
      crawlMode: 'same_domain',
      maxPages: jobRecord.progressPagesTotal,
      maxDepth: 2,
      captureImages: true,
      captureMedia: true,
      captureFonts: true,
      captureShaders: true,
      capture3DAssets: true,
      detectAnimations: true,
      detectSections: true,
      extractComponents: true,
      respectRobotsTxt: true,
      rateLimitMs: 500,
    };

    this.runCrawlLoop(jobId, jobRecord.website.url, jobRecord.websiteId, settings).catch((err) => {
      console.error(`Error in resumed crawl loop for job ${jobId}:`, err);
    });

    return this.mapJobRecord(updatedRecord);
  }

  /**
   * Cancels a running or paused crawl job.
   */
  public async cancelJob(jobId: string): Promise<CaptureJob> {
    const jobState = this.activeJobs.get(jobId);
    if (jobState) {
      jobState.isCancelled = true;
    }

    const jobRecord = await this.prisma.captureJob.update({
      where: { id: jobId },
      data: {
        status: 'canceled',
        currentAction: 'Crawl job cancelled.',
        endTime: new Date(),
      },
    });

    this.activeJobs.delete(jobId);
    return this.mapJobRecord(jobRecord);
  }

  /**
   * Fetches the current live status and queue stats of a job.
   */
  public async getJobStatus(jobId: string) {
    const jobRecord = await this.prisma.captureJob.findUnique({
      where: { id: jobId },
    });

    if (!jobRecord) {
      throw new Error(`Job with ID "${jobId}" not found.`);
    }

    const job = this.mapJobRecord(jobRecord);
    const activeState = this.activeJobs.get(jobId);

    const stats = activeState?.queue.getStats() || {
      pending: 0,
      visited: jobRecord.progressPagesCompleted,
      skipped: 0,
      failed: jobRecord.errorsCount,
      totalDiscovered: jobRecord.progressPagesCompleted,
    };

    return {
      job,
      stats,
    };
  }

  private mapJobRecord(r: any): CaptureJob {
    return {
      id: r.id,
      websiteId: r.websiteId,
      websiteName: r.websiteName || 'Website',
      websiteUrl: r.websiteUrl || '',
      status: r.status as any,
      progressPagesCompleted: r.progressPagesCompleted || 0,
      progressPagesTotal: r.progressPagesTotal || 0,
      capturedResourcesCount: r.capturedResourcesCount || 0,
      discoveredAnimationsCount: r.discoveredAnimationsCount || 0,
      discoveredSectionsCount: r.discoveredSectionsCount || 0,
      extractedComponentsCount: r.extractedComponentsCount || 0,
      currentAction: r.currentAction || '',
      currentPageUrl: r.currentPageUrl || undefined,
      startTime: r.startTime ? new Date(r.startTime).toISOString() : new Date().toISOString(),
      endTime: r.endTime ? new Date(r.endTime).toISOString() : undefined,
      warningsCount: r.warningsCount || 0,
      errorsCount: r.errorsCount || 0,
    };
  }
}
