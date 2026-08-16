import { chromium, Browser, LaunchOptions } from 'playwright';

export interface BrowserConfig {
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  colorScheme?: 'dark' | 'light' | 'no-preference';
  deviceScaleFactor?: number;
  navigationTimeoutMs: number;
  actionTimeoutMs: number;
}

export const defaultBrowserConfig: BrowserConfig = {
  headless: true,
  viewportWidth: 1440,
  viewportHeight: 900,
  locale: 'en-US',
  timezone: 'America/New_York',
  colorScheme: 'dark',
  deviceScaleFactor: 1,
  navigationTimeoutMs: 30000,
  actionTimeoutMs: 10000,
};

export class BrowserManager {
  private browser: Browser | null = null;
  private isInitializing = false;
  private restartCount = 0;
  private maxRestarts = 3;

  constructor(private config: BrowserConfig = defaultBrowserConfig) {}

  public getConfig(): BrowserConfig {
    return this.config;
  }

  public isHealthy(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }

  public async launch(options?: Partial<LaunchOptions>): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (this.browser && this.browser.isConnected()) return this.browser;
    }

    this.isInitializing = true;
    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
        ...options,
      });

      this.browser.on('disconnected', () => {
        console.warn('[BrowserManager] Chromium browser disconnected unexpectedly.');
        this.browser = null;
        this.handleUnexpectedDisconnect();
      });

      this.restartCount = 0;
      return this.browser;
    } finally {
      this.isInitializing = false;
    }
  }

  public async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (err) {
        console.error('[BrowserManager] Error during browser close:', err);
      } finally {
        this.browser = null;
      }
    }
  }

  public async restart(): Promise<Browser> {
    await this.close();
    return this.launch();
  }

  private async handleUnexpectedDisconnect(): Promise<void> {
    if (this.restartCount < this.maxRestarts) {
      this.restartCount++;
      console.log(`[BrowserManager] Attempting bounded browser restart (${this.restartCount}/${this.maxRestarts})...`);
      try {
        await this.launch();
      } catch (err) {
        console.error('[BrowserManager] Bounded restart failed:', err);
      }
    } else {
      console.error('[BrowserManager] Maximum restart threshold reached. Manual restart required.');
    }
  }

  public getBrowser(): Browser | null {
    return this.browser;
  }
}

export const defaultBrowserManager = new BrowserManager();
