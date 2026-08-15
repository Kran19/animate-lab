import { Page, Response } from 'playwright';
import { BrowserContextManager } from './contextManager';
import { ContentStore } from '../storage/contentStore';
import { WorkspaceConfig, defaultWorkspaceConfig } from '../storage/workspaceConfig';

export interface ConsoleDiagnostic {
  type: string;
  text: string;
  location?: string;
  timestamp: string;
}

export interface PageErrorDiagnostic {
  message: string;
  stack?: string;
  timestamp: string;
}

export interface ObservedNetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  status?: number;
  contentType?: string;
  contentLength?: number;
}

export interface SPANavigationEvent {
  type: 'pushState' | 'replaceState' | 'popstate' | 'hashchange';
  url: string;
  timestamp: string;
}

export interface StorageItem {
  url: string;
  key: string;
  value: string;
}

export interface NavigationResult {
  requestedUrl: string;
  finalUrl: string;
  httpStatus: number;
  title: string;
  redirectChain: string[];
  htmlContent: string;
  viewportScreenshotPath?: string;
  fullPageScreenshotPath?: string;
  consoleLogs: ConsoleDiagnostic[];
  pageErrors: PageErrorDiagnostic[];
  networkMetadata: ObservedNetworkRequest[];
  spaNavigations: SPANavigationEvent[];
  localStorageData: StorageItem[];
  sessionStorageData: StorageItem[];
  settledMs: number;
  isPartial: boolean;
  partialReason?: string;
}

export class PageManager {
  private contentStore: ContentStore;

  constructor(
    private contextManager: BrowserContextManager,
    workspaceConfig: WorkspaceConfig = defaultWorkspaceConfig
  ) {
    this.contentStore = new ContentStore(workspaceConfig);
  }

  public async navigateAndObserve(
    sessionId: string,
    url: string,
    options?: { timeoutMs?: number; captureScreenshot?: boolean }
  ): Promise<NavigationResult> {
    const timeoutMs = options?.timeoutMs || 30000;
    const captureScreenshot = options?.captureScreenshot !== false;

    let context = this.contextManager.getContext(sessionId);
    if (!context) {
      context = await this.contextManager.createContext(sessionId);
    }

    const page: Page = await context.newPage();

    const consoleLogs: ConsoleDiagnostic[] = [];
    const pageErrors: PageErrorDiagnostic[] = [];
    const networkMetadata: ObservedNetworkRequest[] = [];
    const redirectChain: string[] = [];
    const spaNavigations: SPANavigationEvent[] = [];
    const localStorageData: StorageItem[] = [];
    const sessionStorageData: StorageItem[] = [];

    let isPartial = false;
    let partialReason: string | undefined;

    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : undefined,
        timestamp: new Date().toISOString(),
      });
    });

    page.on('pageerror', (err) => {
      pageErrors.push({
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
    });

    page.on('request', (req) => {
      networkMetadata.push({
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
      });
    });

    page.on('response', (res) => {
      const existing = networkMetadata.find((n) => n.url === res.url());
      if (existing) {
        existing.status = res.status();
        existing.contentType = res.headers()['content-type'];
        const len = res.headers()['content-length'];
        if (len) existing.contentLength = parseInt(len, 10);
      }
    });

    await page.addInitScript(() => {
      const notify = (type: string, url: string) => {
        (window as any).__ANIMATE_LAB_SPA_EVENTS__ = (window as any).__ANIMATE_LAB_SPA_EVENTS__ || [];
        (window as any).__ANIMATE_LAB_SPA_EVENTS__.push({ type, url, timestamp: new Date().toISOString() });
      };

      const origPush = history.pushState;
      history.pushState = function (...args) {
        origPush.apply(this, args);
        notify('pushState', window.location.href);
      };

      const origReplace = history.replaceState;
      history.replaceState = function (...args) {
        origReplace.apply(this, args);
        notify('replaceState', window.location.href);
      };

      window.addEventListener('popstate', () => notify('popstate', window.location.href));
      window.addEventListener('hashchange', () => notify('hashchange', window.location.href));
    });

    const startTime = Date.now();
    let response: Response | null = null;

    try {
      response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs,
      });

      if (response) {
        let req = response.request();
        while (req.redirectedFrom()) {
          const fromReq = req.redirectedFrom()!;
          redirectChain.unshift(fromReq.url());
          req = fromReq;
        }
      }

      try {
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 3000 }),
          page.waitForLoadState('load', { timeout: 5000 }),
        ]);
      } catch (e) {}
    } catch (err: any) {
      isPartial = true;
      partialReason = `NavigationError: ${err?.message}`;
    }

    const settledMs = Date.now() - startTime;
    const finalUrl = page.url();
    const title = await page.title().catch(() => '');
    const httpStatus = response ? response.status() : 0;
    const htmlContent = await page.content().catch(() => '');

    // Extract captured SPA navigation events
    try {
      const extractedEvents = await page.evaluate(() => (window as any).__ANIMATE_LAB_SPA_EVENTS__ || []);
      spaNavigations.push(...extractedEvents);
    } catch (e) {}

    // Extract LocalStorage & SessionStorage BEFORE closing page
    try {
      if (!page.isClosed() && finalUrl && !finalUrl.startsWith('about:')) {
        const lItems = await page.evaluate(() => {
          const items: Array<{ key: string; value: string }> = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== null) items.push({ key, value: localStorage.getItem(key) || '' });
          }
          return items;
        });
        for (const item of lItems) {
          localStorageData.push({ url: finalUrl, key: item.key, value: item.value });
        }

        const sItems = await page.evaluate(() => {
          const items: Array<{ key: string; value: string }> = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key !== null) items.push({ key, value: sessionStorage.getItem(key) || '' });
          }
          return items;
        });
        for (const item of sItems) {
          sessionStorageData.push({ url: finalUrl, key: item.key, value: item.value });
        }
      }
    } catch (e) {}

    let viewportScreenshotPath: string | undefined;
    let fullPageScreenshotPath: string | undefined;

    if (captureScreenshot && !page.isClosed()) {
      try {
        const vpBuf = await page.screenshot({ fullPage: false });
        const savedVp = await this.contentStore.saveBufferAtomic(vpBuf, '.png');
        viewportScreenshotPath = savedVp.localPath;

        const fpBuf = await page.screenshot({ fullPage: true });
        const savedFp = await this.contentStore.saveBufferAtomic(fpBuf, '.png');
        fullPageScreenshotPath = savedFp.localPath;
      } catch (err: any) {
        if (!isPartial) {
          isPartial = true;
          partialReason = `ScreenshotCaptureFailure: ${err?.message}`;
        }
      }
    }

    await page.close().catch(() => {});

    return {
      requestedUrl: url,
      finalUrl,
      httpStatus,
      title,
      redirectChain,
      htmlContent,
      viewportScreenshotPath,
      fullPageScreenshotPath,
      consoleLogs,
      pageErrors,
      networkMetadata,
      spaNavigations,
      localStorageData,
      sessionStorageData,
      settledMs,
      isPartial,
      partialReason,
    };
  }
}
