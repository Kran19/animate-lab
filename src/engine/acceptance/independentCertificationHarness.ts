import { SectionFIR } from '../domain/fir/sectionFIR';

export interface CriticalFailureGate {
  gateName: string;
  triggered: boolean;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
}

export interface IndependentCertificationScorecard {
  sectionId: string;
  componentName: string;
  isOptimizerIndependent: true;
  dimensionalScores: {
    visual: number;
    motion: number;
    behavior: number;
    layout: number;
    typography: number;
    responsive: number;
    assets: number;
  };
  rawAverageScore: number;
  criticalGates: CriticalFailureGate[];
  hardGateBlocked: boolean;
  certifiedScore: number;
  disposition: 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED';
  auditedAt: string;
}

export class IndependentCertificationHarness {
  /**
   * Independently calculates dimensional fidelity and applies hard failure gates.
   */
  public static auditCertification(
    fir: SectionFIR,
    componentName: string,
    measuredMetrics: {
      visualSimilarity: number;
      motionSimilarity: number;
      behaviorSimilarity: number;
      layoutSimilarity: number;
      typographySimilarity: number;
      responsiveSimilarity: number;
      assetSimilarity: number;
    },
    criticalEvents: {
      hasReplayCrash?: boolean;
      missingPrimaryAsset?: boolean;
      brokenCriticalInteraction?: boolean;
      catastrophicResponsiveBreak?: boolean;
    } = {}
  ): IndependentCertificationScorecard {
    const scores = {
      visual: Math.round(measuredMetrics.visualSimilarity * 1000) / 1000,
      motion: Math.round(measuredMetrics.motionSimilarity * 1000) / 1000,
      behavior: Math.round(measuredMetrics.behaviorSimilarity * 1000) / 1000,
      layout: Math.round(measuredMetrics.layoutSimilarity * 1000) / 1000,
      typography: Math.round(measuredMetrics.typographySimilarity * 1000) / 1000,
      responsive: Math.round(measuredMetrics.responsiveSimilarity * 1000) / 1000,
      assets: Math.round(measuredMetrics.assetSimilarity * 1000) / 1000,
    };

    const rawAvg =
      Math.round(
        ((scores.visual +
          scores.motion +
          scores.behavior +
          scores.layout +
          scores.typography +
          scores.responsive +
          scores.assets) /
          7) *
          1000
      ) / 10;

    const criticalGates: CriticalFailureGate[] = [];

    if (criticalEvents.hasReplayCrash) {
      criticalGates.push({
        gateName: 'REPLAY_CRASH_GATE',
        triggered: true,
        severity: 'CRITICAL',
        reason: 'Component crashed during clean-room browser replay',
      });
    }

    if (criticalEvents.missingPrimaryAsset) {
      criticalGates.push({
        gateName: 'PRIMARY_ASSET_GATE',
        triggered: true,
        severity: 'CRITICAL',
        reason: 'Critical hero image/canvas asset failed acquisition',
      });
    }

    if (criticalEvents.brokenCriticalInteraction || scores.behavior < 0.6) {
      criticalGates.push({
        gateName: 'BEHAVIOR_INTEGRITY_GATE',
        triggered: true,
        severity: 'CRITICAL',
        reason: `Interactive behavior divergence detected (Behavior score: ${(scores.behavior * 100).toFixed(1)}%)`,
      });
    }

    if (criticalEvents.catastrophicResponsiveBreak || scores.responsive < 0.6) {
      criticalGates.push({
        gateName: 'RESPONSIVE_INTEGRITY_GATE',
        triggered: true,
        severity: 'CRITICAL',
        reason: `Responsive reflow failure detected (Responsive score: ${(scores.responsive * 100).toFixed(1)}%)`,
      });
    }

    const hardGateBlocked = criticalGates.some((g) => g.severity === 'CRITICAL' && g.triggered);

    let disposition: IndependentCertificationScorecard['disposition'] = 'COPY_USE_FAILED';
    let certifiedScore = rawAvg;

    if (hardGateBlocked) {
      disposition = 'COPY_USE_FAILED';
      certifiedScore = Math.min(rawAvg, 49.0);
    } else if (rawAvg >= 85.0 && scores.visual >= 0.85 && scores.motion >= 0.85) {
      disposition = 'COPY_USE_CERTIFIED';
    } else if (rawAvg >= 60.0) {
      disposition = 'COPY_USE_PARTIAL';
    } else {
      disposition = 'COPY_USE_FAILED';
    }

    return {
      sectionId: fir.identity.sectionId,
      componentName,
      isOptimizerIndependent: true,
      dimensionalScores: scores,
      rawAverageScore: rawAvg,
      criticalGates,
      hardGateBlocked,
      certifiedScore,
      disposition,
      auditedAt: new Date().toISOString(),
    };
  }
}
