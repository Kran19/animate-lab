export interface FailureReportPayload {
  url: string;
  stage:
    | 'OBSERVATION_FAILURE'
    | 'FIR_FAILURE'
    | 'SYNTHESIS_FAILURE'
    | 'REPLAY_FAILURE'
    | 'VISUAL_FIDELITY_FAILURE'
    | 'MOTION_FIDELITY_FAILURE';
  failureType: string;
  error: string;
  evidenceAvailable: string[];
  missingEvidence: string[];
  recoverability: 'AUTO_RECOVERABLE' | 'REQUIRES_INSTRUMENTATION' | 'UNRECOVERABLE_DYNAMIC';
  recommendedAction: string;
}

export class FailureReporter {
  /**
   * Constructs a structured failure report conforming to the real-world failure taxonomy.
   */
  public static createReport(input: FailureReportPayload): FailureReportPayload {
    return {
      url: input.url,
      stage: input.stage,
      failureType: input.failureType,
      error: input.error,
      evidenceAvailable: input.evidenceAvailable,
      missingEvidence: input.missingEvidence,
      recoverability: input.recoverability,
      recommendedAction: input.recommendedAction,
    };
  }
}
