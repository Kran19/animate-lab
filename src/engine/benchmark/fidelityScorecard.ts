import { FidelityScorecard } from './types';

export interface ScorecardInput {
  hasValidHtml: boolean;
  domNodeCount: number;
  semanticTagRatio: number; // 0-1
  assetCountExpected: number;
  assetCountCaptured: number;
  hasScopedCss: boolean;
  hasGlobalLeakage: boolean;
  viewportsTested: number; // e.g. 4 (1440, 1024, 768, 375)
  viewportsPassing: number;
  animationCountDetected: number;
  animationPropertiesMatched: number;
  hasFabricatedProps: boolean;
  hasFabricatedHandlers: boolean;
  detectedTechCount: number;
  hasFullProvenanceChain: boolean;
  isExportValidTsx: boolean;
  hasManifestJson: boolean;
  hasContentHashes: boolean;
}

export class FidelityScorecardCalculator {
  /**
   * Computes a deterministic, evidence-based fidelity scorecard for benchmark components.
   */
  public static calculateScorecard(input: ScorecardInput): FidelityScorecard {
    // 1. Structural Fidelity (0-100)
    let structuralFidelity = 0;
    if (input.hasValidHtml && input.domNodeCount > 0) {
      structuralFidelity = Math.min(100, Math.round(80 + input.semanticTagRatio * 20));
    }

    // 2. Content Fidelity (0-100)
    const contentFidelity = input.domNodeCount > 0 ? (input.hasValidHtml ? 95 : 60) : 0;

    // 3. Asset Fidelity (0-100)
    let assetFidelity = 100;
    if (input.assetCountExpected > 0) {
      assetFidelity = Math.min(100, Math.round((input.assetCountCaptured / input.assetCountExpected) * 100));
    }

    // 4. CSS Fidelity (0-100)
    let cssFidelity = 100;
    if (input.hasGlobalLeakage) {
      cssFidelity -= 40;
    }
    if (!input.hasScopedCss) {
      cssFidelity -= 30;
    }
    cssFidelity = Math.max(0, cssFidelity);

    // 5. Responsive Fidelity (0-100)
    const responsiveFidelity =
      input.viewportsTested > 0 ? Math.round((input.viewportsPassing / input.viewportsTested) * 100) : 100;

    // 6. Animation Fidelity (0-100)
    let animationFidelity = 100;
    if (input.animationCountDetected > 0) {
      animationFidelity = Math.min(
        100,
        Math.round((input.animationPropertiesMatched / Math.max(1, input.animationCountDetected)) * 100)
      );
    }

    // 7. Interaction Fidelity (0-100)
    let interactionFidelity = 100;
    if (input.hasFabricatedHandlers || input.hasFabricatedProps) {
      interactionFidelity = 0; // Strict Invariant: Zero points for fabricated behavior
    }

    // 8. Technology Fidelity (0-100)
    const technologyFidelity = input.detectedTechCount > 0 ? 100 : 80;

    // 9. Provenance Fidelity (0-100)
    const provenanceFidelity = input.hasFullProvenanceChain ? 100 : 20;

    // 10. Export Validity (0-100)
    let exportValidity = 0;
    if (input.isExportValidTsx) exportValidity += 50;
    if (input.hasManifestJson) exportValidity += 25;
    if (input.hasContentHashes) exportValidity += 25;

    // Weighted Overall Score
    const weightedScore = Math.round(
      structuralFidelity * 0.15 +
      contentFidelity * 0.10 +
      assetFidelity * 0.10 +
      cssFidelity * 0.15 +
      responsiveFidelity * 0.10 +
      animationFidelity * 0.10 +
      interactionFidelity * 0.10 +
      technologyFidelity * 0.05 +
      provenanceFidelity * 0.05 +
      exportValidity * 0.10
    );

    let rating: FidelityScorecard['rating'] = 'RED';
    if (weightedScore >= 85) rating = 'GREEN';
    else if (weightedScore >= 70) rating = 'YELLOW';
    else if (weightedScore >= 50) rating = 'PARTIAL';
    else rating = 'RED';

    return {
      structuralFidelity,
      contentFidelity,
      assetFidelity,
      cssFidelity,
      responsiveFidelity,
      animationFidelity,
      interactionFidelity,
      technologyFidelity,
      provenanceFidelity,
      exportValidity,
      overallFidelityScore: weightedScore,
      rating,
    };
  }
}
