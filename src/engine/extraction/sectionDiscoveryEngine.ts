export interface DiscoveredSectionInfo {
  sectionId: string;
  name: string;
  selector: string;
  tagName: string;
  category: string;
  confidence: number;
  boundaries: { x: number; y: number; width: number; height: number };
  viewportCoverageRatio: number;
  domDepth: number;
  isSemanticLandmark: boolean;
  hasVisualBoundary: boolean;
  hasMotionBoundary: boolean;
  hasRepeatedStructure: boolean;
  assetDensity: number;
  evidence: string[];
}

export interface PageDiscoveryReport {
  sourceUrl: string;
  totalSections: number;
  sections: DiscoveredSectionInfo[];
  pageHeight: number;
  pageWidth: number;
  semanticLandmarkCount: number;
  visualBoundaryCount: number;
  motionBoundaryCount: number;
  repeatedStructureCount: number;
  discoveredAt: string;
}

export class SectionDiscoveryEngine {
  /**
   * Discovers and classifies meaningful visual/semantic sections from real browser DOM geometries.
   */
  public static discoverFromGeometries(
    sourceUrl: string,
    geometries: Array<{
      selector: string;
      tagName: string;
      id?: string;
      className?: string;
      x: number;
      y: number;
      width: number;
      height: number;
      domDepth?: number;
      hasAnimation?: boolean;
      hasInteraction?: boolean;
      childCount?: number;
      assetCount?: number;
      background?: string;
    }>,
    viewport: { width: number; height: number } = { width: 1440, height: 900 }
  ): PageDiscoveryReport {
    const discovered: DiscoveredSectionInfo[] = [];
    const viewportArea = viewport.width * viewport.height;
    let pageHeight = viewport.height;

    for (let i = 0; i < geometries.length; i++) {
      const g = geometries[i];
      const evidence: string[] = [];
      const tag = g.tagName.toUpperCase();

      if (g.y + g.height > pageHeight) {
        pageHeight = g.y + g.height;
      }

      // 1. Semantic classification
      const isLandmark = ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'FOOTER'].includes(tag);
      if (isLandmark) evidence.push(`Semantic landmark <${g.tagName.toLowerCase()}>`);

      const category = this.inferCategory(g.selector, tag, g.id, g.className, i, geometries.length);

      // 2. Viewport Coverage & Visual Boundary
      const sectionArea = g.width * g.height;
      const coverageRatio = Math.min(1.0, Math.round((sectionArea / viewportArea) * 100) / 100);
      const isFullWidth = g.width >= viewport.width * 0.75;
      const hasSignificantHeight = g.height >= 200;
      const hasVisualBoundary = isFullWidth && hasSignificantHeight;
      if (hasVisualBoundary) evidence.push(`Full-width visual container (${g.width}x${g.height}px)`);

      // 3. Motion & Interaction
      const hasMotionBoundary = Boolean(g.hasAnimation || category === 'HERO' || category === 'STORY');
      if (hasMotionBoundary) evidence.push('Contains kinetic motion or scroll boundary');

      const hasRepeatedStructure = (g.childCount || 0) >= 3 || category === 'CARD_GRID' || category === 'GALLERY';
      if (hasRepeatedStructure) evidence.push('Contains repeated component structures');

      // 4. Calculate Confidence Score
      let score = 50;
      if (isLandmark) score += 20;
      if (hasVisualBoundary) score += 15;
      if (hasMotionBoundary) score += 10;
      if (hasRepeatedStructure) score += 5;
      const confidence = Math.min(100, score);

      const sectionId = `sec_${String(i + 1).padStart(3, '0')}_${category.toLowerCase()}`;
      const name = this.formatSectionName(g.selector, tag, category, i + 1);

      discovered.push({
        sectionId,
        name,
        selector: g.selector,
        tagName: g.tagName,
        category,
        confidence,
        boundaries: { x: g.x, y: g.y, width: g.width, height: g.height },
        viewportCoverageRatio: coverageRatio,
        domDepth: g.domDepth || 2,
        isSemanticLandmark: isLandmark,
        hasVisualBoundary,
        hasMotionBoundary,
        hasRepeatedStructure,
        assetDensity: (g.assetCount || 0) / Math.max(1, g.height / 100),
        evidence,
      });
    }

    return {
      sourceUrl,
      totalSections: discovered.length,
      sections: discovered,
      pageHeight,
      pageWidth: viewport.width,
      semanticLandmarkCount: discovered.filter((s) => s.isSemanticLandmark).length,
      visualBoundaryCount: discovered.filter((s) => s.hasVisualBoundary).length,
      motionBoundaryCount: discovered.filter((s) => s.hasMotionBoundary).length,
      repeatedStructureCount: discovered.filter((s) => s.hasRepeatedStructure).length,
      discoveredAt: new Date().toISOString(),
    };
  }

  private static inferCategory(
    selector: string,
    tag: string,
    id?: string,
    className?: string,
    index?: number,
    total?: number
  ): string {
    const combined = `${selector} ${tag} ${id || ''} ${className || ''}`.toLowerCase();

    if (combined.includes('header') || tag === 'HEADER') return 'HEADER';
    if (combined.includes('nav') || tag === 'NAV') return 'NAVIGATION';
    if (combined.includes('hero') || index === 1 || (index === 0 && tag !== 'HEADER')) return 'HERO';
    if (combined.includes('story') || combined.includes('about') || combined.includes('philosophy')) return 'STORY';
    if (combined.includes('grid') || combined.includes('service') || combined.includes('feature')) return 'CARD_GRID';
    if (combined.includes('faq') || combined.includes('accordion') || combined.includes('question')) return 'FAQ';
    if (combined.includes('canvas') || combined.includes('webgl') || combined.includes('shader')) return 'CANVAS';
    if (combined.includes('cta') || combined.includes('contact')) return 'CTA';
    if (combined.includes('footer') || tag === 'FOOTER' || (total && index === total - 1)) return 'FOOTER';

    return 'UNKNOWN';
  }

  private static formatSectionName(selector: string, tag: string, category: string, index: number): string {
    if (category !== 'UNKNOWN') {
      const cleanCat = category.replace(/_/g, '');
      const base = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).toLowerCase();
      return `${base}Section_${index}`;
    }
    const cleanSel = selector.replace(/[.#]/g, '').replace(/[-_]([a-z])/g, (_, g) => g.toUpperCase());
    if (cleanSel && cleanSel.length > 2) {
      return `${cleanSel.charAt(0).toUpperCase() + cleanSel.slice(1)}Section_${index}`;
    }
    return `Section_${index}`;
  }
}
