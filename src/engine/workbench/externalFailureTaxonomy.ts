export type ExternalFailureCategory =
  | 'REDIRECT_FAILURE'
  | 'NAVIGATION_FAILURE'
  | 'HYDRATION_FAILURE'
  | 'FONT_LOADING_FAILURE'
  | 'ASSET_LOADING_FAILURE'
  | 'CROSS_ORIGIN_FAILURE'
  | 'CANVAS_OBSERVATION_LIMIT'
  | 'VIDEO_OBSERVATION_LIMIT'
  | 'WEBGL_OBSERVATION_LIMIT'
  | 'VIRTUAL_SCROLL_FAILURE'
  | 'LAZY_LOAD_FAILURE'
  | 'RESPONSIVE_VARIANCE'
  | 'INTERACTION_FAILURE'
  | 'MOTION_CAPTURE_FAILURE'
  | 'SECTION_DISCOVERY_FAILURE'
  | 'FIR_FAILURE'
  | 'SYNTHESIS_FAILURE'
  | 'REPLAY_FAILURE'
  | 'VISUAL_FIDELITY_FAILURE'
  | 'MOTION_FIDELITY_FAILURE'
  | 'PROVENANCE_FAILURE'
  | 'DETERMINISM_FAILURE'
  | 'CERTIFICATION_FAILURE';

export interface ExternalFailureEvent {
  stage: 'NAVIGATION' | 'OBSERVATION' | 'FIR' | 'SYNTHESIS' | 'REPLAY' | 'CERTIFICATION' | 'PROVENANCE';
  category: ExternalFailureCategory;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  url: string;
  sectionId?: string;
  evidence: string;
  expected: string;
  actual: string;
  recoverable: boolean;
  recommendedAction: string;
  timestamp: string;
}

export class ExternalFailureTaxonomy {
  /**
   * Constructs an external site failure event conforming to the canonical taxonomy.
   */
  public static createEvent(
    stage: ExternalFailureEvent['stage'],
    category: ExternalFailureCategory,
    severity: ExternalFailureEvent['severity'],
    url: string,
    evidence: string,
    expected: string,
    actual: string,
    recommendedAction: string,
    options?: { sectionId?: string; recoverable?: boolean }
  ): ExternalFailureEvent {
    return {
      stage,
      category,
      severity,
      url,
      sectionId: options?.sectionId,
      evidence,
      expected,
      actual,
      recoverable: options?.recoverable ?? false,
      recommendedAction,
      timestamp: new Date().toISOString(),
    };
  }
}
