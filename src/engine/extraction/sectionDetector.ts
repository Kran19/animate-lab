export type SectionCategory =
  | 'Hero'
  | 'Navigation'
  | 'Text-Reveal'
  | 'Horizontal-Scroll'
  | 'Card-Grid'
  | 'Marquee'
  | 'Image-Gallery'
  | 'Cursor-Interaction'
  | '3D-Section'
  | 'Product-Configurator'
  | 'Footer'
  | 'Interactive-Showcase'
  | 'Custom-Visual';

export interface DOMNodeInfo {
  selector: string;
  stableSelector: string;
  tagName: string;
  boundsX: number;
  boundsY: number;
  boundsWidth: number;
  boundsHeight: number;
  boundsViewportRatio: number;
  domDepth: number;
  childCount: number;
  visibleChildCount: number;
  isVisuallyHidden: boolean;
  isOverlayOrWidget?: boolean;
  innerHTML?: string;
  innerText?: string;
  attributes?: Record<string, string>;
  hasCanvas?: boolean;
  hasVideo?: boolean;
  imageCount?: number;
  hasGridOrFlex?: boolean;
  hasHorizontalScroll?: boolean;
  hasMarqueeAnimation?: boolean;
  has3DCanvas?: boolean;
}

export interface DiscoveredSectionCandidate {
  title: string;
  primaryCategory: SectionCategory;
  secondaryCategories: SectionCategory[];
  domSelector: string;
  stableSelector: string;
  domTagName: string;
  boundsX: number;
  boundsY: number;
  boundsWidth: number;
  boundsHeight: number;
  boundsViewportRatio: number;
  domDepth: number;
  childCount: number;
  previewScreenshot?: string;
  isComponentCandidate: boolean;
  confidence: number;
  visibilityStatus: 'visible' | 'hidden' | 'overlay';
}

export class SectionDetector {
  /**
   * Performs multi-signal DOM section boundary detection and deduplication.
   */
  public detectSections(nodes: DOMNodeInfo[]): DiscoveredSectionCandidate[] {
    const rawCandidates: DiscoveredSectionCandidate[] = [];

    // 1. Filter out hidden or overlay elements that shouldn't pollute component candidates
    const validNodes = nodes.filter((node) => {
      if (node.isVisuallyHidden) return false;
      if (node.isOverlayOrWidget) return false;
      // Exclude tiny utility nodes (< 50px height unless navigation or header)
      if (node.boundsHeight < 50 && node.tagName.toLowerCase() !== 'header' && node.tagName.toLowerCase() !== 'nav') {
        return false;
      }
      return true;
    });

    // 2. Classify candidates into categories
    for (const node of validNodes) {
      const categories = this.classifyNodeCategories(node);
      if (categories.length === 0) continue;

      const primaryCategory = categories[0];
      const secondaryCategories = categories.slice(1);

      rawCandidates.push({
        title: `${primaryCategory} Section (${node.selector})`,
        primaryCategory,
        secondaryCategories,
        domSelector: node.selector,
        stableSelector: node.stableSelector || node.selector,
        domTagName: node.tagName.toUpperCase(),
        boundsX: node.boundsX,
        boundsY: node.boundsY,
        boundsWidth: node.boundsWidth,
        boundsHeight: node.boundsHeight,
        boundsViewportRatio: Number(node.boundsViewportRatio.toFixed(2)),
        domDepth: node.domDepth,
        childCount: node.childCount,
        isComponentCandidate: true,
        confidence: this.calculateSectionConfidence(node, primaryCategory),
        visibilityStatus: 'visible',
      });
    }

    // 3. Deduplicate nested container candidates
    return this.deduplicateNestedCandidates(rawCandidates);
  }

  private classifyNodeCategories(node: DOMNodeInfo): SectionCategory[] {
    const categories: SectionCategory[] = [];
    const tag = node.tagName.toLowerCase();
    const selectorLower = node.selector.toLowerCase();
    const textLower = (node.innerText || '').toLowerCase();

    // Navigation
    if (tag === 'header' || tag === 'nav' || selectorLower.includes('nav') || selectorLower.includes('header') || selectorLower.includes('menu')) {
      categories.push('Navigation');
    }

    // Footer
    if (tag === 'footer' || selectorLower.includes('footer') || textLower.includes('copyright')) {
      if (!categories.includes('Footer')) {
        categories.push('Footer');
      }
    }

    // Marquee
    if (selectorLower.includes('marquee') || node.hasMarqueeAnimation || selectorLower.includes('ticker')) {
      if (!categories.includes('Marquee')) {
        categories.push('Marquee');
      }
    }

    // Card-Grid
    if (node.hasGridOrFlex && (node.childCount >= 3 || selectorLower.includes('grid') || selectorLower.includes('cards'))) {
      if (!categories.includes('Card-Grid')) {
        categories.push('Card-Grid');
      }
    }

    // 3D-Section
    if (node.has3DCanvas || node.hasCanvas || selectorLower.includes('webgl') || selectorLower.includes('3d') || selectorLower.includes('canvas')) {
      if (!categories.includes('3D-Section')) {
        categories.push('3D-Section');
      }
    }

    // Hero
    if ((tag === 'section' || tag === 'header' || tag === 'div') && (node.boundsY < 300 || selectorLower.includes('hero') || selectorLower.includes('banner') || (node.boundsViewportRatio > 0.6 && node.boundsY < 500))) {
      if (!categories.includes('Hero') && tag !== 'nav' && !selectorLower.includes('nav') && !categories.includes('Card-Grid') && !categories.includes('Navigation')) {
        categories.unshift('Hero');
      }
    }

    // Horizontal-Scroll
    if (node.hasHorizontalScroll || selectorLower.includes('horizontal') || selectorLower.includes('slider')) {
      if (!categories.includes('Horizontal-Scroll')) {
        categories.push('Horizontal-Scroll');
      }
    }

    // Image-Gallery
    if ((node.imageCount && node.imageCount >= 3) || selectorLower.includes('gallery')) {
      if (!categories.includes('Image-Gallery')) {
        categories.push('Image-Gallery');
      }
    }

    // Text-Reveal
    if (selectorLower.includes('reveal') || selectorLower.includes('split-text') || textLower.includes('reveal')) {
      if (!categories.includes('Text-Reveal')) {
        categories.push('Text-Reveal');
      }
    }

    // Cursor-Interaction
    if (selectorLower.includes('cursor') || selectorLower.includes('pointer')) {
      if (!categories.includes('Cursor-Interaction')) {
        categories.push('Cursor-Interaction');
      }
    }

    // Product-Configurator
    if (selectorLower.includes('configurator') || selectorLower.includes('customizer')) {
      if (!categories.includes('Product-Configurator')) {
        categories.push('Product-Configurator');
      }
    }

    // Interactive-Showcase
    if (selectorLower.includes('showcase') || selectorLower.includes('interactive')) {
      if (!categories.includes('Interactive-Showcase')) {
        categories.push('Interactive-Showcase');
      }
    }

    // Fallback to Custom-Visual if section has reasonable dimensions & child elements
    if (categories.length === 0 && (tag === 'section' || tag === 'main' || tag === 'article' || node.childCount > 1)) {
      categories.push('Custom-Visual');
    }

    return categories;
  }

  private calculateSectionConfidence(node: DOMNodeInfo, primaryCategory: SectionCategory): number {
    let score = 0.7;
    const tag = node.tagName.toLowerCase();

    // Semantic HTML tags boost confidence
    if (tag === 'header' || tag === 'nav' || tag === 'section' || tag === 'footer' || tag === 'article') {
      score += 0.15;
    }
    // High viewport visibility boost
    if (node.boundsViewportRatio > 0.3) {
      score += 0.1;
    }

    return Math.min(Number(score.toFixed(2)), 0.98);
  }

  private deduplicateNestedCandidates(candidates: DiscoveredSectionCandidate[]): DiscoveredSectionCandidate[] {
    const deduplicated: DiscoveredSectionCandidate[] = [];

    // Sort by DOM depth ascending (outermost container first) and bounds area descending
    const sorted = [...candidates].sort((a, b) => {
      if (a.domDepth !== b.domDepth) return a.domDepth - b.domDepth;
      return b.boundsWidth * b.boundsHeight - a.boundsWidth * a.boundsHeight;
    });

    for (const cand of sorted) {
      // Check if this candidate is an inner child node of an already included container with > 85% overlap
      const isDuplicate = deduplicated.some((prev) => {
        const xOverlap = Math.max(0, Math.min(cand.boundsX + cand.boundsWidth, prev.boundsX + prev.boundsWidth) - Math.max(cand.boundsX, prev.boundsX));
        const yOverlap = Math.max(0, Math.min(cand.boundsY + cand.boundsHeight, prev.boundsY + prev.boundsHeight) - Math.max(cand.boundsY, prev.boundsY));
        const overlapArea = xOverlap * yOverlap;
        const candArea = cand.boundsWidth * cand.boundsHeight;

        if (candArea > 0 && overlapArea / candArea > 0.85 && cand.domDepth > prev.domDepth) {
          return true;
        }
        return false;
      });

      if (!isDuplicate) {
        deduplicated.push(cand);
      }
    }

    return deduplicated;
  }
}
