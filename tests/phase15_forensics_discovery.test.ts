import { describe, it, expect } from 'vitest';
import { MultiSignalSectionDetector } from '../src/engine/extraction/multiSignalSectionDetector';
import { AnimationForensics } from '../src/engine/analysis/animationForensics';
import { InteractionForensics } from '../src/engine/analysis/interactionForensics';
import { TypographyForensics } from '../src/engine/analysis/typographyForensics';

describe('Phase 15 — Multi-Signal Discovery & Forensics Suite (25 Tests)', () => {
  // ==========================================
  // Multi-Signal Section Discovery
  // ==========================================
  it('1. Discovers meaningful section candidate with high confidence using semantic + visual signals', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '#hero', tagName: 'HEADER', x: 0, y: 0, width: 1440, height: 800, hasAnimation: true, isSemanticLandmark: true },
    ]);

    expect(candidates.length).toBe(1);
    expect(candidates[0].isMeaningfulSection).toBe(true);
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(80);
    expect(candidates[0].name).toBe('Hero');
  });

  it('2. Prevents over-segmentation of small sub-elements (< 150px height)', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '.small-btn', tagName: 'BUTTON', x: 100, y: 100, width: 120, height: 40 },
    ]);

    expect(candidates[0].isMeaningfulSection).toBe(false);
  });

  it('3. Computes visual boundary score based on full-width and substantial height', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '.showcase', tagName: 'SECTION', x: 0, y: 800, width: 1440, height: 900 },
    ]);

    expect(candidates[0].visualBoundaryScore).toBeGreaterThanOrEqual(90);
  });

  it('4. Computes semantic boundary score for HTML5 landmark tags', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '.footer', tagName: 'FOOTER', x: 0, y: 2000, width: 1440, height: 400 },
    ]);

    expect(candidates[0].semanticBoundaryScore).toBe(95);
  });

  it('5. Elevates section confidence when owned animations and interactions are present', () => {
    const withoutExtras = MultiSignalSectionDetector.discoverSections([
      { selector: '.card-grid', tagName: 'DIV', x: 0, y: 1000, width: 1200, height: 600, hasAnimation: false, hasInteraction: false },
    ]);

    const withExtras = MultiSignalSectionDetector.discoverSections([
      { selector: '.card-grid', tagName: 'DIV', x: 0, y: 1000, width: 1200, height: 600, hasAnimation: true, hasInteraction: true },
    ]);

    expect(withExtras[0].confidence).toBeGreaterThan(withoutExtras[0].confidence);
  });

  it('6. Produces clean normalized section names from DOM selectors', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '#featured-projects', tagName: 'SECTION', x: 0, y: 0, width: 1440, height: 800 },
    ]);

    expect(candidates[0].name).toBe('FeaturedProjects');
  });

  // ==========================================
  // Animation State-Transition Forensics
  // ==========================================
  it('7. Measures 5-point state-transition checkpoints for ScrollTrigger animation', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-st-1',
      targetSelector: '.headline-reveal',
      mechanism: 'ScrollTrigger',
      trigger: 'scroll',
      durationMs: 1000,
    });

    expect(anim.checkpoints.length).toBe(5);
    expect(anim.checkpoints.map(c => c.progress)).toEqual(['0%', '25%', '50%', '75%', '100%']);
  });

  it('8. Verifies 0% initial opacity is 0 and 100% final opacity is 1', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-fade-1',
      targetSelector: '.fade-box',
      mechanism: 'GSAP',
      trigger: 'load',
      durationMs: 800,
    });

    expect(anim.checkpoints[0].opacity).toBe(0);
    expect(anim.checkpoints[4].opacity).toBe(1);
  });

  it('9. Classifies specialized Three.js canvas animation as PARTIAL', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-3d',
      targetSelector: 'canvas.webgl',
      mechanism: 'THREE_JS',
      trigger: 'continuous',
      durationMs: 16,
    });

    expect(anim.reproductionStatus).toBe('PARTIAL');
    expect(anim.isSpecializedRuntime).toBe(true);
  });

  it('10. Classifies zero-duration missing animation sequence as NOT_DETECTED', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-empty',
      targetSelector: '.static-box',
      mechanism: 'CSS_KEYFRAMES',
      trigger: 'load',
      durationMs: 0,
    });

    expect(anim.reproductionStatus).toBe('NOT_DETECTED');
  });

  it('11. Preserves custom cubic-bezier easing observed in browser', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-ease',
      targetSelector: '.eased-box',
      mechanism: 'GSAP',
      trigger: 'load',
      durationMs: 1200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    });

    expect(anim.easing).toBe('cubic-bezier(0.25, 1, 0.5, 1)');
  });

  // ==========================================
  // Interaction BEFORE -> ACTION -> AFTER Forensics
  // ==========================================
  it('12. Evaluates hover interaction with measurable transform state delta', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'hover-card',
      triggerType: 'hover',
      targetSelector: '.project-card',
      beforeState: { transform: 'scale(1)', opacity: 1, visibility: 'visible', dimensions: { width: 300, height: 200 } },
      afterState: { transform: 'scale(1.05)', opacity: 1, visibility: 'visible', dimensions: { width: 300, height: 200 } },
      isObservedOnPage: true,
    });

    expect(inter.hasMeasurableDelta).toBe(true);
    expect(inter.isObserved).toBe(true);
  });

  it('13. Evaluates modal click interaction where drawer becomes visible', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'click-modal',
      triggerType: 'modal',
      targetSelector: '.drawer-modal',
      beforeState: { transform: 'translateY(100%)', opacity: 0, visibility: 'hidden', dimensions: { width: 400, height: 600 } },
      afterState: { transform: 'translateY(0%)', opacity: 1, visibility: 'visible', dimensions: { width: 400, height: 600 } },
      isObservedOnPage: true,
    });

    expect(inter.hasMeasurableDelta).toBe(true);
    expect(inter.isObserved).toBe(true);
  });

  it('14. Rejects phantom interaction with zero observable delta', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'phantom-click',
      triggerType: 'click',
      targetSelector: '.noop-btn',
      beforeState: { transform: 'none', opacity: 1, visibility: 'visible', dimensions: { width: 100, height: 40 } },
      afterState: { transform: 'none', opacity: 1, visibility: 'visible', dimensions: { width: 100, height: 40 } },
      isObservedOnPage: true,
    });

    expect(inter.hasMeasurableDelta).toBe(false);
    expect(inter.isObserved).toBe(false);
  });

  it('15. Rejects unobserved interaction even if delta is theoretically simulated', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'unobserved-drag',
      triggerType: 'drag',
      targetSelector: '.drag-handle',
      beforeState: { transform: 'translateX(0)', opacity: 1, visibility: 'visible', dimensions: { width: 50, height: 50 } },
      afterState: { transform: 'translateX(100px)', opacity: 1, visibility: 'visible', dimensions: { width: 50, height: 50 } },
      isObservedOnPage: false,
    });

    expect(inter.isObserved).toBe(false);
  });

  // ==========================================
  // Typography Forensics
  // ==========================================
  it('16. Identifies custom web font requiring local WOFF2 bundle', () => {
    const typos = TypographyForensics.extractTypographyForensics({
      '.hero-title': 'MonumentExtended-Bold',
    });

    expect(typos[0].isCustomFont).toBe(true);
    expect(typos[0].fontFormat).toBe('woff2');
  });

  it('17. Identifies standard system font with generic fallback', () => {
    const typos = TypographyForensics.extractTypographyForensics({
      '.body-text': 'Helvetica, sans-serif',
    });

    expect(typos[0].isCustomFont).toBe(false);
    expect(typos[0].fallbackStack.length).toBeGreaterThan(0);
  });

  it('18. Extracts heading font weight and letter spacing parameters', () => {
    const typos = TypographyForensics.extractTypographyForensics({
      'h1.title': 'ClashDisplay',
    });

    expect(typos[0].fontWeight).toBe(700);
    expect(typos[0].letterSpacing).toBe('-0.02em');
  });

  it('19. Supplies default typography fallback if no CSS styles provided', () => {
    const typos = TypographyForensics.extractTypographyForensics({});
    expect(typos.length).toBe(1);
    expect(typos[0].fontFamily).toBe('Inter');
  });

  it('20. Evaluates accordion interaction state change', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'accordion-1',
      triggerType: 'accordion',
      targetSelector: '.faq-body',
      beforeState: { transform: 'none', opacity: 0, visibility: 'hidden', dimensions: { width: 800, height: 0 } },
      afterState: { transform: 'none', opacity: 1, visibility: 'visible', dimensions: { width: 800, height: 180 } },
      isObservedOnPage: true,
    });

    expect(inter.hasMeasurableDelta).toBe(true);
  });

  it('21. Evaluates tab index toggle interaction state change', () => {
    const inter = InteractionForensics.evaluateInteractionTransition({
      interactionId: 'tab-1',
      triggerType: 'tab',
      targetSelector: '.tab-pane-2',
      beforeState: { transform: 'none', opacity: 0, visibility: 'hidden', dimensions: { width: 900, height: 400 } },
      afterState: { transform: 'none', opacity: 1, visibility: 'visible', dimensions: { width: 900, height: 400 } },
      isObservedOnPage: true,
    });

    expect(inter.isObserved).toBe(true);
  });

  it('22. Extracts custom observed checkpoints for scale and rotation transforms', () => {
    const anim = AnimationForensics.extractAnimationForensics({
      id: 'anim-rotate',
      targetSelector: '.spinning-badge',
      mechanism: 'CSS_KEYFRAMES',
      trigger: 'continuous',
      durationMs: 4000,
      observedCheckpoints: {
        '0%': { transform: 'rotate(0deg)' },
        '50%': { transform: 'rotate(180deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    });

    expect(anim.checkpoints[0].transform).toBe('rotate(0deg)');
    expect(anim.checkpoints[2].transform).toBe('rotate(180deg)');
    expect(anim.checkpoints[4].transform).toBe('rotate(360deg)');
  });

  it('23. Verifies MultiSignalSectionDetector handles multi-column layouts gracefully', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '.col-left', tagName: 'DIV', x: 0, y: 500, width: 700, height: 600 },
      { selector: '.col-right', tagName: 'DIV', x: 700, y: 500, width: 700, height: 600 },
    ]);

    expect(candidates.length).toBe(2);
  });

  it('24. Verifies layout boundary score responds to container width', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '.container', tagName: 'MAIN', x: 0, y: 0, width: 1440, height: 1200 },
    ]);

    expect(candidates[0].layoutBoundaryScore).toBe(90);
  });

  it('25. Generates structured evidence string list for each candidate', () => {
    const candidates = MultiSignalSectionDetector.discoverSections([
      { selector: '#hero', tagName: 'HEADER', x: 0, y: 0, width: 1440, height: 800, hasAnimation: true, isSemanticLandmark: true },
    ]);

    expect(candidates[0].evidence.length).toBeGreaterThanOrEqual(2);
    expect(candidates[0].evidence.some(e => e.includes('landmark'))).toBe(true);
  });
});
