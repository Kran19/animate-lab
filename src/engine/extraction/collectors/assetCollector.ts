import { FIRAssets, FIRAssetEvidence } from '../../domain/fir/sectionFIR';

export interface RawAssetObservation {
  id?: string;
  type: string;
  sourceUrl: string;
  resolvedUrl?: string;
  localPath: string;
  exportPath?: string;
  sha256?: string;
  mimeType?: string;
  byteLength?: number;
  dimensions?: { width: number; height: number };
  discoveredBy?: string;
}

export class AssetEvidenceCollector {
  /**
   * Collects isolated, immutable Asset evidence with deterministic sorting and deduplication.
   */
  public static collect(rawAssets: RawAssetObservation[]): FIRAssets {
    const seenHashes = new Set<string>();
    const assets: FIRAssetEvidence[] = [];

    const sortedRaw = [...rawAssets].sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));

    sortedRaw.forEach((ra, idx) => {
      const sha256 = ra.sha256 || `mock-sha256-${idx}-${ra.sourceUrl}`;
      const assetId = ra.id || `asset-${idx}`;
      const exportPath = ra.exportPath || `assets/${ra.type}_${idx}.${this.extensionForMime(ra.mimeType)}`;

      // Deduplicate identical asset hashes
      if (!seenHashes.has(sha256)) {
        seenHashes.add(sha256);
        assets.push({
          assetId,
          type: (ra.type as any) || 'image',
          sourceUrl: ra.sourceUrl,
          resolvedUrl: ra.resolvedUrl || ra.sourceUrl,
          localPath: ra.localPath,
          exportPath,
          sha256,
          mimeType: ra.mimeType || 'image/webp',
          byteLength: ra.byteLength || 1024,
          dimensions: ra.dimensions,
          discoveredBy: (ra.discoveredBy as any) || 'network_response',
          isCritical: true,
        });
      }
    });

    const totalSizeBytes = assets.reduce((acc, curr) => acc + curr.byteLength, 0);

    return {
      totalAssetsCount: assets.length,
      totalSizeBytes,
      assets,
    };
  }

  private static extensionForMime(mime?: string): string {
    if (!mime) return 'bin';
    if (mime.includes('svg')) return 'svg';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('png')) return 'png';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('font') || mime.includes('woff2')) return 'woff2';
    if (mime.includes('mp4')) return 'mp4';
    return 'bin';
  }
}
