import { SectionFIR } from '../../domain/fir/sectionFIR';
import { RawObservedSectionData } from '../../extraction/firAssembler';

export interface EvidenceAssertionResult {
  isObservationFIRMatch: boolean;
  mismatches: string[];
  evidenceFidelityScore: number; // 0.0 to 1.0
}

export class EvidenceAssertionEngine {
  /**
   * Directly verifies the fundamental invariant:
   * Browser Observation == FIR Representation
   * Ensures zero silent omissions, losses, or mutations during FIR assembly.
   */
  public static assertObservationToFIR(
    observed: RawObservedSectionData,
    fir: SectionFIR
  ): EvidenceAssertionResult {
    const mismatches: string[] = [];

    // 1. Identity & Bounds Assertion
    if (fir.identity.sectionId !== observed.sectionId) {
      mismatches.push(`sectionId mismatch: expected "${observed.sectionId}", got "${fir.identity.sectionId}"`);
    }
    if (fir.identity.domSelector !== observed.domSelector) {
      mismatches.push(`domSelector mismatch: expected "${observed.domSelector}", got "${fir.identity.domSelector}"`);
    }
    if (fir.geometry.width !== observed.bounds.width || fir.geometry.height !== observed.bounds.height) {
      mismatches.push(`Geometry mismatch: expected ${observed.bounds.width}x${observed.bounds.height}, got ${fir.geometry.width}x${fir.geometry.height}`);
    }

    // 2. Asset Graph Completeness Assertion
    const observedAssetCount = observed.assets?.length || 0;
    if (fir.assets.totalAssetsCount !== observedAssetCount) {
      mismatches.push(`Asset count mismatch: observed ${observedAssetCount}, FIR recorded ${fir.assets.totalAssetsCount}`);
    }
    if (observed.assets) {
      for (const oa of observed.assets) {
        const found = fir.assets.assets.find((fa) => fa.sourceUrl === oa.sourceUrl);
        if (!found) {
          mismatches.push(`Missing asset in FIR: "${oa.sourceUrl}"`);
        } else if (oa.sha256 && found.sha256 !== oa.sha256) {
          mismatches.push(`Asset SHA-256 mismatch for "${oa.sourceUrl}": expected ${oa.sha256}, got ${found.sha256}`);
        }
      }
    }

    // 3. Motion Traces Completeness Assertion
    const observedMotionCount = observed.animations?.length || 0;
    if (fir.motion.traces.length !== observedMotionCount) {
      mismatches.push(`Motion trace count mismatch: observed ${observedMotionCount}, FIR recorded ${fir.motion.traces.length}`);
    }
    if (observed.animations) {
      for (const oa of observed.animations) {
        const found = fir.motion.traces.find((ft) => ft.kind === oa.kind);
        if (!found) {
          mismatches.push(`Missing motion kind in FIR: "${oa.kind}"`);
        }
      }
    }

    // 4. Interaction Probes Assertion
    const observedInteractionsCount = observed.interactions?.length || 0;
    if (fir.interactions.interactions.length !== observedInteractionsCount) {
      mismatches.push(`Interaction count mismatch: observed ${observedInteractionsCount}, FIR recorded ${fir.interactions.interactions.length}`);
    }
    if (observed.interactions) {
      for (const oi of observed.interactions) {
        const found = fir.interactions.interactions.find((fi) => fi.triggerType === oi.triggerType);
        if (!found) {
          mismatches.push(`Missing interaction trigger in FIR: "${oi.triggerType}"`);
        }
      }
    }

    // 5. Canvas Context Assertion
    const observedCanvasCount = observed.canvasEvidence?.length || 0;
    if (fir.canvas.canvasCount !== observedCanvasCount) {
      mismatches.push(`Canvas count mismatch: observed ${observedCanvasCount}, FIR recorded ${fir.canvas.canvasCount}`);
    }

    const isObservationFIRMatch = mismatches.length === 0;
    const evidenceFidelityScore = isObservationFIRMatch ? 1.0 : Math.max(0, 1.0 - mismatches.length * 0.15);

    return {
      isObservationFIRMatch,
      mismatches,
      evidenceFidelityScore,
    };
  }
}
