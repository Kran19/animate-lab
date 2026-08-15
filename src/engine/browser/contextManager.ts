import { Browser, BrowserContext, Cookie } from 'playwright';
import { BrowserManager, BrowserConfig, defaultBrowserConfig } from './browserManager';

export interface SessionStorageState {
  cookies: Cookie[];
  localStorage: Array<{ url: string; key: string; value: string }>;
  sessionStorage: Array<{ url: string; key: string; value: string }>;
}

export class BrowserContextManager {
  private activeContexts: Map<string, BrowserContext> = new Map();

  constructor(
    private browserManager: BrowserManager,
    private config: BrowserConfig = defaultBrowserConfig
  ) {}

  public async createContext(sessionId: string, customHeaders?: Record<string, string>): Promise<BrowserContext> {
    const browser = await this.browserManager.launch();

    const context = await browser.newContext({
      viewport: {
        width: this.config.viewportWidth,
        height: this.config.viewportHeight,
      },
      userAgent: this.config.userAgent || 'AnimateLab/1.0 (Desktop Engine; Observation Engine)',
      locale: this.config.locale,
      timezoneId: this.config.timezone,
      colorScheme: this.config.colorScheme,
      deviceScaleFactor: this.config.deviceScaleFactor,
      extraHTTPHeaders: customHeaders,
    });

    this.activeContexts.set(sessionId, context);
    return context;
  }

  public getContext(sessionId: string): BrowserContext | undefined {
    return this.activeContexts.get(sessionId);
  }

  public async captureStorageState(sessionId: string): Promise<SessionStorageState> {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`ContextNotFound: No active context found for session ${sessionId}`);
    }

    const cookies = await context.cookies();
    const localStorageData: Array<{ url: string; key: string; value: string }> = [];
    const sessionStorageData: Array<{ url: string; key: string; value: string }> = [];

    // Extract storage data from open pages
    for (const page of context.pages()) {
      try {
        const url = page.url();
        if (url && !url.startsWith('about:')) {
          const lData = await page.evaluate(() => {
            const items: Array<{ key: string; value: string }> = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key !== null) items.push({ key, value: localStorage.getItem(key) || '' });
            }
            return items;
          });
          for (const item of lData) {
            localStorageData.push({ url, key: item.key, value: item.value });
          }

          const sData = await page.evaluate(() => {
            const items: Array<{ key: string; value: string }> = [];
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key !== null) items.push({ key, value: sessionStorage.getItem(key) || '' });
            }
            return items;
          });
          for (const item of sData) {
            sessionStorageData.push({ url, key: item.key, value: item.value });
          }
        }
      } catch (e) {
        // Ignore page evaluation error on navigating pages
      }
    }

    return {
      cookies,
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
    };
  }

  public async closeContext(sessionId: string): Promise<void> {
    const context = this.activeContexts.get(sessionId);
    if (context) {
      try {
        await context.close();
      } catch (e) {
        console.error(`[BrowserContextManager] Error closing context for ${sessionId}:`, e);
      } finally {
        this.activeContexts.delete(sessionId);
      }
    }
  }

  public async closeAll(): Promise<void> {
    for (const sessionId of Array.from(this.activeContexts.keys())) {
      await this.closeContext(sessionId);
    }
  }
}
