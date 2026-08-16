import { Browser, Page } from 'playwright';
import { BrowserManager } from '../browser/browserManager';

export interface ViewportCaptureResult {
  viewportName: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';
  width: number;
  height: number;
  domSnapshot: string;
  screenshotBase64: string;
  scrollWidth: number;
  scrollHeight: number;
  mediaAssetsFound: Array<{ url: string; type: string; mimeType: string }>;
  canvasDetectedCount: number;
}

export interface RealBrowserPageForensics {
  url: string;
  title: string;
  captureTimestamp: string;
  viewports: ViewportCaptureResult[];
  computedStyles: Record<string, Record<string, string>>;
  elementGeometries: Array<{
    selector: string;
    tagName: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  networkRequests: Array<{
    url: string;
    method: string;
    status: number;
    mimeType: string;
    sizeBytes: number;
  }>;
  runtimeConsoleLogs: string[];
}

export class RealBrowserCapture {
  private browserManager: BrowserManager;

  constructor(browserManager?: BrowserManager) {
    this.browserManager = browserManager || new BrowserManager();
  }

  /**
   * Captures multi-viewport DOM, geometry, and network forensics from a live website.
   * STRICT SAFETY: Captured JavaScript is executed ONLY inside the sandboxed Playwright browser context.
   */
  public async capturePageForensics(url: string): Promise<RealBrowserPageForensics> {
    const browser = await this.browserManager.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();
    const networkRequests: RealBrowserPageForensics['networkRequests'] = [];
    const runtimeConsoleLogs: string[] = [];

    // Track network events
    page.on('response', async (response) => {
      try {
        const req = response.request();
        networkRequests.push({
          url: response.url(),
          method: req.method(),
          status: response.status(),
          mimeType: response.headers()['content-type'] || 'application/octet-stream',
          sizeBytes: Number(response.headers()['content-length'] || '0'),
        });
      } catch {
        // Safe swallow on closed response stream
      }
    });

    page.on('console', (msg) => {
      runtimeConsoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const title = await page.title();

      const viewportsToCapture: Array<{ name: ViewportCaptureResult['viewportName']; width: number; height: number }> = [
        { name: 'Desktop', width: 1440, height: 900 },
        { name: 'Laptop', width: 1024, height: 768 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 812 },
      ];

      const viewports: ViewportCaptureResult[] = [];

      for (const vp of viewportsToCapture) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(100);

        const domSnapshot = await page.content();
        const screenshotBuf = await page.screenshot({ fullPage: false });
        const scrollDimensions = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          canvasCount: document.querySelectorAll('canvas').length,
        }));

        viewports.push({
          viewportName: vp.name,
          width: vp.width,
          height: vp.height,
          domSnapshot,
          screenshotBase64: screenshotBuf.toString('base64'),
          scrollWidth: scrollDimensions.scrollWidth,
          scrollHeight: scrollDimensions.scrollHeight,
          mediaAssetsFound: [],
          canvasDetectedCount: scrollDimensions.canvasCount,
        });
      }

      // Extract bounding box geometries for major semantic sections
      const elementGeometries = await page.evaluate(() => {
        const elements = document.querySelectorAll('header, nav, main, section, article, footer, [data-section], canvas, video');
        const list: Array<{ selector: string; tagName: string; x: number; y: number; width: number; height: number }> = [];

        elements.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 20 && rect.height > 20) {
            const id = el.id ? `#${el.id}` : `.${el.className.toString().split(' ')[0] || `el-${idx}`}`;
            list.push({
              selector: id,
              tagName: el.tagName,
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        });
        return list;
      });

      await context.close();

      return {
        url,
        title,
        captureTimestamp: new Date().toISOString(),
        viewports,
        computedStyles: {},
        elementGeometries,
        networkRequests,
        runtimeConsoleLogs,
      };
    } catch (err: any) {
      await context.close().catch(() => {});
      throw new Error(`Real-browser capture failed for ${url}: ${err.message}`);
    }
  }
}
