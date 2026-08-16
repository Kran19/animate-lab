export interface SectionCandidate {
  id: string;
  name: string;
  selector: string;
  tagName: string;
  boundaries: { x: number; y: number; width: number; height: number };
  visualBoundaryScore: number;     // 0-100 (Height, aspect ratio, background transitions)
  semanticBoundaryScore: number;   // 0-100 (HTML5 landmark tags: header, section, footer, main)
  layoutBoundaryScore: number;     // 0-100 (Grid/flex containers, full viewport spans)
  animationBoundaryScore: number;  // 0-100 (GSAP/ScrollTrigger/Keyframe triggers)
  interactionBoundaryScore: number;// 0-100 (Interactive button/hover/tab clusters)
  confidence: number;              // 0-100 (Weighted combination)
  isMeaningfulSection: boolean;
  evidence: string[];
}

export class MultiSignalSectionDetector {
  /**
   * Discovers meaningful sections from browser-extracted DOM geometries and layout evidence.
   */
  public static discoverSections(geometries: Array<{
    selector: string;
    tagName: string;
    x: number;
    y: number;
    width: number;
    height: number;
    hasAnimation?: boolean;
    hasInteraction?: boolean;
    isSemanticLandmark?: boolean;
  }>): SectionCandidate[] {
    const candidates: SectionCandidate[] = [];

    for (let i = 0; i < geometries.length; i++) {
      const g = geometries[i];
      const evidence: string[] = [];

      // 1. Semantic scoring
      const landmarkTags = ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'FOOTER'];
      const isLandmark = landmarkTags.includes(g.tagName.toUpperCase()) || g.isSemanticLandmark;
      const semanticBoundaryScore = isLandmark ? 95 : 40;
      if (isLandmark) evidence.push(`Semantic HTML5 landmark: <${g.tagName.toLowerCase()}>`);

      // 2. Visual & Layout boundary scoring
      const isFullWidth = g.width >= 1000;
      const isSignificantHeight = g.height >= 300;
      const visualBoundaryScore = (isFullWidth ? 50 : 20) + (isSignificantHeight ? 45 : 10);
      if (isFullWidth && isSignificantHeight) {
        evidence.push(`Significant viewport region (${g.width}x${g.height}px)`);
      }

      const layoutBoundaryScore = isFullWidth ? 90 : 50;

      // 3. Animation & Interaction scoring
      const animationBoundaryScore = g.hasAnimation ? 90 : 30;
      if (g.hasAnimation) evidence.push('Contains owned animation choreography');

      const interactionBoundaryScore = g.hasInteraction ? 85 : 30;
      if (g.hasInteraction) evidence.push('Contains owned user interaction triggers');

      // 4. Aggregate confidence
      const confidence = Math.round(
        semanticBoundaryScore * 0.25 +
        visualBoundaryScore * 0.30 +
        layoutBoundaryScore * 0.20 +
        animationBoundaryScore * 0.15 +
        interactionBoundaryScore * 0.10
      );

      const isMeaningfulSection = confidence >= 60 && g.height >= 150;

      candidates.push({
        id: `sec-${(i + 1).toString().padStart(2, '0')}`,
        name: this.formatSectionName(g.selector, g.tagName, i + 1),
        selector: g.selector,
        tagName: g.tagName,
        boundaries: { x: g.x, y: g.y, width: g.width, height: g.height },
        visualBoundaryScore,
        semanticBoundaryScore,
        layoutBoundaryScore,
        animationBoundaryScore,
        interactionBoundaryScore,
        confidence,
        isMeaningfulSection,
        evidence,
      });
    }

    return candidates;
  }

  private static formatSectionName(selector: string, tagName: string, index: number): string {
    const cleanSel = selector.replace(/[.#]/g, '').replace(/[-_]([a-z])/g, (_, g) => g.toUpperCase());
    if (cleanSel && cleanSel.length > 2 && !cleanSel.startsWith('el')) {
      return cleanSel.charAt(0).toUpperCase() + cleanSel.slice(1);
    }
    const tag = tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase();
    return `${tag}Section${index}`;
  }
}
