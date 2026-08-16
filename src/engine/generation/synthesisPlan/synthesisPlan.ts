/**
 * Synthesis Plan Contract
 * 
 * An explicit, declarative decision specification generated from a SectionFIR.
 * Decouples capability classification and strategy decisions from raw component code generation.
 */

export type SynthesisCapabilityTier =
  | 'TIER_1_DETERMINISTIC'
  | 'TIER_2_MOTION_RECORDED'
  | 'TIER_3_INTERACTION_RECOVERED'
  | 'TIER_4_CANVAS_FALLBACK';

export type DOMSynthesisStrategy = 'JSX_CLEAN' | 'JSX_COMPLEX_NESTED';
export type CSSSynthesisStrategy = 'CSS_MODULE' | 'TAILWIND_SCOPED';
export type MotionSynthesisStrategy = 'CSS_KEYFRAMES' | 'GSAP_USE_HOOK' | 'STATIC_FALLBACK' | 'NONE';
export type InteractionSynthesisStrategy = 'STATEFUL_HOOK' | 'NATIVE_EVENTS' | 'PASSIVE';
export type CanvasSynthesisStrategy = 'STATIC_IMAGE_FALLBACK' | 'VIDEO_STREAM' | 'R3F_SCENE_RECONSTRUCTION' | 'NONE';
export type DependencySynthesisStrategy = 'BUNDLE_LOCAL' | 'NPM_EXTERNAL';

export interface PlannedAssetImport {
  assetId: string;
  variableName: string;
  relativePath: string;
  isInlineSvg: boolean;
}

export interface PlannedMotionHook {
  hookName: 'useGSAP' | 'useEffect' | 'none';
  librariesRequired: string[];
  timelineCount: number;
  hasScrollTrigger: boolean;
}

export interface PlannedInteractionHook {
  hookName: 'usePointerPhysics' | 'useState' | 'none';
  stateVariables: string[];
  eventListeners: Array<{
    targetSelector: string;
    eventType: string;
    handlerName: string;
  }>;
}

export interface SynthesisPlan {
  planId: string;
  sectionId: string;
  componentName: string;
  capabilityTier: SynthesisCapabilityTier;
  reconstructabilityScore: number; // 0.0 to 1.0
  domStrategy: DOMSynthesisStrategy;
  cssStrategy: CSSSynthesisStrategy;
  motionStrategy: MotionSynthesisStrategy;
  interactionStrategy: InteractionSynthesisStrategy;
  canvasStrategy: CanvasSynthesisStrategy;
  dependencyStrategy: DependencySynthesisStrategy;
  assetImports: PlannedAssetImport[];
  motionPlan: PlannedMotionHook;
  interactionPlan: PlannedInteractionHook;
  declaredNpmDependencies: Record<string, string>;
  knownLimitations: string[];
  createdAt: string;
}
