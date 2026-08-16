import { SectionFIR } from '../domain/fir/sectionFIR';
import { ProvenanceVerifier } from './provenanceVerifier';

export type DeterminismClassification = 'DETERMINISTIC' | 'BOUNDED_VARIANCE' | 'NON_DETERMINISTIC';

export interface DeterminismComparisonResult {
  targetUrl: string;
  classification: DeterminismClassification;
  runCount: number;
  sectionCountMatch: boolean;
  sectionOrderMatch: boolean;
  firHashMatchRatio: number;
  geometryMaxDeltaPx: number;
  varianceDetails: string[];
  auditedAt: string;
}

export class DeterminismAuditor {
  /**
   * Compares outputs from two consecutive extractions of the same target website.
   */
  public static auditRuns(
    targetUrl: string,
    runAFIRs: SectionFIR[],
    runBFIRs: SectionFIR[]
  ): DeterminismComparisonResult {
    const varianceDetails: string[] = [];

    // 1. Section Count & Order Check
    const countMatch = runAFIRs.length === runBFIRs.length;
    if (!countMatch) {
      varianceDetails.push(`Section count mismatch: Run A discovered ${runAFIRs.length}, Run B discovered ${runBFIRs.length}`);
    }

    let orderMatch = countMatch;
    const minLen = Math.min(runAFIRs.length, runBFIRs.length);
    let matchedHashes = 0;
    let maxDeltaPx = 0;

    for (let i = 0; i < minLen; i++) {
      const a = runAFIRs[i];
      const b = runBFIRs[i];

      if (a.identity.category !== b.identity.category) {
        orderMatch = false;
        varianceDetails.push(`Category mismatch at index ${i}: '${a.identity.category}' vs '${b.identity.category}'`);
      }

      const dw = Math.abs(a.geometry.width - b.geometry.width);
      const dh = Math.abs(a.geometry.height - b.geometry.height);
      const delta = dw + dh;
      if (delta > maxDeltaPx) maxDeltaPx = delta;

      const hashA = ProvenanceVerifier.hashContent(JSON.stringify(a));
      const hashB = ProvenanceVerifier.hashContent(JSON.stringify(b));
      if (hashA === hashB) {
        matchedHashes++;
      } else if (delta > 2.0) {
        varianceDetails.push(`Section ${a.identity.sectionId} geometry shifted by ${delta.toFixed(1)}px`);
      }
    }

    const hashRatio = minLen > 0 ? Math.round((matchedHashes / minLen) * 1000) / 1000 : 1.0;

    let classification: DeterminismClassification = 'DETERMINISTIC';
    if (!countMatch || !orderMatch || (maxDeltaPx > 5.0 && hashRatio < 0.5)) {
      classification = 'NON_DETERMINISTIC';
    } else if (maxDeltaPx > 0.1 || hashRatio < 1.0) {
      classification = 'BOUNDED_VARIANCE';
    }

    return {
      targetUrl,
      classification,
      runCount: 2,
      sectionCountMatch: countMatch,
      sectionOrderMatch: orderMatch,
      firHashMatchRatio: hashRatio,
      geometryMaxDeltaPx: maxDeltaPx,
      varianceDetails,
      auditedAt: new Date().toISOString(),
    };
  }
}
