import { SectionFIR } from '../domain/fir/sectionFIR';

export type ComponentDesignPattern =
  | 'KINETIC_TYPOGRAPHY_HERO'
  | 'SPLIT_HERO'
  | 'CINEMATIC_HERO'
  | 'PINNED_EDITORIAL_STORY'
  | 'HORIZONTAL_SCROLL_STORY'
  | 'PINNED_HORIZONTAL_GALLERY'
  | 'MASONRY_CARD_GRID'
  | 'MAGNETIC_POINTER_CTA'
  | 'STATEFUL_ACCORDION_FAQ'
  | 'WEBGL_GENERATIVE_CANVAS'
  | 'STICKY_NAVBAR'
  | 'MINIMAL_FOOTER'
  | 'STANDARD_SECTION';

export interface PatternClassificationResult {
  category: string;
  pattern: ComponentDesignPattern;
  patternArchetype: string;
  confidence: number;
  characteristics: string[];
}

export class PatternClassifier {
  /**
   * Classifies a SectionFIR into a reusable architectural component design pattern.
   */
  public static classify(fir: SectionFIR): PatternClassificationResult {
    const cat = fir.identity.category.toUpperCase();
    const hasGSAP = fir.motion.traces.some((t) => t.kind === 'gsap_timeline');
    const hasScrollTrigger = fir.motion.traces.some((t) => t.kind === 'scroll_trigger');
    const hasPointer = fir.interactions.interactions.some((i) => i.triggerType === 'pointermove' || i.triggerType === 'hover');
    const hasClick = fir.interactions.interactions.some((i) => i.triggerType === 'click');
    const hasCanvas = fir.canvas.hasCanvas;
    const isGrid = Boolean(fir.styles.scopedCssSnippet?.includes('grid'));

    if (cat === 'HERO') {
      if (hasGSAP) {
        return {
          category: 'Hero',
          pattern: 'KINETIC_TYPOGRAPHY_HERO',
          patternArchetype: 'Hero / Kinetic Typography Reveal',
          confidence: 0.96,
          characteristics: ['GSAP staggered letter/word reveal', 'Full-viewport hero bounds', 'High-impact display font'],
        };
      }
      return {
        category: 'Hero',
        pattern: 'SPLIT_HERO',
        patternArchetype: 'Hero / Split Grid',
        confidence: 0.90,
        characteristics: ['2-column grid or flex split', 'Display heading with action buttons'],
      };
    }

    if (cat === 'STORY' || cat === 'EDITORIAL') {
      if (hasScrollTrigger) {
        return {
          category: 'Story',
          pattern: 'PINNED_EDITORIAL_STORY',
          patternArchetype: 'Story / Pinned Narrative Transition',
          confidence: 0.94,
          characteristics: ['ScrollTrigger pin container', 'Sequential editorial paragraph reveal'],
        };
      }
      return {
        category: 'Story',
        pattern: 'HORIZONTAL_SCROLL_STORY',
        patternArchetype: 'Story / Horizontal Narrative',
        confidence: 0.88,
        characteristics: ['Editorial prose styling', 'Visual storytelling transitions'],
      };
    }

    if (cat === 'CARD_GRID' || cat === 'GALLERY') {
      if (hasScrollTrigger) {
        return {
          category: 'Gallery',
          pattern: 'PINNED_HORIZONTAL_GALLERY',
          patternArchetype: 'Gallery / Pinned Horizontal Track',
          confidence: 0.93,
          characteristics: ['Horizontal translate3d scrub', 'Sticky viewport containment'],
        };
      }
      return {
        category: 'Card_Grid',
        pattern: 'MASONRY_CARD_GRID',
        patternArchetype: 'Card Grid / Responsive Masonry',
        confidence: 0.92,
        characteristics: ['CSS Grid repeat columns', 'Hover card scale transitions'],
      };
    }

    if (cat === 'FAQ') {
      return {
        category: 'FAQ',
        pattern: 'STATEFUL_ACCORDION_FAQ',
        patternArchetype: 'FAQ / Stateful Expandable Accordion',
        confidence: 0.95,
        characteristics: ['Interactive React state toggle', 'Accessible aria-expanded bindings', 'Height animated container'],
      };
    }

    if (cat === 'CTA') {
      if (hasPointer) {
        return {
          category: 'CTA',
          pattern: 'MAGNETIC_POINTER_CTA',
          patternArchetype: 'CTA / Magnetic Pointer Button',
          confidence: 0.95,
          characteristics: ['Pointermove spring physics', 'Interactive magnetic transform offsets'],
        };
      }
    }

    if (cat === 'CANVAS' || hasCanvas) {
      return {
        category: 'Canvas',
        pattern: 'WEBGL_GENERATIVE_CANVAS',
        patternArchetype: 'Canvas / Generative Visual Experience',
        confidence: 0.90,
        characteristics: ['HTML5 Canvas/WebGL buffer', 'Lossless static/runtime image fallback'],
      };
    }

    if (cat === 'HEADER' || cat === 'NAVIGATION') {
      return {
        category: 'Navigation',
        pattern: 'STICKY_NAVBAR',
        patternArchetype: 'Navigation / Sticky Header',
        confidence: 0.96,
        characteristics: ['Top viewport pin', 'Logo and navigation anchor links'],
      };
    }

    if (cat === 'FOOTER') {
      return {
        category: 'Footer',
        pattern: 'MINIMAL_FOOTER',
        patternArchetype: 'Footer / Clean Site Closer',
        confidence: 0.98,
        characteristics: ['Bottom page boundary', 'Copyright, social links, legal notices'],
      };
    }

    return {
      category: cat,
      pattern: 'STANDARD_SECTION',
      patternArchetype: 'General / Structured Section',
      confidence: 0.85,
      characteristics: ['Standard responsive layout container'],
    };
  }
}
