import { FIRCanvas, FIRCanvasEvidence } from '../../domain/fir/sectionFIR';

export interface RawCanvasObservation {
  canvasEvidence?: FIRCanvasEvidence[];
}

export class CanvasEvidenceCollector {
  /**
   * Collects isolated, immutable Canvas evidence from WebGL/2D inspections.
   */
  public static collect(input: RawCanvasObservation): FIRCanvas {
    const evidence: FIRCanvasEvidence[] = input.canvasEvidence || [];
    const hasCanvas = evidence.length > 0;

    return {
      hasCanvas,
      canvasCount: evidence.length,
      evidence,
    };
  }
}
