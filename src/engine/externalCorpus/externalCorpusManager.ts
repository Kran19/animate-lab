import * as fs from 'fs';
import * as path from 'path';
import { NavigationForensicRecord } from '../browser/navigationForensics';

export type RouteStatus = 'DISCOVERED' | 'CAPTURED' | 'NOT_FOUND' | 'ACCESS_DENIED' | 'FAILED';

export interface RouteEntry {
  routePath: string;
  absoluteUrl: string;
  status: RouteStatus;
  discoveredAt: string;
  statusCode?: number;
  sectionCount?: number;
}

export interface ExternalCorpusManifest {
  corpusId: string;
  siteId: string;
  requestedUrl: string;
  finalUrl: string;
  origin: string;
  navigationForensics: NavigationForensicRecord;
  totalDiscoveredRoutes: number;
  totalCapturedRoutes: number;
  routes: RouteEntry[];
  corpusDirectory: string;
  createdAt: string;
}

export class ExternalCorpusManager {
  /**
   * Initializes or updates an external corpus target directory with manifest, routes, redirects, and status.
   */
  public static initializeCorpus(
    siteId: string,
    navRecord: NavigationForensicRecord,
    baseDir: string = path.join(process.cwd(), 'workspace-data', 'external-corpus')
  ): ExternalCorpusManifest {
    const corpusDir = path.join(baseDir, siteId);
    const subdirs = [
      path.join(corpusDir, 'captures'),
      path.join(corpusDir, 'evidence'),
      path.join(corpusDir, 'fir'),
      path.join(corpusDir, 'passports'),
      path.join(corpusDir, 'motion'),
      path.join(corpusDir, 'synthesis'),
      path.join(corpusDir, 'replay'),
      path.join(corpusDir, 'verification'),
      path.join(corpusDir, 'provenance'),
      path.join(corpusDir, 'reports'),
    ];

    subdirs.forEach((d) => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    const rootRoute: RouteEntry = {
      routePath: '/',
      absoluteUrl: navRecord.finalUrl,
      status: 'CAPTURED',
      discoveredAt: new Date().toISOString(),
      statusCode: 200,
    };

    const manifest: ExternalCorpusManifest = {
      corpusId: `ext_${siteId}`,
      siteId,
      requestedUrl: navRecord.requestedUrl,
      finalUrl: navRecord.finalUrl,
      origin: navRecord.finalOrigin,
      navigationForensics: navRecord,
      totalDiscoveredRoutes: 1,
      totalCapturedRoutes: 1,
      routes: [rootRoute],
      corpusDirectory: corpusDir,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(corpusDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    fs.writeFileSync(path.join(corpusDir, 'discovered-routes.json'), JSON.stringify([rootRoute], null, 2), 'utf-8');
    fs.writeFileSync(path.join(corpusDir, 'redirects.json'), JSON.stringify(navRecord.redirectChain, null, 2), 'utf-8');
    fs.writeFileSync(path.join(corpusDir, 'target-status.json'), JSON.stringify({ [navRecord.finalUrl]: 'CAPTURED' }, null, 2), 'utf-8');

    return manifest;
  }

  /**
   * Dynamically extracts valid internal route links from DOM HTML string.
   */
  public static discoverRoutesFromHtml(html: string, baseUrl: string): string[] {
    const origin = new URL(baseUrl).origin;
    const regex = /href=["']([^"']+)["']/gi;
    const discovered = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const link = match[1].trim();
      if (!link || link.startsWith('#') || link.startsWith('javascript:') || link.startsWith('mailto:') || link.startsWith('tel:')) {
        continue;
      }
      try {
        const resolved = new URL(link, baseUrl);
        if (resolved.origin === origin) {
          discovered.add(resolved.pathname);
        }
      } catch {}
    }

    return Array.from(discovered);
  }
}
