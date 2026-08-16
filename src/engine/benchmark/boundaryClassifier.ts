import { SectionFIR } from '../domain/fir/sectionFIR';

export type BenchmarkDisposition = 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED' | 'COPY_USE_UNKNOWN';
export type BenchmarkDeterminism = 'DETERMINISTIC' | 'BOUNDED_VARIANCE' | 'NON_DETERMINISTIC';

export interface BoundaryClassificationResult {
  archetypeId: string;
  category: string;
  disposition: BenchmarkDisposition;
  determinismClassification: BenchmarkDeterminism;
  isCorrectlyClassified?: boolean;
  hardGateTriggered: string | null;
  boundaryReason: string;
  missingEvidence?: string[];
  confidence: number;
}

export interface TargetEvidenceSignatures {
  targetId: string;
  category: string;
  hasCanvas?: boolean;
  hasVideo?: boolean;
  hasRandomMotion?: boolean;
  hasLazyLoading?: boolean;
  hasDRM?: boolean;
  hasAmbiguousStream?: boolean;
  isNonDeterministicDrift?: boolean;
}

export class BoundaryClassifier {
  /**
   * Classifies the reconstructability boundary of an observed section strictly from evidence.
   * Operates completely blind to oracle expected outcomes.
   */
  public static classifyBoundary(
    fir: SectionFIR,
    targetSignatures: TargetEvidenceSignatures,
    isNonDeterministicDrift: boolean = false
  ): BoundaryClassificationResult {
    let disposition: BenchmarkDisposition = 'COPY_USE_CERTIFIED';
    let determinism: BenchmarkDeterminism = 'DETERMINISTIC';
    let hardGate: string | null = null;
    let reason = 'Fully reconstructable declarative DOM, typography, and motion timeline.';
    let missingEvidence: string[] | undefined = undefined;

    // 1. Ambiguous / Insufficient Evidence Gate -> COPY_USE_UNKNOWN
    if (targetSignatures.hasAmbiguousStream) {
      disposition = 'COPY_USE_UNKNOWN';
      determinism = 'BOUNDED_VARIANCE';
      hardGate = 'INSUFFICIENT_EVIDENCE_GATE';
      reason = 'Network stream interrupted or unobservable runtime state creates insufficient evidence.';
      missingEvidence = ['Second Chromium capture pass', 'Network response body replay', 'DOM mutation observer trace'];
    }
    // 2. Opaque DRM Media Gate -> COPY_USE_FAILED
    else if (targetSignatures.hasDRM) {
      disposition = 'COPY_USE_FAILED';
      determinism = 'DETERMINISTIC';
      hardGate = 'OPAQUE_DRM_MEDIA_GATE';
      reason = 'Encrypted Media Extensions / DRM protects media stream; frames cannot be read or verified.';
    }
    // 3. Non-Deterministic / Generative Hard Gate -> COPY_USE_FAILED
    else if (targetSignatures.hasRandomMotion || isNonDeterministicDrift || targetSignatures.isNonDeterministicDrift) {
      disposition = 'COPY_USE_FAILED';
      determinism = 'NON_DETERMINISTIC';
      hardGate = 'NON_DETERMINISTIC_RUNTIME_GATE';
      reason = 'Non-deterministic particle physics and random seeds prevent reproducible clean-room replay verification.';
    }
    // 4. WebGL / Canvas Procedural Fallback Gate -> COPY_USE_PARTIAL
    else if (targetSignatures.hasCanvas || fir.canvas.canvasCount > 0) {
      disposition = 'COPY_USE_PARTIAL';
      determinism = 'BOUNDED_VARIANCE';
      hardGate = 'CANVAS_PROCEDURAL_FALLBACK_GATE';
      reason = 'Read-only canvas framebuffer requires Tier-4 procedural canvas fallback component.';
    }
    // 5. Media / Video Autoplay Fallback Gate -> COPY_USE_PARTIAL
    else if (targetSignatures.hasVideo) {
      disposition = 'COPY_USE_PARTIAL';
      determinism = 'DETERMINISTIC';
      hardGate = 'MEDIA_STREAM_FALLBACK_GATE';
      reason = 'External media/video dependencies bound to declarative poster stream fallback.';
    }
    // 6. Lazy-Loaded Async Intersection Feed Gate -> COPY_USE_PARTIAL
    else if (targetSignatures.hasLazyLoading) {
      disposition = 'COPY_USE_PARTIAL';
      determinism = 'BOUNDED_VARIANCE';
      hardGate = 'LAZY_ASYNC_FEED_GATE';
      reason = 'Dynamic asynchronous content injection creates bounded initial view reflow.';
    }

    const expected = (targetSignatures as any).expectedDisposition;
    const isCorrect = expected ? disposition === expected : undefined;

    return {
      archetypeId: targetSignatures.targetId || (targetSignatures as any).archetypeId,
      category: targetSignatures.category,
      disposition,
      determinismClassification: determinism,
      isCorrectlyClassified: isCorrect,
      hardGateTriggered: hardGate,
      boundaryReason: reason,
      missingEvidence,
      confidence: disposition === 'COPY_USE_UNKNOWN' ? 0.5 : 0.99,
    };
  }
}
