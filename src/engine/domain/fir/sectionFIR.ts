/**
 * Forensic Intermediate Representation (FIR) Contract
 * 
 * An immutable, versioned, evidence-first, and synthesis-agnostic data structure.
 * It strictly describes observed browser runtime forensics and provenance,
 * decoupled from any generated React or downstream framework decisions.
 */

// ---------------------------------------------------------------------------
// 1. Identity & Provenance Evidence
// ---------------------------------------------------------------------------

export interface FIRIdentity {
  sectionId: string;
  websiteId: string;
  pageId: string;
  title: string;
  category: string;
  sourceUrl: string;
  pagePath: string;
  domSelector: string;
  domTagName: string;
  discoveredAt: string;
}

export interface FIRCaptureContext {
  browserEngine: string;
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  captureDurationMs: number;
  scrollDepthPx: number;
}

// ---------------------------------------------------------------------------
// 2. Geometry & Spatial Layout Evidence
// ---------------------------------------------------------------------------

export interface FIRGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportRatio: number;
  zIndex: number;
  layoutMode: 'block' | 'flex' | 'grid' | 'inline' | 'positioned' | 'canvas-root';
  isFixedOrSticky: boolean;
}

// ---------------------------------------------------------------------------
// 3. DOM Subtree Evidence
// ---------------------------------------------------------------------------

export interface FIRDOMNode {
  nodeId: string;
  tagName: string;
  attributes: Record<string, string>;
  classList: string[];
  id?: string;
  textContent?: string;
  isSelfClosing: boolean;
  children: FIRDOMNode[];
  computedSelector: string;
}

export interface FIRDOM {
  rawHtmlSnapshot: string;
  sanitizedHtmlSnapshot: string;
  nodeCount: number;
  rootNode: FIRDOMNode;
}

// ---------------------------------------------------------------------------
// 4. Style & Cascade Evidence
// ---------------------------------------------------------------------------

export interface FIRStylePropertyEvidence {
  property: string;
  value: string;
  source: 'computed' | 'inline' | 'stylesheet' | 'inherited' | 'css-variable';
  specificityScore?: number;
  confidence: number;
}

export interface FIRNodeStyleDeclaration {
  selector: string;
  tagName: string;
  properties: Record<string, FIRStylePropertyEvidence>;
  customProperties: Record<string, string>;
}

export interface FIRStyles {
  scopedCssSnippet: string;
  cssVariableDeclarations: Record<string, string>;
  fontFamilyDeclarations: string[];
  mediaQueryRules: Array<{
    query: string;
    rules: string;
  }>;
  nodeStyles: Record<string, FIRNodeStyleDeclaration>;
}

// ---------------------------------------------------------------------------
// 5. Asset & Font Evidence
// ---------------------------------------------------------------------------

export interface FIRAssetEvidence {
  assetId: string;
  type: 'image' | 'svg' | 'font' | 'video' | 'audio' | '3d_model' | 'shader' | 'json';
  sourceUrl: string;
  resolvedUrl: string;
  localPath: string;
  exportPath: string;
  sha256: string;
  mimeType: string;
  byteLength: number;
  dimensions?: { width: number; height: number };
  discoveredBy: 'img_src' | 'css_background' | 'font_face' | 'svg_inline' | 'network_response';
  isCritical: boolean;
}

export interface FIRAssets {
  totalAssetsCount: number;
  totalSizeBytes: number;
  assets: FIRAssetEvidence[];
}

// ---------------------------------------------------------------------------
// 6. Motion & Animation Evidence (Discriminated Union)
// ---------------------------------------------------------------------------

export interface CSSAnimationEvidence {
  kind: 'css_animation';
  animationName: string;
  durationMs: number;
  delayMs: number;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
  keyframes: Array<{
    offset: number; // 0.0 to 1.0
    properties: Record<string, string>;
  }>;
  targetSelector: string;
}

export interface CSSTransitionEvidence {
  kind: 'css_transition';
  property: string;
  durationMs: number;
  delayMs: number;
  timingFunction: string;
  targetSelector: string;
}

export interface GSAPTimelineEvidence {
  kind: 'gsap_timeline';
  timelineId: string;
  durationMs: number;
  totalDurationMs: number;
  repeat: number;
  yoyo: boolean;
  tweens: Array<{
    targetSelector: string;
    propertiesFrom?: Record<string, any>;
    propertiesTo: Record<string, any>;
    duration: number;
    delay?: number;
    ease?: string;
  }>;
}

export interface ScrollTriggerEvidence {
  kind: 'scroll_trigger';
  triggerSelector: string;
  start: string;
  end?: string;
  scrub: boolean | number;
  pin: boolean | string;
  markers: boolean;
  linkedTimelineId?: string;
}

export interface UnknownMotionEvidence {
  kind: 'unknown_motion';
  description: string;
  observedStateDeltas: Array<{
    timeMs: number;
    property: string;
    value: string;
  }>;
}

export type FIRMotionEvidence =
  | CSSAnimationEvidence
  | CSSTransitionEvidence
  | GSAPTimelineEvidence
  | ScrollTriggerEvidence
  | UnknownMotionEvidence;

export interface FIRMotion {
  hasMotion: boolean;
  motionScore: number;
  traces: FIRMotionEvidence[];
}

// ---------------------------------------------------------------------------
// 7. Behavioral Interaction Evidence (Stimulus -> Response Deltas)
// ---------------------------------------------------------------------------

export interface FIRInteractionEvidence {
  interactionId: string;
  triggerType: 'click' | 'hover' | 'pointermove' | 'focus' | 'drag' | 'scroll';
  targetSelector: string;
  stimulusData?: Record<string, any>;
  observedResponseDelta: {
    affectedSelectors: string[];
    styleDeltas: Array<{
      selector: string;
      property: string;
      beforeValue: string;
      afterValue: string;
    }>;
    domMutationsObserved: number;
    settleDurationMs: number;
  };
}

export interface FIRInteractions {
  hasInteractions: boolean;
  interactions: FIRInteractionEvidence[];
}

// ---------------------------------------------------------------------------
// 8. Canvas & 3D WebGL Evidence (Discriminated Union)
// ---------------------------------------------------------------------------

export interface Canvas2DStaticEvidence {
  kind: 'canvas_2d_static';
  canvasSelector: string;
  width: number;
  height: number;
  staticSnapshotAssetId: string;
}

export interface WebGLStaticEvidence {
  kind: 'webgl_static_fallback';
  canvasSelector: string;
  contextType: 'webgl' | 'webgl2' | 'experimental-webgl';
  width: number;
  height: number;
  staticSnapshotAssetId: string;
  estimatedFps: number;
}

export interface WebGLRuntimeEvidence {
  kind: 'webgl_runtime_scene';
  canvasSelector: string;
  contextType: 'webgl' | 'webgl2';
  libraryDetected?: 'three.js' | 'babylon.js' | 'pixi.js' | 'custom_glsl';
  shaderCount: number;
  textureCount: number;
  modelCount: number;
  shaderSnippets: Array<{ type: 'vertex' | 'fragment'; source: string }>;
  models: Array<{ name: string; format: string; localPath?: string }>;
  textures: Array<{ name: string; mimeType: string; localPath?: string }>;
  staticSnapshotAssetId: string;
}

export type FIRCanvasEvidence =
  | Canvas2DStaticEvidence
  | WebGLStaticEvidence
  | WebGLRuntimeEvidence;

export interface FIRCanvas {
  hasCanvas: boolean;
  canvasCount: number;
  evidence: FIRCanvasEvidence[];
}

// ---------------------------------------------------------------------------
// 9. External & Runtime Dependencies
// ---------------------------------------------------------------------------

export interface FIRDependency {
  name: string;
  category: 'framework' | 'animation_lib' | '3d_lib' | 'ui_util' | 'font' | 'icon';
  version?: string;
  confidence: number;
  evidenceSource: 'script_tag' | 'global_object' | 'css_class' | 'network_bundle';
  isLocalizable: boolean;
}

export interface FIRDependencies {
  dependencies: FIRDependency[];
}

// ---------------------------------------------------------------------------
// 10. Checkpoints & Verification Baseline
// ---------------------------------------------------------------------------

export interface FIRCheckpoint {
  checkpointName: 'viewport-0' | 'viewport-25' | 'viewport-50' | 'viewport-75' | 'viewport-100' | 'tablet' | 'mobile';
  scrollPercent: number;
  viewportWidth: number;
  viewportHeight: number;
  screenshotAssetId: string;
  activeElementSelectors: string[];
}

export interface FIRCheckpoints {
  checkpoints: FIRCheckpoint[];
}

// ---------------------------------------------------------------------------
// 11. Diagnostics & Integrity
// ---------------------------------------------------------------------------

export interface FIRDiagnostics {
  warnings: string[];
  unsupportedFeatures: string[];
  extractionDurationMs: number;
  integrityHash: string; // SHA-256 over canonical FIR payload
}

// ---------------------------------------------------------------------------
// TOP-LEVEL AUTHORITATIVE SECTION FIR CONTRACT
// ---------------------------------------------------------------------------

export interface SectionFIR {
  schema: 'https://animatelab.io/schemas/fir/v0.1.json';
  firVersion: string; // e.g. "0.1.0"
  identity: FIRIdentity;
  capture: FIRCaptureContext;
  geometry: FIRGeometry;
  dom: FIRDOM;
  styles: FIRStyles;
  assets: FIRAssets;
  motion: FIRMotion;
  interactions: FIRInteractions;
  canvas: FIRCanvas;
  dependencies: FIRDependencies;
  checkpoints: FIRCheckpoints;
  diagnostics: FIRDiagnostics;
}
