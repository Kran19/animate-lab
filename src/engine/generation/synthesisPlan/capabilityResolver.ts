import { SectionFIR } from '../../domain/fir/sectionFIR';
import { SynthesisCapabilityTier } from './synthesisPlan';

export interface CapabilityResolutionResult {
  tier: SynthesisCapabilityTier;
  reconstructabilityScore: number;
  hasRecordedGSAP: boolean;
  hasCSSKeyframes: boolean;
  hasInteractions: boolean;
  hasCanvasOrWebGL: boolean;
  knownLimitations: string[];
}

export class CapabilityResolver {
  /**
   * Resolves the capability tier and reconstructability score from a validated SectionFIR.
   */
  public static resolve(fir: SectionFIR): CapabilityResolutionResult {
    const knownLimitations: string[] = [];

    const hasCanvasOrWebGL = fir.canvas && fir.canvas.hasCanvas && fir.canvas.canvasCount > 0;
    const hasRecordedGSAP = fir.motion && fir.motion.traces.some((t) => t.kind === 'gsap_timeline' || t.kind === 'scroll_trigger');
    const hasCSSKeyframes = fir.motion && fir.motion.traces.some((t) => t.kind === 'css_animation' || t.kind === 'css_transition');
    const hasInteractions = fir.interactions && fir.interactions.hasInteractions && fir.interactions.interactions.length > 0;

    let tier: SynthesisCapabilityTier = 'TIER_1_DETERMINISTIC';
    let reconstructabilityScore = 1.0;

    if (hasCanvasOrWebGL) {
      tier = 'TIER_4_CANVAS_FALLBACK';
      reconstructabilityScore = 0.75;
      knownLimitations.push('WebGL / Canvas experiences use static snapshot or fallback hydration.');
    } else if (hasInteractions) {
      tier = 'TIER_3_INTERACTION_RECOVERED';
      reconstructabilityScore = 0.88;
      knownLimitations.push('User interactions are reconstructed from observable stimulus-response deltas.');
    } else if (hasRecordedGSAP || hasCSSKeyframes) {
      tier = 'TIER_2_MOTION_RECORDED';
      reconstructabilityScore = 0.94;
      if (hasRecordedGSAP) {
        knownLimitations.push('GSAP timelines synthesized via standard useGSAP hook contracts.');
      }
    } else {
      tier = 'TIER_1_DETERMINISTIC';
      reconstructabilityScore = 1.0;
    }

    return {
      tier,
      reconstructabilityScore,
      hasRecordedGSAP,
      hasCSSKeyframes,
      hasInteractions,
      hasCanvasOrWebGL,
      knownLimitations,
    };
  }
}
