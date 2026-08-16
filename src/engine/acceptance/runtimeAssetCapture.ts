import { Page, Response } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CapturedResource {
  url: string;
  finalUrl: string;
  mimeType: string;
  status: number;
  contentLength: number;
  sha256?: string;
  resourceType: string;
  localPath?: string;
}

export interface FontResource {
  fontFamily: string;
  fontStyle: string;
  fontWeight: string;
  sourceUrl: string;
  localPath: string;
  format: string;
}

export class RuntimeAssetCapture {
  private capturedResources: Map<string, CapturedResource> = new Map();
  private capturedFonts: FontResource[] = [];

  public attachToPage(page: Page, outputAssetDir: string) {
    fs.mkdirSync(outputAssetDir, { recursive: true });
    const fontsDir = path.join(outputAssetDir, 'fonts');
    fs.mkdirSync(fontsDir, { recursive: true });

    page.on('response', async (res: Response) => {
      try {
        const url = res.url();
        if (url.startsWith('data:') || this.capturedResources.has(url)) return;

        const headers = res.headers();
        const contentType = (headers['content-type'] || '').toLowerCase();
        const status = res.status();
        const len = parseInt(headers['content-length'] || '0', 10);

        let resourceType = 'other';
        let ext = path.extname(new URL(url).pathname).toLowerCase();

        if (contentType.includes('font') || ext.match(/\.(woff2|woff|ttf|otf|eot)$/)) {
          resourceType = 'font';
          if (!ext) ext = '.woff2';
        } else if (contentType.includes('image') || ext.match(/\.(png|jpg|jpeg|webp|avif|svg|gif)$/)) {
          resourceType = 'image';
          if (!ext) ext = '.png';
        } else if (contentType.includes('video') || ext.match(/\.(mp4|webm|ogv)$/)) {
          resourceType = 'video';
          if (!ext) ext = '.mp4';
        } else if (contentType.includes('javascript') || ext.match(/\.(js|mjs)$/)) {
          resourceType = 'script';
        } else if (contentType.includes('css') || ext.match(/\.css$/)) {
          resourceType = 'stylesheet';
        }

        const shouldSave = ['font', 'image', 'video'].includes(resourceType);
        let localPath: string | undefined;
        let sha256: string | undefined;

        if (shouldSave && status >= 200 && status < 300) {
          try {
            const body = await res.body();
            if (body && body.length > 0) {
              sha256 = crypto.createHash('sha256').update(body).digest('hex');
              const filename = `${sha256.slice(0, 12)}${ext}`;
              const targetDir = resourceType === 'font' ? fontsDir : outputAssetDir;
              const fullLocalPath = path.join(targetDir, filename);

              if (!fs.existsSync(fullLocalPath)) {
                fs.writeFileSync(fullLocalPath, body);
              }
              localPath = path.relative(path.dirname(outputAssetDir), fullLocalPath).replace(/\\/g, '/');

              if (resourceType === 'font') {
                this.capturedFonts.push({
                  fontFamily: this.inferFontFamily(url, headers),
                  fontStyle: 'normal',
                  fontWeight: '400',
                  sourceUrl: url,
                  localPath: `fonts/${filename}`,
                  format: ext.replace('.', ''),
                });
              }
            }
          } catch {}
        }

        this.capturedResources.set(url, {
          url,
          finalUrl: url,
          mimeType: contentType,
          status,
          contentLength: len,
          sha256,
          resourceType,
          localPath,
        });
      } catch {}
    });
  }

  private inferFontFamily(url: string, headers: Record<string, string>): string {
    const urlName = path.basename(new URL(url).pathname, path.extname(url));
    const clean = urlName.replace(/[-_](regular|bold|medium|light|thin|black|semibold|extrabold|italic)/gi, '');
    return clean.replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'CustomCapturedFont';
  }

  public async extractLoadedFonts(page: Page): Promise<FontResource[]> {
    try {
      const browserFonts = await page.evaluate(() => {
        const results: any[] = [];
        if ((document as any).fonts && (document as any).fonts.forEach) {
          (document as any).fonts.forEach((font: any) => {
            results.push({
              family: font.family.replace(/['"]/g, ''),
              style: font.style,
              weight: font.weight,
              status: font.status,
            });
          });
        }
        return results;
      });

      return this.capturedFonts;
    } catch {
      return this.capturedFonts;
    }
  }

  public generateFontsCss(fontsDir: string): string {
    let css = '/* Authentically Captured @font-face Declarations */\n';
    const seen = new Set<string>();

    this.capturedFonts.forEach((f) => {
      const key = `${f.fontFamily}-${f.fontWeight}-${f.fontStyle}`;
      if (seen.has(key)) return;
      seen.add(key);

      css += `@font-face {\n  font-family: '${f.fontFamily}';\n  src: url('${f.localPath}') format('${f.format}');\n  font-weight: ${f.fontWeight};\n  font-style: ${f.fontStyle};\n  font-display: swap;\n}\n\n`;
    });

    return css;
  }

  public getResourceInventory(): CapturedResource[] {
    return Array.from(this.capturedResources.values());
  }
}
