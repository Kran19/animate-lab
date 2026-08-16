export interface SectionAssetInventoryItem {
  assetId: string;
  originalUrl: string;
  localPath: string;
  exportPath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  usageLocation: string; // e.g. "HeroSection > background-image"
  owningSectionId: string;
  ownershipScope: 'GLOBAL' | 'PAGE_SHARED' | 'SECTION_SHARED' | 'SECTION_LOCAL';
  isRequired: boolean;
  isAnimated: boolean;
  dimensions?: { width: number; height: number };
  fallbackStrategy?: string;
}

export class AssetOwnershipAnalyzer {
  /**
   * Analyzes page assets and distributes them cleanly to owning sections without duplicate bloat.
   */
  public static distributeAssets(
    assets: Array<{
      id: string;
      originalUrl: string;
      localPath: string;
      mimeType: string;
      sizeBytes?: number;
      contentHash?: string;
    }>,
    sections: Array<{
      sectionId: string;
      domSelector: string;
      htmlContent: string;
      cssContent: string;
    }>
  ): SectionAssetInventoryItem[] {
    const inventory: SectionAssetInventoryItem[] = [];

    // Map each asset to the sections where its URL or filename is referenced
    for (const asset of assets) {
      const filename = asset.originalUrl.split('/').pop() || asset.id;
      const matchingSections = sections.filter(
        (s) => s.htmlContent.includes(asset.originalUrl) ||
               s.htmlContent.includes(filename) ||
               s.cssContent.includes(asset.originalUrl) ||
               s.cssContent.includes(filename)
      );

      let scope: SectionAssetInventoryItem['ownershipScope'] = 'SECTION_LOCAL';
      let owningSectionId = matchingSections.length > 0 ? matchingSections[0].sectionId : 'global';

      if (matchingSections.length > 1) {
        scope = 'SECTION_SHARED';
      } else if (matchingSections.length === 0) {
        scope = 'GLOBAL';
        owningSectionId = 'global';
      }

      inventory.push({
        assetId: asset.id,
        originalUrl: asset.originalUrl,
        localPath: asset.localPath,
        exportPath: `assets/${filename}`,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes || 1024,
        contentHash: asset.contentHash || `sha256-${asset.id.slice(0, 8)}`,
        usageLocation: `${owningSectionId} > media-reference`,
        owningSectionId,
        ownershipScope: scope,
        isRequired: true,
        isAnimated: asset.mimeType.includes('json') || asset.mimeType.includes('video'),
        fallbackStrategy: 'Include inline placeholder if network fetch fails.',
      });
    }

    return inventory;
  }
}
