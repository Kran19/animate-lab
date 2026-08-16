export type BenchmarkSiteId =
  | 'trionn'
  | 'noth_in'
  | 'cula_tech'
  | 'nk_studio'
  | 'vero_studio'
  | 'ciao_energy'
  | 'made_with_gsap_home'
  | 'made_with_gsap_effects'
  | 'obys_experiment'
  | 'artem_portfolio'
  | 'normal_is_boring';

export type BenchmarkCapabilityCategory =
  | 'STATIC_EDITORIAL'
  | 'CREATIVE_STUDIO'
  | 'PORTFOLIO'
  | 'PRODUCT_MARKETING'
  | 'E_COMMERCE'
  | 'GSAP_HEAVY'
  | 'SCROLL_DRIVEN'
  | 'MOUSE_INTERACTION'
  | 'DRAG_INTERACTION'
  | 'INFINITE_SCROLL'
  | 'MARQUEE'
  | 'VIDEO_HEAVY'
  | 'WEBGL'
  | 'THREE_JS'
  | 'CANVAS'
  | 'SHADER'
  | 'LOTTIE'
  | 'SVG_ANIMATION'
  | 'CUSTOM_CURSOR'
  | 'HORIZONTAL_SCROLL'
  | 'PARALLAX'
  | 'PINNED_SCROLL'
  | 'MULTI_PAGE'
  | 'CMS_DRIVEN'
  | 'FORM_DRIVEN'
  | 'RESPONSIVE'
  | 'DESKTOP_ONLY'
  | 'EXPERIMENTAL';

export type FailureCode =
  | 'CAPTURE_FAILURE'
  | 'NAVIGATION_FAILURE'
  | 'RESOURCE_FAILURE'
  | 'ASSET_FAILURE'
  | 'FONT_FAILURE'
  | 'DOM_MUTATION_FAILURE'
  | 'CSS_DEPENDENCY_FAILURE'
  | 'ANIMATION_ANALYSIS_FAILURE'
  | 'INTERACTION_ANALYSIS_FAILURE'
  | 'WEBGL_ANALYSIS_FAILURE'
  | 'COMPONENT_BOUNDARY_FAILURE'
  | 'ISOLATION_FAILURE'
  | 'NORMALIZATION_FAILURE'
  | 'GENERATION_FAILURE'
  | 'VALIDATION_FAILURE'
  | 'SANDBOX_FAILURE'
  | 'EXPORT_FAILURE'
  | 'RESPONSIVE_FAILURE'
  | 'PROVENANCE_FAILURE'
  | 'UNSUPPORTED_RUNTIME_DEPENDENCY';

export type FailureSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface StructuredFailure {
  code: FailureCode;
  severity: FailureSeverity;
  stage: string;
  url: string;
  componentId?: string;
  message: string;
  evidence?: any;
  recoverable: boolean;
  suggestedNextAction: string;
}

export interface FidelityScorecard {
  structuralFidelity: number; // 0-100
  contentFidelity: number; // 0-100
  assetFidelity: number; // 0-100
  cssFidelity: number; // 0-100
  responsiveFidelity: number; // 0-100
  animationFidelity: number; // 0-100
  interactionFidelity: number; // 0-100
  technologyFidelity: number; // 0-100
  provenanceFidelity: number; // 0-100
  exportValidity: number; // 0-100
  overallFidelityScore: number; // 0-100
  rating: 'GREEN' | 'YELLOW' | 'RED' | 'PARTIAL' | 'UNSUPPORTED';
}

export interface BenchmarkCorpusItem {
  id: BenchmarkSiteId;
  name: string;
  url: string;
  normalizedUrl: string;
  primaryCategory: BenchmarkCapabilityCategory;
  observedCapabilities: BenchmarkCapabilityCategory[];
  description: string;
  techStackExpected: string[];
  testFocus: string[];
}

export interface BenchmarkExecutionResult {
  corpusItem: BenchmarkCorpusItem;
  pagesDiscovered: number;
  pagesCaptured: number;
  captureStatus: 'completed' | 'partial' | 'failed';
  resourceCount: number;
  assetCount: number;
  sectionCount: number;
  candidateCount: number;
  generatedCount: number;
  validatedCount: number;
  exportedCount: number;
  partialCount: number;
  unsupportedCount: number;
  scorecard: FidelityScorecard;
  failures: StructuredFailure[];
  diagnostics: {
    captureDurationMs: number;
    analysisDurationMs: number;
    generationDurationMs: number;
    exportDurationMs: number;
    memoryDeltaMb: number;
  };
}
