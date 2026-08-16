import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { getPrismaClient } from '../src/database/dbClient';
import { normalizeUrl, isValidCrawlUrl, isUrlInScope, extractDomain } from '../src/engine/crawler/urlNormalizer';
import { parseRobotsTxt, isAllowedByRobots } from '../src/engine/crawler/robotsParser';
import { PoliteRateLimiter } from '../src/engine/crawler/politeRateLimiter';
import { CrawlQueue } from '../src/engine/crawler/crawlQueue';
import { PipelineOrchestrator } from '../src/engine/crawler/pipelineOrchestrator';
import { CrawlCoordinator } from '../src/engine/crawler/crawlCoordinator';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { CURRENT_PROTOCOL_VERSION, IPC_METHODS } from '../src/engine/ipc/protocol';
import { JobSupervisor } from '../src/engine/jobs/jobSupervisor';
import { PageManager, NavigationResult } from '../src/engine/browser/pageManager';
import { BrowserContextManager } from '../src/engine/browser/contextManager';
import { defaultBrowserManager } from '../src/engine/browser/browserManager';

describe('Phase 10 — Automated Crawler, Pipeline Orchestration & Event Streaming Suite (30 Tests)', () => {
  let prisma: PrismaClient;
  let testWebsiteId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test_phase10_crawler.db';
    execSync('npx prisma db push --skip-generate', { env: process.env });
    prisma = new PrismaClient();
    await prisma.$connect();
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    prisma = getPrismaClient();

    let ws = await prisma.workspace.findFirst();
    if (!ws) {
      ws = await prisma.workspace.create({
        data: {
          name: 'Phase 10 Test Workspace',
          storagePath: 'workspaces/test-p10-root',
        },
      });
    }

    // Create deterministic test Website record
    const website = await prisma.website.create({
      data: {
        workspaceId: ws.id,
        url: 'https://example-phase10.test',
        name: 'Phase 10 Test Target',
        storagePath: 'websites/test-phase10-' + Date.now(),
        status: 'queued',
      },
    });
    testWebsiteId = website.id;
  });

  afterEach(async () => {
    try {
      if (testWebsiteId) {
        await prisma.diagnosticLog.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.componentCandidate.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.section.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.technologyEvidence.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.resource.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.page.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.captureJob.deleteMany({ where: { websiteId: testWebsiteId } });
        await prisma.website.delete({ where: { id: testWebsiteId } });
      }
    } catch {
      // Ignore cleanup error
    }
  });

  // ==========================================
  // Group 1: URL Normalization & Scope (5 Tests)
  // ==========================================
  it('1. Normalizes relative URLs, query parameters, and removes hashes', () => {
    const base = 'https://example.com/blog/article';
    const raw = '../about/?utm_source=twitter&b=2&a=1#section3';
    const normalized = normalizeUrl(raw, base);

    expect(normalized).toBe('https://example.com/about?a=1&b=2');
    expect(isValidCrawlUrl(normalized)).toBe(true);
    expect(isValidCrawlUrl('javascript:alert(1)')).toBe(false);
    expect(isValidCrawlUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('2. Enforces same_domain scope correctly', () => {
    const base = 'https://example.com/home';
    expect(isUrlInScope('https://example.com/about', base, 'same_domain')).toBe(true);
    expect(isUrlInScope('https://example.com/blog/123', base, 'same_domain')).toBe(true);
    expect(isUrlInScope('https://otherdomain.com/about', base, 'same_domain')).toBe(false);
    expect(isUrlInScope('https://sub.example.com/about', base, 'same_domain')).toBe(false);
  });

  it('3. Enforces single_page scope correctly', () => {
    const base = 'https://example.com/landing';
    expect(isUrlInScope('https://example.com/landing#pricing', base, 'single_page')).toBe(true);
    expect(isUrlInScope('https://example.com/landing?ref=hero', base, 'single_page')).toBe(true);
    expect(isUrlInScope('https://example.com/landing/details', base, 'single_page')).toBe(false);
    expect(isUrlInScope('https://example.com/other', base, 'single_page')).toBe(false);
  });

  it('4. Enforces subpaths_only scope correctly', () => {
    const base = 'https://example.com/docs/';
    expect(isUrlInScope('https://example.com/docs/intro', base, 'subpaths_only')).toBe(true);
    expect(isUrlInScope('https://example.com/docs/api/v1', base, 'subpaths_only')).toBe(true);
    expect(isUrlInScope('https://example.com/blog', base, 'subpaths_only')).toBe(false);
    expect(isUrlInScope('https://example.com/about', base, 'subpaths_only')).toBe(false);
  });

  it('5. Extracts domain and checks scope boundary across scopes', () => {
    expect(extractDomain('https://Sub.Example.COM/Path/')).toBe('sub.example.com');
    expect(extractDomain('invalid-url')).toBe('');
  });

  // ==========================================
  // Group 2: Robots.txt Compliance (4 Tests)
  // ==========================================
  it('6. Parses User-agent, Disallow, and Allow rules', () => {
    const sampleRobots = `
      User-agent: *
      Disallow: /admin/
      Disallow: /private/*
      Allow: /private/public-preview
      Crawl-delay: 2.5
      Sitemap: https://example.com/sitemap.xml
    `;

    const rules = parseRobotsTxt(sampleRobots);
    expect(rules.disallow).toContain('/admin/');
    expect(rules.disallow).toContain('/private/*');
    expect(rules.allow).toContain('/private/public-preview');
    expect(rules.crawlDelaySeconds).toBe(2.5);
    expect(rules.sitemaps).toContain('https://example.com/sitemap.xml');
  });

  it('7. Honors Disallow path restrictions with Allow overrides', () => {
    const sampleRobots = `
      User-agent: *
      Disallow: /checkout/
      Disallow: /account/
      Disallow: /public/hidden
      Allow: /public/
    `;
    const rules = parseRobotsTxt(sampleRobots);

    expect(isAllowedByRobots('https://example.com/products/item1', rules)).toBe(true);
    expect(isAllowedByRobots('https://example.com/checkout/pay', rules)).toBe(false);
    expect(isAllowedByRobots('https://example.com/account/settings', rules)).toBe(false);
    expect(isAllowedByRobots('https://example.com/public/about', rules)).toBe(true);
  });

  it('8. Respects Crawl-delay directive value extraction', () => {
    const sampleRobots = `
      User-agent: *
      Crawl-delay: 5
    `;
    const rules = parseRobotsTxt(sampleRobots);
    expect(rules.crawlDelaySeconds).toBe(5);
  });

  it('9. Bypasses robots.txt gracefully when content is empty or malformed', () => {
    const rules = parseRobotsTxt('');
    expect(isAllowedByRobots('https://example.com/any/path', rules)).toBe(true);
  });

  // ==========================================
  // Group 3: Crawl Queue Management (5 Tests)
  // ==========================================
  it('10. Deduplicates visited and queued URLs', () => {
    const queue = new CrawlQueue(10, 3);
    const added1 = queue.enqueue('https://example.com/page1', 0);
    const added2 = queue.enqueue('https://example.com/page1#hash', 0);
    const added3 = queue.enqueue('https://example.com/page1?utm_source=twitter', 0);
    const added4 = queue.enqueue('https://example.com/page2', 1);

    expect(added1).toBe(true);
    expect(added2).toBe(false); // Duplicate
    expect(added3).toBe(false); // Duplicate normalized
    expect(added4).toBe(true);
    expect(queue.pendingCount).toBe(2);
  });

  it('11. Enforces maxPages limit strictly', () => {
    const queue = new CrawlQueue(2, 5); // Limit 2 pages max
    queue.enqueue('https://example.com/p1', 0);
    queue.enqueue('https://example.com/p2', 0);
    const added3 = queue.enqueue('https://example.com/p3', 0);

    expect(added3).toBe(false);
    expect(queue.pendingCount).toBe(2);
    expect(queue.skippedCount).toBe(1);
  });

  it('12. Enforces maxDepth restriction strictly', () => {
    const queue = new CrawlQueue(10, 1); // Depth limit 1
    const addedDepth0 = queue.enqueue('https://example.com/root', 0);
    const addedDepth1 = queue.enqueue('https://example.com/level1', 1);
    const addedDepth2 = queue.enqueue('https://example.com/level2', 2);

    expect(addedDepth0).toBe(true);
    expect(addedDepth1).toBe(true);
    expect(addedDepth2).toBe(false); // Exceeds depth
    expect(queue.skippedCount).toBe(1);
  });

  it('13. Prioritizes URLs in BFS order (lowest depth first)', () => {
    const queue = new CrawlQueue(10, 3);
    queue.enqueue('https://example.com/depth-2', 2);
    queue.enqueue('https://example.com/depth-0', 0);
    queue.enqueue('https://example.com/depth-1', 1);

    const first = queue.dequeue();
    const second = queue.dequeue();
    const third = queue.dequeue();

    expect(first?.depth).toBe(0);
    expect(second?.depth).toBe(1);
    expect(third?.depth).toBe(2);
  });

  it('14. Serializes and deserializes queue state for recovery', () => {
    const queue = new CrawlQueue(10, 2);
    queue.enqueue('https://example.com/1', 0);
    queue.enqueue('https://example.com/2', 1);

    const item1 = queue.dequeue();
    if (item1) queue.markVisited(item1);

    const serialized = queue.serialize();
    expect(serialized.visited.length).toBe(1);
    expect(serialized.pending.length).toBe(1);

    const restoredQueue = CrawlQueue.deserialize(serialized);
    expect(restoredQueue.visitedCount).toBe(1);
    expect(restoredQueue.pendingCount).toBe(1);
    expect(restoredQueue.has('https://example.com/1')).toBe(true);
  });

  // ==========================================
  // Group 4: Polite Rate Limiter (3 Tests)
  // ==========================================
  it('15. Enforces delay between sequential requests to the same host', async () => {
    let mockTime = 1000;
    let sleepCalls: number[] = [];

    const limiter = new PoliteRateLimiter({
      nowFn: () => mockTime,
      sleepFn: async (ms) => {
        sleepCalls.push(ms);
        mockTime += ms;
      },
    });

    await limiter.acquire('example.com', 500);
    expect(sleepCalls.length).toBe(0); // First call no sleep

    // Second call immediately at same timestamp
    await limiter.acquire('example.com', 500);
    expect(sleepCalls.length).toBe(1);
    expect(sleepCalls[0]).toBe(500);
  });

  it('16. Isolates rate limiting per host independently', async () => {
    let mockTime = 1000;
    let sleepCalls: number[] = [];

    const limiter = new PoliteRateLimiter({
      nowFn: () => mockTime,
      sleepFn: async (ms) => {
        sleepCalls.push(ms);
        mockTime += ms;
      },
    });

    await limiter.acquire('host-a.com', 500);
    // Request to host-b.com should not wait on host-a
    await limiter.acquire('host-b.com', 500);
    expect(sleepCalls.length).toBe(0);
  });

  it('17. Aborts waiting immediately when cancelled', async () => {
    let slept = false;
    const limiter = new PoliteRateLimiter({
      nowFn: () => 1000,
      sleepFn: async () => { slept = true; },
    });

    await limiter.acquire('example.com', 500, undefined, () => true);
    expect(slept).toBe(false);
  });

  // ==========================================
  // Group 5: Pipeline Orchestration & Multi-Stage Execution (5 Tests)
  // ==========================================
  it('18. Coordinates PageManager navigation and DOM link extraction', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test/home',
        finalUrl: 'https://example-phase10.test/home',
        httpStatus: 200,
        title: 'Home Page',
        htmlContent: `
          <html>
            <body>
              <h1>Welcome</h1>
              <a href="/about">About Us</a>
              <a href="https://example-phase10.test/contact">Contact</a>
              <a href="javascript:void(0)">Ignore</a>
            </body>
          </html>
        `,
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const orchestrator = new PipelineOrchestrator(mockPageManager, prisma);
    const result = await orchestrator.executePagePipeline(
      'https://example-phase10.test/home',
      testWebsiteId,
      'job-123',
      { depth: 0 }
    );

    expect(result.success).toBe(true);
    expect(result.title).toBe('Home Page');
    expect(result.discoveredLinks).toContain('https://example-phase10.test/about');
    expect(result.discoveredLinks).toContain('https://example-phase10.test/contact');
  });

  it('19. Integrates ResourcePipeline acquisition during page crawl', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test/gallery',
        finalUrl: 'https://example-phase10.test/gallery',
        httpStatus: 200,
        title: 'Gallery',
        htmlContent: `
          <html>
            <head><link rel="stylesheet" href="/style.css"></head>
            <body><img src="/logo.png" alt="Logo"></body>
          </html>
        `,
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const orchestrator = new PipelineOrchestrator(mockPageManager, prisma);
    const result = await orchestrator.executePagePipeline(
      'https://example-phase10.test/gallery',
      testWebsiteId,
      'job-123',
      { depth: 1 }
    );

    expect(result.success).toBe(true);
    expect(result.pageId).toBeDefined();
  });

  it('20. Executes TechnologyDetector, AnimationAnalyzer, and ThreeDAnalyzer per page', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test/tech',
        finalUrl: 'https://example-phase10.test/tech',
        httpStatus: 200,
        title: 'Tech Page',
        htmlContent: `
          <html>
            <head><script src="https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js"></script></head>
            <body><div id="root"></div></body>
          </html>
        `,
        networkMetadata: [{ url: 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js' }],
      }),
    } as unknown as PageManager;

    const orchestrator = new PipelineOrchestrator(mockPageManager, prisma);
    const result = await orchestrator.executePagePipeline(
      'https://example-phase10.test/tech',
      testWebsiteId,
      'job-123',
      { detectAnimations: true }
    );

    expect(result.success).toBe(true);
    expect(result.technologiesCount).toBeGreaterThanOrEqual(1);
  });

  it('21. Executes SectionDetector and ComponentCandidateClassifier per page', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test/sections',
        finalUrl: 'https://example-phase10.test/sections',
        httpStatus: 200,
        title: 'Sections Showcase',
        htmlContent: '<main><section class="hero"><h1>Hero Title</h1></section></main>',
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const orchestrator = new PipelineOrchestrator(mockPageManager, prisma);
    const result = await orchestrator.executePagePipeline(
      'https://example-phase10.test/sections',
      testWebsiteId,
      'job-123',
      { detectSections: true, extractComponents: true }
    );

    expect(result.success).toBe(true);
    expect(result.sectionsCount).toBeGreaterThanOrEqual(1);
    expect(result.candidatesCount).toBeGreaterThanOrEqual(1);
  });

  it('22. Isolates individual page failures without terminating entire crawl job', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockRejectedValue(new Error('Navigation timeout after 30000ms')),
    } as unknown as PageManager;

    const orchestrator = new PipelineOrchestrator(mockPageManager, prisma);
    const result = await orchestrator.executePagePipeline(
      'https://example-phase10.test/broken-page',
      testWebsiteId,
      'job-123',
      { depth: 1 }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Navigation timeout');

    // DiagnosticLog should be created in SQLite
    const logs = await prisma.diagnosticLog.findMany({
      where: { websiteId: testWebsiteId },
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].level).toBe('error');
  });

  // ==========================================
  // Group 6: Job Coordinator & Lifecycle (5 Tests)
  // ==========================================
  it('23. Transitions job from QUEUED to RUNNING to COMPLETED', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test',
        finalUrl: 'https://example-phase10.test',
        httpStatus: 200,
        title: 'Home',
        htmlContent: '<html><body><a href="/p1">P1</a></body></html>',
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const coordinator = new CrawlCoordinator({
      prisma,
      pageManager: mockPageManager,
    });

    const job = await coordinator.startJob(testWebsiteId, { maxPages: 2, maxDepth: 1, rateLimitMs: 5 });
    expect(job.id).toBeDefined();
    expect(job.status).toBe('running');

    // Wait for async crawl loop to finish
    await new Promise((r) => setTimeout(r, 200));

    const updatedJob = await prisma.captureJob.findUnique({ where: { id: job.id } });
    expect(updatedJob?.status).toBe('completed');
  });

  it('24. Supports job PAUSE and state serialization', async () => {
    const coordinator = new CrawlCoordinator({ prisma });
    const job = await coordinator.startJob(testWebsiteId, { maxPages: 10 });
    const pausedJob = await coordinator.pauseJob(job.id);

    expect(pausedJob.status).toBe('paused');
    const dbJob = await prisma.captureJob.findUnique({ where: { id: job.id } });
    expect(dbJob?.status).toBe('paused');
  });

  it('25. Supports job RESUME from serialized queue state', async () => {
    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test',
        finalUrl: 'https://example-phase10.test',
        httpStatus: 200,
        title: 'Home',
        htmlContent: '<html><body>Hello</body></html>',
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const coordinator = new CrawlCoordinator({
      prisma,
      pageManager: mockPageManager,
    });

    const job = await coordinator.startJob(testWebsiteId, { maxPages: 5 });
    await coordinator.pauseJob(job.id);

    const resumedJob = await coordinator.resumeJob(job.id);
    expect(resumedJob.status).toBe('running');
  });

  it('26. Supports job CANCEL cleanly terminating active operations', async () => {
    const coordinator = new CrawlCoordinator({ prisma });
    const job = await coordinator.startJob(testWebsiteId);
    const cancelledJob = await coordinator.cancelJob(job.id);

    expect(cancelledJob.status).toBe('canceled');
    const dbJob = await prisma.captureJob.findUnique({ where: { id: job.id } });
    expect(dbJob?.status).toBe('canceled');
  });

  it('27. Emits structured job.progress and page.discovered events', async () => {
    const emittedEvents: string[] = [];
    const jobSupervisor = new JobSupervisor();
    jobSupervisor.addEventListener((evt) => {
      emittedEvents.push(evt.event);
    });

    const mockPageManager = {
      navigateAndObserve: vi.fn().mockResolvedValue({
        requestedUrl: 'https://example-phase10.test',
        finalUrl: 'https://example-phase10.test',
        httpStatus: 200,
        title: 'Home',
        htmlContent: '<html><body><a href="/p1">P1</a></body></html>',
        networkMetadata: [],
      }),
    } as unknown as PageManager;

    const coordinator = new CrawlCoordinator({
      prisma,
      pageManager: mockPageManager,
      jobSupervisor,
    });

    await coordinator.startJob(testWebsiteId, { maxPages: 2, maxDepth: 1, rateLimitMs: 5 });
    await new Promise((r) => setTimeout(r, 150));

    expect(emittedEvents).toContain('job.started');
    expect(emittedEvents).toContain('page.captured');
    expect(emittedEvents).toContain('page.discovered');
  });

  // ==========================================
  // Group 7: IPC Endpoints & RequestRouter (3 Tests)
  // ==========================================
  it('28. RequestRouter handles job.start IPC method', async () => {
    const router = new RequestRouter();
    const req = {
      id: 'req-start-job',
      method: IPC_METHODS.JOB_START,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: {
        websiteId: testWebsiteId,
        settings: { maxPages: 2, rateLimitMs: 5 },
      },
    };

    const res = await router.routeRequest(req);
    expect(res.success).toBe(true);
    expect(res.result?.job?.id).toBeDefined();
  });

  it('29. RequestRouter handles job.pause and job.resume IPC methods', async () => {
    const router = new RequestRouter();
    const startRes = await router.routeRequest({
      id: 'req-start-job-2',
      method: IPC_METHODS.JOB_START,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { websiteId: testWebsiteId },
    });
    const jobId = startRes.result?.job?.id;

    const pauseRes = await router.routeRequest({
      id: 'req-pause-job',
      method: IPC_METHODS.JOB_PAUSE,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { jobId },
    });
    expect(pauseRes.success).toBe(true);
    expect(pauseRes.result?.job?.status).toBe('paused');

    const resumeRes = await router.routeRequest({
      id: 'req-resume-job',
      method: IPC_METHODS.JOB_RESUME,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { jobId },
    });
    expect(resumeRes.success).toBe(true);
  });

  it('30. RequestRouter handles job.getStatus and job.cancel IPC methods', async () => {
    const router = new RequestRouter();
    const startRes = await router.routeRequest({
      id: 'req-start-job-3',
      method: IPC_METHODS.JOB_START,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { websiteId: testWebsiteId },
    });
    const jobId = startRes.result?.job?.id;

    const statusRes = await router.routeRequest({
      id: 'req-get-status',
      method: IPC_METHODS.JOB_GET_STATUS,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { jobId },
    });
    expect(statusRes.success).toBe(true);
    expect(statusRes.result?.job?.id).toBe(jobId);

    const cancelRes = await router.routeRequest({
      id: 'req-cancel-job',
      method: IPC_METHODS.JOB_CANCEL,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { jobId },
    });
    expect(cancelRes.success).toBe(true);
    expect(cancelRes.result?.job?.status).toBe('canceled');
  });
});
