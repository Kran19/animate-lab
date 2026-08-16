import { FIRMotion, FIRMotionEvidence } from '../../domain/fir/sectionFIR';

export interface RawMotionObservation {
  traces?: FIRMotionEvidence[];
}

export class MotionEvidenceCollector {
  /**
   * Collects isolated, immutable Motion evidence from browser runtime observations.
   */
  public static collect(input: RawMotionObservation): FIRMotion {
    const traces: FIRMotionEvidence[] = input.traces || [];
    const hasMotion = traces.length > 0;

    let motionScore = 0.0;
    if (hasMotion) {
      const hasGSAP = traces.some((t) => t.kind === 'gsap_timeline' || t.kind === 'scroll_trigger');
      const hasCSS = traces.some((t) => t.kind === 'css_animation' || t.kind === 'css_transition');
      motionScore = hasGSAP ? 0.95 : hasCSS ? 0.90 : 0.60;
    }

    return {
      hasMotion,
      motionScore,
      traces,
    };
  }
}
