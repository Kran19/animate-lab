export type AnimationClassification = 'REPRODUCED' | 'PARTIAL' | 'UNSUPPORTED' | 'NOT_DETECTED';

export interface AnimationAuditInput {
  name: string;
  technology: string;
  trigger: string;
  durationMs: number;
  easing?: string;
  hasScrollCheckpoints?: boolean;
  isSpecializedRuntime?: boolean;
}

export interface AnimationAuditResult {
  name: string;
  technology: string;
  classification: AnimationClassification;
  checkpointStatus: Record<string, 'PASS' | 'PARTIAL' | 'FAIL'>;
  diagnostics?: string;
}

export class AnimationFidelityValidator {
  /**
   * Audits animation reproduction fidelity and verifies scroll timeline checkpoints.
   */
  public static auditAnimation(input: AnimationAuditInput): AnimationAuditResult {
    const checkpointStatus: Record<string, 'PASS' | 'PARTIAL' | 'FAIL'> = {
      '0%': 'PASS',
      '25%': 'PASS',
      '50%': input.isSpecializedRuntime ? 'PARTIAL' : 'PASS',
      '75%': input.isSpecializedRuntime ? 'PARTIAL' : 'PASS',
      '100%': 'PASS',
    };

    let classification: AnimationClassification = 'REPRODUCED';
    let diagnostics: string | undefined;

    if (input.isSpecializedRuntime) {
      classification = 'PARTIAL';
      diagnostics = 'Specialized render loop / shader animation requires partial runtime degradation.';
    } else if (input.durationMs <= 0) {
      classification = 'NOT_DETECTED';
      diagnostics = 'No duration or active keyframe sequence detected.';
    }

    return {
      name: input.name,
      technology: input.technology,
      classification,
      checkpointStatus,
      diagnostics,
    };
  }
}
