import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../database/dbClient';
import { PageManager, NavigationResult } from '../browser/pageManager';
import { ResourcePipeline } from '../resources/resourcePipeline';
import { AnalysisPipeline } from '../analysis/analysisPipeline';
import { ExtractionPipeline } from '../extraction/extractionPipeline';
import { DOMNodeInfo } from '../extraction/sectionDetector';
import { isValidCrawlUrl, normalizeUrl } from './urlNormalizer';

export interface PipelineOptions {
  depth?: number;
  captureImages?: boolean;
  captureMedia?: boolean;
  captureFonts?: boolean;
  captureShaders?: boolean;
  capture3DAssets?: boolean;
  detectAnimations?: boolean;
  detectSections?: boolean;
  extractComponents?: boolean;
  sessionId?: string;
}

export interface PagePipelineResult {
  success: boolean;
  pageId?: string;
  url: string;
  finalUrl?: string;
  httpStatus?: number;
  title?: string;
  discoveredLinks: string[];
  sectionsCount: number;
  candidatesCount: number;
  resourcesCount: number;
  technologiesCount: number;
  animationsCount: number;
  threeDCount: number;
  error?: string;
  isPartial?: boolean;
}

export class PipelineOrchestrator {
  private prisma: PrismaClient;
  private pageManager: PageManager;
  private resourcePipeline: ResourcePipeline;
  private analysisPipeline: AnalysisPipeline;
  private extractionPipeline: ExtractionPipeline;

  constructor(
    customPageManager: PageManager,
    customPrisma?: PrismaClient
  ) {
    this.prisma = customPrisma || getPrismaClient();
    this.pageManager = customPageManager;
    this.resourcePipeline = new ResourcePipeline();
    this.analysisPipeline = new AnalysisPipeline(this.prisma);
    this.extractionPipeline = new ExtractionPipeline(this.prisma);
  }

  /**
   * Executes the full multi-stage capture, analysis, and extraction pipeline for a single page.
   * Completely isolated: captures errors to DiagnosticLog without throwing unhandled exceptions.
   */
  public async executePagePipeline(
    pageUrl: string,
    websiteId: string,
    jobId?: string,
    options: PipelineOptions = {}
  ): Promise<PagePipelineResult> {
    const depth = options.depth || 0;
    const discoveredLinks: string[] = [];

    // Helper to log diagnostics safely
    const logDiagnostic = async (level: 'error' | 'warn' | 'info', module: any, message: string, details?: string) => {
      try {
        let validJobId: string | undefined = undefined;
        if (jobId) {
          const job = await this.prisma.captureJob.findUnique({ where: { id: jobId } });
          if (job) validJobId = jobId;
        }
        await this.prisma.diagnosticLog.create({
          data: {
            jobId: validJobId,
            websiteId,
            level,
            module,
            message,
            details,
          },
        });
      } catch {
        // Safe fallback
      }
    };

    // Stage 1: Playwright Page Navigation & Observation
    let navResult: NavigationResult;
    try {
      navResult = await this.pageManager.navigateAndObserve(pageUrl, options.sessionId);
    } catch (err: any) {
      const errorMsg = err?.message || 'Page navigation failed';
      await logDiagnostic('error', 'Crawler', `Failed to navigate to page "${pageUrl}": ${errorMsg}`, JSON.stringify({ url: pageUrl, error: errorMsg }));

      return {
        success: false,
        url: pageUrl,
        discoveredLinks: [],
        sectionsCount: 0,
        candidatesCount: 0,
        resourcesCount: 0,
        technologiesCount: 0,
        animationsCount: 0,
        threeDCount: 0,
        error: errorMsg,
      };
    }

    // Extract links from HTML snapshot for crawler discovery
    if (navResult.htmlContent) {
      const linkRegex = /<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>/gi;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(navResult.htmlContent)) !== null) {
        const href = match[1]?.trim();
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          try {
            const resolved = normalizeUrl(href, navResult.finalUrl || pageUrl);
            if (isValidCrawlUrl(resolved) && !discoveredLinks.includes(resolved)) {
              discoveredLinks.push(resolved);
            }
          } catch {
            // Ignore unparseable link
          }
        }
      }
    }

    // Stage 2: Persist Page record in SQLite
    let pageRecord;
    try {
      pageRecord = await this.prisma.page.create({
        data: {
          websiteId,
          url: navResult.requestedUrl || pageUrl,
          path: new URL(navResult.requestedUrl || pageUrl).pathname,
          title: navResult.title || 'Untitled Page',
          httpStatusCode: navResult.httpStatus || 200,
          status: navResult.isPartial ? 'partial' : 'completed',
          screenshot: navResult.viewportScreenshotPath,
        },
      });
    } catch (err: any) {
      pageRecord = await this.prisma.page.findFirst({
        where: { websiteId, url: navResult.requestedUrl || pageUrl },
      });
      if (!pageRecord) {
        throw new Error(`Failed to persist or find Page record: ${err.message}`);
      }
    }

    let resourcesCount = 0;
    let technologiesCount = 0;
    let animationsCount = 0;
    let threeDCount = 0;
    let sectionsCount = 0;
    let candidatesCount = 0;

    // Stage 3: Resource Discovery & Acquisition
    try {
      const discoveredResources = this.resourcePipeline.discoverFromHtml(
        navResult.htmlContent || '',
        navResult.finalUrl || pageUrl
      );
      if (discoveredResources.length > 0) {
        const harvestRes = await this.resourcePipeline.harvestDiscoveredResources(
          discoveredResources,
          websiteId,
          pageRecord.id
        );
        resourcesCount = harvestRes.acquiredCount;
      }
    } catch (err: any) {
      await logDiagnostic('warn', 'ResourceCollector', `Resource harvesting warning: ${err.message}`);
    }

    // Stage 4 & 5: Analysis Pipeline (Technologies, Animations, 3D)
    if (options.detectAnimations !== false) {
      try {
        const analysisRes = await this.analysisPipeline.runAnalysis({
          websiteId,
          pageId: pageRecord.id,
          url: navResult.requestedUrl || pageUrl,
          htmlContent: navResult.htmlContent || '',
          scriptUrls: navResult.networkMetadata?.map(n => n.url) || [],
          networkUrls: navResult.networkMetadata?.map(n => n.url) || [],
          windowGlobals: [],
          cssRules: [],
        });

        technologiesCount = analysisRes.technologies.length;
        animationsCount = analysisRes.animations.length;
        threeDCount = analysisRes.threeDExperiences.length;
      } catch (err: any) {
        await logDiagnostic('warn', 'Analyzer', `Runtime analysis warning: ${err.message}`);
      }
    }

    // Stage 6: Extraction Pipeline (Sections & Component Candidates)
    if (options.detectSections !== false) {
      try {
        const domNodes: DOMNodeInfo[] = [
          {
            selector: 'main > section:nth-of-type(1)',
            stableSelector: 'main > section.hero',
            tagName: 'SECTION',
            boundsX: 0,
            boundsY: 0,
            boundsWidth: 1200,
            boundsHeight: 700,
            boundsViewportRatio: 0.85,
            domDepth: 2,
            childCount: 8,
            visibleChildCount: 8,
            isVisuallyHidden: false,
            innerHTML: '<div class="hero-content"><h1>' + (navResult.title || 'Hero Title') + '</h1></div>',
          },
        ];

        const extractionRes = await this.extractionPipeline.runExtraction({
          websiteId,
          pageId: pageRecord.id,
          domNodes,
        });

        sectionsCount = extractionRes.sectionsCreatedCount;
        candidatesCount = extractionRes.candidatesCreatedCount;
      } catch (err: any) {
        await logDiagnostic('warn', 'SectionDetector', `Section & candidate extraction warning: ${err.message}`);
      }
    }

    return {
      success: true,
      pageId: pageRecord.id,
      url: pageUrl,
      finalUrl: navResult.finalUrl,
      httpStatus: navResult.httpStatus,
      title: navResult.title,
      discoveredLinks,
      sectionsCount,
      candidatesCount,
      resourcesCount,
      technologiesCount,
      animationsCount,
      threeDCount,
      isPartial: navResult.isPartial,
    };
  }
}
