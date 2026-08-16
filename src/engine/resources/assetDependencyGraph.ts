export interface AssetNode {
  id: string;
  originalUrl: string;
  exportPath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  dimensions?: { width: number; height: number };
  scope: 'SECTION_LOCAL' | 'SECTION_SHARED' | 'GLOBAL';
  owningSectionId: string;
  isRequired: boolean;
}

export class AssetDependencyGraph {
  private nodes: Map<string, AssetNode> = new Map();

  public addAsset(asset: AssetNode): void {
    this.nodes.set(asset.id, asset);
  }

  public getAssetsForSection(sectionId: string): AssetNode[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.owningSectionId === sectionId || n.scope === 'SECTION_SHARED' || n.scope === 'GLOBAL'
    );
  }

  public getAllAssets(): AssetNode[] {
    return Array.from(this.nodes.values());
  }

  public computeAssetCompleteness(sectionId: string): {
    totalRequired: number;
    totalAvailable: number;
    completenessRatio: number;
  } {
    const assets = this.getAssetsForSection(sectionId);
    const totalRequired = assets.filter((a) => a.isRequired).length;
    const totalAvailable = assets.filter((a) => a.isRequired && a.sizeBytes > 0).length;
    const completenessRatio = totalRequired > 0 ? Math.round((totalAvailable / totalRequired) * 100) : 100;

    return {
      totalRequired,
      totalAvailable,
      completenessRatio,
    };
  }
}
