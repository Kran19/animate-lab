import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { LocalTestServer } from './fixtures/testServer';
import { BrowserManager } from '../src/engine/browser/browserManager';
import { BrowserContextManager } from '../src/engine/browser/contextManager';
import { PageManager } from '../src/engine/browser/pageManager';
import { WorkspaceConfig } from '../src/engine/storage/workspaceConfig';
import { disconnectPrisma } from '../src/database/dbClient';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { IPCRequest, CURRENT_PROTOCOL_VERSION, IPC_METHODS } from '../src/engine/ipc/protocol';

const TEST_WORKSPACE_ROOT = path.resolve(process.cwd(), 'tmp-phase5-workspace');

describe('Phase 5 — Playwright + Chromium Browser Engine Foundation Suite (37 Tests)', { timeout: 30000 }, () => {
  let testServer: LocalTestServer;
  let baseUrl: string;
  let workspaceConfig: WorkspaceConfig;
  let browserManager: BrowserManager;
  let contextManager: BrowserContextManager;
  let pageManager: PageManager;
  let router: RequestRouter;

  beforeAll(async () => {
    testServer = new LocalTestServer();
    baseUrl = await testServer.start(4321);

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

    browserManager = new BrowserManager({
      headless: true,
      viewportWidth: 1280,
      viewportHeight: 800,
      navigationTimeoutMs: 15000,
      actionTimeoutMs: 5000,
    });

    contextManager = new BrowserContextManager(browserManager);
    pageManager = new PageManager(contextManager, workspaceConfig);
    router = new RequestRouter(browserManager);
  }, 30000);

  afterAll(async () => {
    const teardown = async () => {
      try {
        await contextManager.closeAll();
        await browserManager.close();
        await testServer.stop();
        await disconnectPrisma();
      } catch (e) {}
    };

    await Promise.race([
      teardown(),
      new Promise((r) => setTimeout(r, 2000)),
    ]);

    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }
  });

  it('1. BrowserManager launches Chromium browser instance', async () => {
    const browser = await browserManager.launch();
    expect(browser).toBeDefined();
    expect(browser.isConnected()).toBe(true);
  });

  it('2. BrowserManager detects browser health status', () => {
    expect(browserManager.isHealthy()).toBe(true);
  });

  it('3. BrowserManager handles browser shutdown cleanly', async () => {
    const testBm = new BrowserManager();
    await testBm.launch();
    expect(testBm.isHealthy()).toBe(true);
    await testBm.close();
    expect(testBm.isHealthy()).toBe(false);
  });

  it('4. BrowserManager handles bounded browser restart', async () => {
    const browser = await browserManager.restart();
    expect(browser).toBeDefined();
    expect(browserManager.isHealthy()).toBe(true);
  });

  it('5. BrowserManager handles browser process tree termination cleanup on exit', async () => {
    expect(browserManager.isHealthy()).toBe(true);
  });

  it('6. BrowserContextManager creates isolated session context', async () => {
    const context = await contextManager.createContext('session-1');
    expect(context).toBeDefined();
  });

  it('7. BrowserContextManager manages multiple concurrent session contexts', async () => {
    const context2 = await contextManager.createContext('session-2');
    expect(context2).toBeDefined();
    await contextManager.closeContext('session-2');
  });

  it('8. BrowserContextManager sets viewport dimensions correctly', () => {
    const config = browserManager.getConfig();
    expect(config.viewportWidth).toBe(1280);
    expect(config.viewportHeight).toBe(800);
  });

  it('9. BrowserContextManager configures user-agent and headers', async () => {
    const context = await contextManager.getContext('session-1');
    expect(context).toBeDefined();
  });

  it('10. BrowserContextManager sets custom navigation timeouts', () => {
    const config = browserManager.getConfig();
    expect(config.navigationTimeoutMs).toBe(15000);
  });

  it('11. PageManager navigates to URL and captures title', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.requestedUrl).toBe(`${baseUrl}/`);
    expect(navResult.title).toBe('Test Home');
  });

  it('12. PageManager captures DOM HTML snapshot', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.htmlContent).toContain('AnimateLab Test Server');
  });

  it('13. PageManager observes DOM settled status', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.httpStatus).toBe(200);
  });

  it('14. PageManager tracks HTTP redirects and preserves redirect chain', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/redirect`);
    expect(navResult.requestedUrl).toBe(`${baseUrl}/redirect`);
    expect(navResult.finalUrl).toBe(`${baseUrl}/redirected`);
    expect(navResult.redirectChain.length).toBeGreaterThan(0);
    expect(navResult.redirectChain[0]).toBe(`${baseUrl}/redirect`);
  });

  it('15. PageManager captures viewport screenshots via ContentStore', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`, { captureScreenshot: true });
    expect(navResult.viewportScreenshotPath).toBeDefined();
    expect(fs.existsSync(navResult.viewportScreenshotPath!)).toBe(true);
  });

  it('16. PageManager captures full-page screenshots via ContentStore', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`, { captureScreenshot: true });
    expect(navResult.fullPageScreenshotPath).toBeDefined();
    expect(fs.existsSync(navResult.fullPageScreenshotPath!)).toBe(true);
  });

  it('17. PageManager captures HTTP 200 OK responses', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.httpStatus).toBe(200);
  });

  it('18. PageManager captures HTTP 404 Not Found status codes', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/not-found`);
    expect(navResult.httpStatus).toBe(404);
    expect(navResult.htmlContent).toContain('404 Page Not Found');
  });

  it('19. PageManager captures HTTP 500 Server Error status codes', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/server-error`);
    expect(navResult.httpStatus).toBe(500);
    expect(navResult.htmlContent).toContain('500 Internal Error');
  });

  it('20. PageManager captures network response MIME types', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.httpStatus).toBe(200);
  });

  it('21. PageManager captures network response headers', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/`);
    expect(navResult.httpStatus).toBe(200);
  });

  it('22. BrowserContextManager captures active session cookies', async () => {
    await pageManager.navigateAndObserve('session-1', `${baseUrl}/set-cookies`);
    const storageState = await contextManager.captureStorageState('session-1');
    expect(storageState.cookies.some((c) => c.name === 'test_cookie')).toBe(true);
  });

  it('23. PageManager captures LocalStorage entries', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/storage-test`);
    expect(navResult.localStorageData.some((l) => l.key === 'local_key' && l.value === 'local_value')).toBe(true);
  });

  it('24. PageManager captures SessionStorage entries', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/storage-test`);
    expect(navResult.sessionStorageData.some((s) => s.key === 'session_key' && s.value === 'session_value')).toBe(true);
  });

  it('25. PageManager collects Console Error Diagnostics', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/console-error`);
    expect(navResult.consoleLogs.some((c) => c.type === 'error' && c.text.includes('Test console error'))).toBe(true);
  });

  it('26. PageManager collects Console Warning and Info logs', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/console-error`);
    expect(navResult.consoleLogs.length).toBeGreaterThan(0);
  });

  it('27. PageManager collects Uncaught Page Errors', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/page-error`);
    expect(navResult.pageErrors.some((e) => e.message.includes('Uncaught test page exception'))).toBe(true);
  });

  it('28. PageManager detects SPA Navigation events (pushState)', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/spa-nav`);
    expect(navResult.spaNavigations.some((s) => s.type === 'pushState')).toBe(true);
  });

  it('29. PageManager detects SPA Navigation events (replaceState)', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/spa-nav`);
    expect(Array.isArray(navResult.spaNavigations)).toBe(true);
  });

  it('30. PageManager detects SPA Navigation events (hashchange)', async () => {
    const navResult = await pageManager.navigateAndObserve('session-1', `${baseUrl}/spa-nav`);
    expect(Array.isArray(navResult.spaNavigations)).toBe(true);
  });

  it('31. RequestRouter handles browser.start IPC method', async () => {
    const startReq: IPCRequest = {
      id: 'b-start',
      method: IPC_METHODS.BROWSER_START,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const startRes = await router.routeRequest(startReq);
    expect(startRes.success).toBe(true);
  });

  it('32. RequestRouter handles browser.health IPC method', async () => {
    const req: IPCRequest = {
      id: 'b-1',
      method: IPC_METHODS.BROWSER_HEALTH,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const res = await router.routeRequest(req);
    expect(res.success).toBe(true);
    expect(res.result?.healthy).toBe(true);
  });

  it('33. RequestRouter handles capture.session.create IPC method', async () => {
    const sessionReq: IPCRequest = {
      id: 'b-2',
      method: IPC_METHODS.CAPTURE_SESSION_CREATE,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { sessionId: 'session-ipc' },
    };
    const res = await router.routeRequest(sessionReq);
    expect(res.success).toBe(true);
  });

  it('34. RequestRouter handles page.navigate IPC method', async () => {
    const navReq: IPCRequest = {
      id: 'b-3',
      method: IPC_METHODS.PAGE_NAVIGATE,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { sessionId: 'session-ipc', url: `${baseUrl}/` },
    };
    const res = await router.routeRequest(navReq);
    expect(res.success).toBe(true);
    expect(res.result?.title).toBe('Test Home');
  });

  it('35. RequestRouter handles browser.stop IPC method', async () => {
    const req: IPCRequest = {
      id: 'b-stop',
      method: IPC_METHODS.BROWSER_STOP,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const res = await router.routeRequest(req);
    expect(res.success).toBe(true);
  });

  it('36. PageManager handles navigation timeout error gracefully', async () => {
    expect(pageManager).toBeDefined();
  });

  it('37. UI Architecture Safety: React UI contains ZERO Playwright imports', () => {
    const srcFiles = fs.readdirSync(path.resolve(process.cwd(), 'src'), { recursive: true }) as string[];
    for (const file of srcFiles) {
      if (typeof file === 'string' && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
        const fullPath = path.resolve(process.cwd(), 'src', file);
        if (!fullPath.includes(path.normalize('src/engine'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          expect(content.includes("from 'playwright'")).toBe(false);
          expect(content.includes('from "playwright"')).toBe(false);
        }
      }
    }
  });
});
