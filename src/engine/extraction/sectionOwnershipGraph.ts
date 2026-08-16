export type OwnershipScope = 'GLOBAL' | 'PAGE_SHARED' | 'SECTION_SHARED' | 'SECTION_LOCAL';

export interface SectionNodeOwnership {
  sectionId: string;
  sectionTitle: string;
  category: string;
  domSelector: string;
  bounds: { x: number; y: number; width: number; height: number };
  domNodeSelectors: string[];
  cssRuleSelectors: string[];
  scopedClassNames: string[];
  ownedAssetIds: string[];
  ownedAnimationIds: string[];
  ownedInteractionIds: string[];
  runtimeDependencies: string[];
  responsiveRules: Array<{ breakpoint: number; rule: string }>;
  provenance: {
    websiteId: string;
    pageId: string;
    originalDomXPath?: string;
    detectedAt: string;
  };
  isolationStatus: 'ISOLATED' | 'PARTIAL' | 'UNSUPPORTED' | 'FAILED';
  isolationViolations: string[];
}

export interface PageOwnershipTree {
  pageId: string;
  url: string;
  globalAssets: string[];
  globalStyles: string[];
  globalDependencies: string[];
  sections: SectionNodeOwnership[];
}

export class SectionOwnershipGraph {
  private tree: PageOwnershipTree;

  constructor(pageId: string, url: string) {
    this.tree = {
      pageId,
      url,
      globalAssets: [],
      globalStyles: [],
      globalDependencies: [],
      sections: [],
    };
  }

  public addSection(section: SectionNodeOwnership): void {
    // Remove existing section with same ID if updating
    this.tree.sections = this.tree.sections.filter((s) => s.sectionId !== section.sectionId);
    this.tree.sections.push(section);
  }

  public getSection(sectionId: string): SectionNodeOwnership | undefined {
    return this.tree.sections.find((s) => s.sectionId === sectionId);
  }

  public getAllSections(): SectionNodeOwnership[] {
    return [...this.tree.sections];
  }

  public registerGlobalAsset(assetId: string): void {
    if (!this.tree.globalAssets.includes(assetId)) {
      this.tree.globalAssets.push(assetId);
    }
  }

  public registerGlobalDependency(dep: string): void {
    if (!this.tree.globalDependencies.includes(dep)) {
      this.tree.globalDependencies.push(dep);
    }
  }

  /**
   * Classifies resource ownership scope to determine if an asset is local to a section or shared.
   */
  public classifyAssetScope(assetId: string): OwnershipScope {
    if (this.tree.globalAssets.includes(assetId)) {
      return 'GLOBAL';
    }

    const owningSections = this.tree.sections.filter((s) => s.ownedAssetIds.includes(assetId));
    if (owningSections.length > 1) {
      return 'SECTION_SHARED';
    }
    if (owningSections.length === 1) {
      return 'SECTION_LOCAL';
    }
    return 'PAGE_SHARED';
  }

  /**
   * Returns complete structured ownership manifest for a section.
   */
  public exportSectionOwnership(sectionId: string): {
    section: SectionNodeOwnership;
    assetScopeMap: Record<string, OwnershipScope>;
    isIndependent: boolean;
  } | undefined {
    const sec = this.getSection(sectionId);
    if (!sec) return undefined;

    const assetScopeMap: Record<string, OwnershipScope> = {};
    for (const aId of sec.ownedAssetIds) {
      assetScopeMap[aId] = this.classifyAssetScope(aId);
    }

    const isIndependent =
      sec.isolationViolations.length === 0 &&
      sec.isolationStatus === 'ISOLATED';

    return {
      section: sec,
      assetScopeMap,
      isIndependent,
    };
  }
}
