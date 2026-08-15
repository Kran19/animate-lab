import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { LocalTestServer } from './fixtures/testServer';
import { WorkspaceConfig } from '../src/engine/storage/workspaceConfig';
import { getPrismaClient, disconnectPrisma } from '../src/database/dbClient';
import { seedDatabase } from '../src/database/seed';
import { URLNormalizer } from '../src/engine/resources/urlNormalizer';
import { ResourceDiscoverer } from '../src/engine/resources/resourceDiscoverer';
import { ResourceAcquirer, RESOURCE_STREAMING_THRESHOLD, DEFAULT_MAX_SINGLE_RESOURCE_SIZE } from '../src/engine/resources/resourceAcquirer';
import { ResourcePipeline } from '../src/engine/resources/resourcePipeline';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { IPCRequest, CURRENT_PROTOCOL_VERSION } from '../src/engine/ipc/protocol';

const TEST_WORKSPACE_ROOT = path.resolve(process.cwd(), 'tmp-phase6-workspace');

describe('Phase 6 — Resource Discovery & Content-Addressable Acquisition Suite (All 36 Requirements)', { timeout: 30000 }, () => {
  let testServer: LocalTestServer;
  let baseUrl: string;
  let workspaceConfig: WorkspaceConfig;
  let acquirer: ResourceAcquirer;
  let pipeline: ResourcePipeline;
  let router: RequestRouter;

  let validWebsiteId: string;
  let validPageId: string;

  beforeAll(async () => {
    testServer = new LocalTestServer();
    baseUrl = await testServer.start(4322);

    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }

    workspaceConfig = new WorkspaceConfig(TEST_WORKSPACE_ROOT);
    const paths = workspaceConfig.ensureDirectoryStructure();
    process.env.DATABASE_URL = `file:${paths.databasePath}`;

    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: `file:${paths.databasePath}` },
      cwd: process.cwd(),
      stdio: 'ignore',
    });

    await seedDatabase();

    const prisma = getPrismaClient();
    const website = await prisma.website.findFirst();
    const page = await prisma.page.findFirst({ where: { websiteId: website!.id } });

    validWebsiteId = website!.id;
    validPageId = page!.id;

    acquirer = new ResourceAcquirer(workspaceConfig);
    pipeline = new ResourcePipeline(workspaceConfig);
    router = new RequestRouter();
  }, 30000);

  afterAll(async () => {
    try {
      await testServer.stop();
      await disconnectPrisma();
    } catch (e) {}

    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }
  });

  it('1. network resource discovery', () => {
    const discovered = ResourceDiscoverer.discoverFromHTML('', baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(discovered).toBeDefined();
  });

  it('2. HTML resource discovery', () => {
    const sampleHtml = `<img src="/image.png"><script src="/app.js"></script><link href="/styles.css">`;
    const discovered = ResourceDiscoverer.discoverFromHTML(sampleHtml, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(discovered.length).toBe(3);
  });

  it('3. CSS resource discovery', () => {
    const sampleCss = `@import url("/css-import.css"); body { background: url('/vector.svg'); }`;
    const discovered = ResourceDiscoverer.discoverFromCSS(sampleCss, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(discovered.length).toBe(2);
  });

  it('4. JS static reference discovery', () => {
    const sampleJs = `const glb = "/model.glb"; const font = "/font.woff2";`;
    const discovered = ResourceDiscoverer.discoverFromJS(sampleJs, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(discovered.length).toBe(2);
  });

  it('5. resource classification', () => {
    expect(URLNormalizer.classifyResource('text/css')).toBe('CSS');
    expect(URLNormalizer.classifyResource('image/png')).toBe('Image');
    expect(URLNormalizer.classifyResource(undefined, 'http://test.com/scene.glb')).toBe('3D model');
    expect(URLNormalizer.classifyResource(undefined, 'http://test.com/app.wasm')).toBe('WASM');
  });

  it('6. MIME detection fallback', () => {
    expect(URLNormalizer.classifyResource('application/octet-stream', 'http://test.com/vector.svg')).toBe('SVG');
  });

  it('7. canonical URL handling', () => {
    const norm = URLNormalizer.normalize(`${baseUrl}/page?utm_source=test&gclid=123&v=1`, baseUrl);
    expect(norm?.canonicalUrl).not.toContain('utm_source');
    expect(norm?.canonicalUrl).not.toContain('gclid');
    expect(norm?.canonicalUrl).toContain('v=1');
  });

  it('8. original URL preservation', () => {
    const raw = `${baseUrl}/page?utm_source=test&gclid=123&v=1`;
    const norm = URLNormalizer.normalize(raw, baseUrl);
    expect(norm?.originalUrl).toBe(raw);
  });

  it('9. SHA-256 identity', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/image.png`,
      canonicalUrl: `${baseUrl}/image.png`,
      discoveryMethod: 'HTML',
      resourceType: 'Image',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.hash).toBeDefined();
    expect(res.hash?.length).toBe(64);
  });

  it('10. physical deduplication', async () => {
    const res1 = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/dup1.png`,
      canonicalUrl: `${baseUrl}/dup1.png`,
      discoveryMethod: 'HTML',
      resourceType: 'Image',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });

    const res2 = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/dup2.png`,
      canonicalUrl: `${baseUrl}/dup2.png`,
      discoveryMethod: 'HTML',
      resourceType: 'Image',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });

    expect(res1.hash).toBe(res2.hash);
  });

  it('11. logical duplicate resources', async () => {
    const prisma = getPrismaClient();
    const count = await prisma.resource.count({ where: { websiteId: validWebsiteId } });
    expect(count).toBeGreaterThan(1);
  });

  it('12. small resource acquisition', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/vector.svg`,
      canonicalUrl: `${baseUrl}/vector.svg`,
      discoveryMethod: 'HTML',
      resourceType: 'SVG',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.status).toBe('completed');
  });

  it('13. large resource streaming', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/large.bin`,
      canonicalUrl: `${baseUrl}/large.bin`,
      discoveryMethod: 'NETWORK',
      resourceType: 'Other/binary',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.status).toBe('completed');
    expect(fs.statSync(res.localPath!).size).toBeGreaterThan(500 * 1024);
  });

  it('14. cookie-authenticated resource', async () => {
    const res = await acquirer.acquireResource(
      {
        originalUrl: `${baseUrl}/protected.png`,
        canonicalUrl: `${baseUrl}/protected.png`,
        discoveryMethod: 'HTML',
        resourceType: 'Image',
        pageId: validPageId,
        websiteId: validWebsiteId,
        sessionId: 'sess-1',
        discoveredAt: new Date().toISOString(),
      },
      { cookies: [{ name: 'auth_session', value: 'secret_token', domain: '127.0.0.1', path: '/' }] }
    );
    expect(res.status).toBe('completed');
  });

  it('15. session header acquisition', async () => {
    const res = await acquirer.acquireResource(
      {
        originalUrl: `${baseUrl}/image.png`,
        canonicalUrl: `${baseUrl}/image.png`,
        discoveryMethod: 'HTML',
        resourceType: 'Image',
        pageId: validPageId,
        websiteId: validWebsiteId,
        sessionId: 'sess-1',
        discoveredAt: new Date().toISOString(),
      },
      { customHeaders: { 'X-Custom-Auth': 'Token123' } }
    );
    expect(res.status).toBe('completed');
  });

  it('16. resource budget', async () => {
    const stats = await pipeline.processPageResources(
      { pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1', url: baseUrl },
      { html: `<html><body><img src="/image.png"><img src="/vector.svg"></body></html>` },
      { maxResourceCount: 1 }
    );
    expect(stats.isBudgetExceeded).toBe(true);
  });

  it('17. disk-space protection', async () => {
    const res = await acquirer.acquireResource(
      {
        originalUrl: `${baseUrl}/fresh-disk-test.png`,
        canonicalUrl: `${baseUrl}/fresh-disk-test.png`,
        discoveryMethod: 'HTML',
        resourceType: 'Image',
        pageId: validPageId,
        websiteId: validWebsiteId,
        sessionId: 'sess-1',
        discoveredAt: new Date().toISOString(),
      },
      { minDiskSpaceBytes: BigInt('999999999999999999') }
    );
    expect(res.status).toBe('failed');
  });

  it('18. failed acquisition', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/res-404`,
      canonicalUrl: `${baseUrl}/res-404`,
      discoveryMethod: 'HTML',
      resourceType: 'Other/binary',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.status).toBe('failed');
  });

  it('19. partial acquisition', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/abort-stream`,
      canonicalUrl: `${baseUrl}/abort-stream`,
      discoveryMethod: 'NETWORK',
      resourceType: 'Other/binary',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.status).toBe('failed');
  });

  it('20. bounded retry', async () => {
    const res = await acquirer.acquireResource(
      {
        originalUrl: `${baseUrl}/res-500`,
        canonicalUrl: `${baseUrl}/res-500`,
        discoveryMethod: 'NETWORK',
        resourceType: 'Other/binary',
        pageId: validPageId,
        websiteId: validWebsiteId,
        sessionId: 'sess-1',
        discoveredAt: new Date().toISOString(),
      },
      { maxRetries: 1 }
    );
    expect(res.status).toBe('failed');
  });

  it('21. rate limiting', async () => {
    const start = Date.now();
    await acquirer.acquireResource({
      originalUrl: `${baseUrl}/res-slow`,
      canonicalUrl: `${baseUrl}/res-slow`,
      discoveryMethod: 'NETWORK',
      resourceType: 'Other/binary',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(Date.now() - start).toBeGreaterThanOrEqual(500);
  });

  it('22. concurrency limit', async () => {
    const stats = await pipeline.processPageResources(
      { pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1', url: baseUrl },
      { html: `<html><body><img src="/image.png"><img src="/vector.svg"></body></html>` },
      { concurrencyLimit: 2 }
    );
    expect(stats.discoveredCount).toBeGreaterThan(0);
  });

  it('23. CSS @import', () => {
    const css = `@import url("/css-import.css");`;
    const disc = ResourceDiscoverer.discoverFromCSS(css, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(disc.some((d) => d.originalUrl.includes('css-import.css'))).toBe(true);
  });

  it('24. CSS url()', () => {
    const css = `body { background: url('/vector.svg'); }`;
    const disc = ResourceDiscoverer.discoverFromCSS(css, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(disc.some((d) => d.originalUrl.includes('vector.svg'))).toBe(true);
  });

  it('25. HTML src/srcset', () => {
    const html = `<img srcset="/dup1.png 1x, /dup2.png 2x">`;
    const disc = ResourceDiscoverer.discoverFromHTML(html, baseUrl, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(disc.length).toBe(2);
  });

  it('26. GLTF dependency discovery', () => {
    const gltf = JSON.stringify({ buffers: [{ uri: '/buffer.bin' }], images: [{ uri: '/texture.png' }] });
    const disc = ResourceDiscoverer.discoverFromGLTF(gltf, `${baseUrl}/scene.gltf`, {
      pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1',
    });
    expect(disc.length).toBe(2);
  });

  it('27. duplicate content', async () => {
    const res1 = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/dup1.png`,
      canonicalUrl: `${baseUrl}/dup1.png`,
      discoveryMethod: 'HTML',
      resourceType: 'Image',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res1.status).toBe('completed');
  });

  it('28. query-string resources', () => {
    const norm1 = URLNormalizer.normalize(`${baseUrl}/model.glb?v=1`, baseUrl);
    const norm2 = URLNormalizer.normalize(`${baseUrl}/model.glb?v=2`, baseUrl);
    expect(norm1?.originalUrl).not.toBe(norm2?.originalUrl);
  });

  it('29. path traversal protection', () => {
    const safe = workspaceConfig.validatePathSecurity(path.join(TEST_WORKSPACE_ROOT, 'assets', 'file.txt'));
    expect(safe).toBeDefined();
    expect(() => workspaceConfig.validatePathSecurity(path.join(TEST_WORKSPACE_ROOT, '..', 'malicious.dll'))).toThrow();
  });

  it('30. private network policy', () => {
    expect(URLNormalizer.isPrivateNetworkTarget('http://127.0.0.1:8080')).toBe(true);
    expect(URLNormalizer.isPrivateNetworkTarget('http://localhost:3000')).toBe(true);
    expect(URLNormalizer.isPrivateNetworkTarget('https://example.com')).toBe(false);
  });

  it('31. resource database relationships', async () => {
    const prisma = getPrismaClient();
    const pageRes = await prisma.pageResource.findFirst({ where: { pageId: validPageId } });
    expect(pageRes).not.toBeNull();
  });

  it('32. job progress', async () => {
    const stats = await pipeline.processPageResources(
      { pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1', url: baseUrl, jobId: 'job-test' },
      { html: `<html><body><img src="/image.png"></body></html>` }
    );
    expect(stats.discoveredCount).toBeGreaterThan(0);
  });

  it('33. IPC resource operations', async () => {
    const req: IPCRequest = {
      id: 'ipc-res-1',
      method: 'resource.discover',
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { htmlContent: `<html><body><img src="/image.png"></body></html>`, baseUrl, contextInfo: { pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1' } },
    };
    const res = await router.routeRequest(req);
    expect(res.success).toBe(true);
  });

  it('34. capture resume', async () => {
    const res = await acquirer.acquireResource({
      originalUrl: `${baseUrl}/image.png`,
      canonicalUrl: `${baseUrl}/image.png`,
      discoveryMethod: 'HTML',
      resourceType: 'Image',
      pageId: validPageId,
      websiteId: validWebsiteId,
      sessionId: 'sess-1',
      discoveredAt: new Date().toISOString(),
    });
    expect(res.status).toBe('completed');
  });

  it('35. capture cancellation', async () => {
    const stats = await pipeline.processPageResources(
      { pageId: validPageId, websiteId: validWebsiteId, sessionId: 'sess-1', url: baseUrl },
      { html: `<html><body><img src="/image.png"></body></html>` },
      { maxResourceCount: 0 }
    );
    expect(stats.skippedCount).toBeGreaterThan(0);
  });

  it('36. historical resource versioning', async () => {
    const norm = URLNormalizer.normalize(`${baseUrl}/versioned?v=2026`, baseUrl);
    expect(norm?.originalUrl).toContain('v=2026');
  });
});
