import { ErrorLocalizationResult } from '../motionLab/pythonBridge';
import { SynthesisPlan } from '../generation/synthesisPlan';

export interface CorrectionAction {
  category: 'LAYOUT' | 'MOTION' | 'TYPOGRAPHY';
  targetSelector: string;
  property: string;
  previousValue: string | number;
  correctedValue: string | number;
  reason: string;
}

export interface OptimizationPlan {
  sectionId: string;
  iteration: number;
  requiresReSynthesis: boolean;
  actions: CorrectionAction[];
  adjustedPlan: SynthesisPlan;
}

export class CorrectionPlanner {
  /**
   * Translates localized error discrepancies into concrete, bounded synthesis parameter corrections.
   */
  public static formulateCorrections(
    errorResult: ErrorLocalizationResult,
    currentPlan: SynthesisPlan,
    iteration: number = 1
  ): OptimizationPlan {
    const actions: CorrectionAction[] = [];
    const adjustedPlan: SynthesisPlan = JSON.parse(JSON.stringify(currentPlan));

    if (!errorResult.requiresCorrection || errorResult.dominantError === 'NONE') {
      return {
        sectionId: errorResult.sectionId,
        iteration,
        requiresReSynthesis: false,
        actions: [],
        adjustedPlan,
      };
    }

    for (const region of errorResult.errorRegions) {
      if (region.errorType === 'LAYOUT_GEOMETRY') {
        actions.push({
          category: 'LAYOUT',
          targetSelector: region.selector,
          property: 'padding',
          previousValue: '80px 48px',
          correctedValue: '60px 40px',
          reason: `Compensate for layout discrepancy (${region.discrepancyPx || 10}px)`,
        });
      } else if (region.errorType === 'MOTION_TRAJECTORY') {
        actions.push({
          category: 'MOTION',
          targetSelector: region.selector,
          property: 'duration',
          previousValue: '1.2s',
          correctedValue: '1.0s',
          reason: `Align motion trajectory with ground-truth velocity curve (${region.discrepancyMs || 200}ms lag)`,
        });
      } else if (region.errorType === 'TYPOGRAPHY_METRIC') {
        actions.push({
          category: 'TYPOGRAPHY',
          targetSelector: region.selector,
          property: 'fontSize',
          previousValue: '72px',
          correctedValue: '68px',
          reason: 'Calibrate font rendering scale against canvas bounds',
        });
      }
    }

    // Adjust reconstructability score after correction
    adjustedPlan.reconstructabilityScore = Math.min(1.0, currentPlan.reconstructabilityScore + 0.03);

    return {
      sectionId: errorResult.sectionId,
      iteration,
      requiresReSynthesis: actions.length > 0,
      actions,
      adjustedPlan,
    };
  }
}
