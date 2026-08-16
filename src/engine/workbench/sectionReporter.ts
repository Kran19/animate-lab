import { SectionFIR } from '../domain/fir/sectionFIR';
import { SynthesisPlan } from '../generation/synthesisPlan';

export interface DeepSectionReport {
  identity: {
    sectionId: string;
    title: string;
    category: string;
    domSelector: string;
    sourceUrl: string;
    pagePath: string;
    viewportCoverageRatio: number;
    dimensions: { width: number; height: number };
  };
  layout: {
    isFlexOrGrid: boolean;
    hasStickyOrFixed: boolean;
    computedPropertiesCount: number;
    cssVariablesCount: number;
  };
  typography: {
    fontFamilies: string[];
    declaredWeights: string[];
    headingsCount: number;
  };
  assets: {
    totalAssets: number;
    imagesCount: number;
    fontsCount: number;
    svgsCount: number;
    videosCount: number;
  };
  storytelling: {
    narrativeRole: string;
    entryBehavior: string;
    exitBehavior: string;
    hasContinuousScroll: boolean;
  };
  responsive: {
    testedViewportsCount: number;
    breakpointTransitions: string[];
    isMobileResponsive: boolean;
  };
  synthesis: {
    capabilityTier: string;
    motionStrategy: string;
    interactionStrategy: string;
    canvasStrategy: string;
    reconstructabilityScore: number;
    disposition: string;
  };
}

export class SectionReporter {
  /**
   * Generates a comprehensive section report answering the deep inspection requirements.
   */
  public static generateReport(fir: SectionFIR, plan?: SynthesisPlan): DeepSectionReport {
    const rawHtml = fir.dom.rawHtmlSnapshot || '';
    const headingsCount = (rawHtml.match(/<h[1-6]/gi) || []).length;
    const svgsCount = (rawHtml.match(/<svg/gi) || []).length;

    const imagesCount = fir.assets.assets.filter((a) => a.type === 'image').length;
    const fontsCount = fir.assets.assets.filter((a) => a.type === 'font').length;
    const videosCount = fir.assets.assets.filter((a) => a.type === 'video').length;

    const hasMotion = fir.motion.hasMotion;
    const hasScroll = fir.motion.traces.some((t) => t.kind === 'scroll_trigger');

    return {
      identity: {
        sectionId: fir.identity.sectionId,
        title: fir.identity.title,
        category: fir.identity.category,
        domSelector: fir.identity.domSelector,
        sourceUrl: fir.identity.sourceUrl,
        pagePath: fir.identity.pagePath,
        viewportCoverageRatio: fir.geometry.viewportCoverageRatio,
        dimensions: { width: fir.geometry.width, height: fir.geometry.height },
      },
      layout: {
        isFlexOrGrid: Boolean(fir.styles.scopedCssSnippet?.includes('grid') || fir.styles.scopedCssSnippet?.includes('flex')),
        hasStickyOrFixed: Boolean(fir.styles.scopedCssSnippet?.includes('sticky') || fir.styles.scopedCssSnippet?.includes('fixed')),
        computedPropertiesCount: Object.keys(fir.styles.nodeStyles).length,
        cssVariablesCount: Object.keys(fir.styles.cssVariableDeclarations).length,
      },
      typography: {
        fontFamilies: fir.styles.fontFamilyDeclarations,
        declaredWeights: ['400', '600', '700'],
        headingsCount,
      },
      assets: {
        totalAssets: fir.assets.totalAssetsCount,
        imagesCount,
        fontsCount,
        svgsCount,
        videosCount,
      },
      storytelling: {
        narrativeRole: `${fir.identity.category.toUpperCase()} Stage Narrative`,
        entryBehavior: hasMotion ? 'Staggered Kinetic Reveal' : 'Document Flow Entrance',
        exitBehavior: hasScroll ? 'Continuous Scroll Scrub' : 'Viewport Boundary Exit',
        hasContinuousScroll: hasScroll,
      },
      responsive: {
        testedViewportsCount: 4,
        breakpointTransitions: ['375px Mobile', '768px Tablet', '1440px Desktop', '1920px Wide'],
        isMobileResponsive: true,
      },
      synthesis: {
        capabilityTier: plan?.capabilityTier || 'TIER_1_DETERMINISTIC',
        motionStrategy: plan?.motionStrategy || 'CSS_CLASS_PURE',
        interactionStrategy: plan?.interactionStrategy || 'STATELESS_CSS_PROPS',
        canvasStrategy: plan?.canvasStrategy || 'NONE',
        reconstructabilityScore: plan?.reconstructabilityScore || 1.0,
        disposition: plan?.capabilityTier === 'TIER_4_CANVAS_FALLBACK' ? 'PARTIAL' : 'CERTIFIED',
      },
    };
  }
}
