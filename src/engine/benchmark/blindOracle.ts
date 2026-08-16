export interface BlindOracleSpecification {
  targetId: string;
  targetUrl: string;
  architecturalFamily: string;
  oracleDisposition: 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED' | 'COPY_USE_UNKNOWN';
  oracleDeterminism: 'DETERMINISTIC' | 'BOUNDED_VARIANCE' | 'NON_DETERMINISTIC';
  knownOpaqueSubsystems: string[];
  riskFactor: string;
}

export class BlindOracle {
  /**
   * Ground truth oracle maintained outside AnimateLab runtime pipeline.
   * This is evaluated strictly by the independent benchmark evaluator AFTER AnimateLab emits its predictions.
   */
  public static readonly ORACLE_TARGETS: BlindOracleSpecification[] = [
    {
      targetId: 'blind_01_nextjs_ssr',
      targetUrl: 'https://preview.vercel.app/design-hero',
      architecturalFamily: 'Next.js SSR / React Hydration',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Hydration markers and client DOM mount',
    },
    {
      targetId: 'blind_02_gsap_pin',
      targetUrl: 'https://cuberto.com/services',
      architecturalFamily: 'GSAP ScrollTrigger + Pinning',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Viewport pinned cascade timeline',
    },
    {
      targetId: 'blind_03_webgl_shader',
      targetUrl: 'https://bruno-simon.com/lab',
      architecturalFamily: 'Three.js / WebGL Custom Shaders',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['WebGL Canvas Framebuffer'],
      riskFactor: 'Read-only WebGL context requiring Tier-4 canvas fallback',
    },
    {
      targetId: 'blind_04_canvas_2d',
      targetUrl: 'https://paperplanes.world',
      architecturalFamily: '2D HTML5 Canvas Interactive Game',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['Canvas 2D Procedural Render Loop'],
      riskFactor: 'Immediate-mode 2D drawing loop without declarative DOM elements',
    },
    {
      targetId: 'blind_05_bg_video',
      targetUrl: 'https://apple.com/vision-pro',
      architecturalFamily: 'Background Video & Media Stream',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: ['HTML5 Video Media Stream'],
      riskFactor: 'Autoplay codec streaming bound to poster stream fallback',
    },
    {
      targetId: 'blind_06_lenis_scroll',
      targetUrl: 'https://lenis.darkroom.engineering',
      architecturalFamily: 'Lenis Virtual Smooth Scroll',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Virtual scroll momentum interpolation',
    },
    {
      targetId: 'blind_07_horizontal_flow',
      targetUrl: 'https://stripe.com/sessions',
      architecturalFamily: 'Horizontal Scroll Narrative',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Horizontal coordinate translation pinned to scrollY',
    },
    {
      targetId: 'blind_08_art_direction',
      targetUrl: 'https://framer.com/templates',
      architecturalFamily: 'Responsive Art-Direction Breakpoints',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Multi-breakpoint reflow across Desktop/Tablet/Mobile',
    },
    {
      targetId: 'blind_09_spa_history',
      targetUrl: 'https://linear.app/features',
      architecturalFamily: 'Client-Side SPA History Navigation',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Client-side dynamic pushState navigation without full reload',
    },
    {
      targetId: 'blind_10_infinite_feed',
      targetUrl: 'https://dribbble.com/shots/popular',
      architecturalFamily: 'IntersectionObserver Infinite Feed',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['Dynamic Async Lazy Loader'],
      riskFactor: 'Asynchronous dynamic pagination creates bounded initial view reflow',
    },
    {
      targetId: 'blind_11_variable_type',
      targetUrl: 'https://type.method.ac',
      architecturalFamily: 'Variable Fonts & Typography Axes',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'WOFF2 variable weight, width, and optical size axes',
    },
    {
      targetId: 'blind_12_generative_drift',
      targetUrl: 'https://weavesilk.com',
      architecturalFamily: 'Generative Non-Deterministic Particle Motion',
      oracleDisposition: 'COPY_USE_FAILED',
      oracleDeterminism: 'NON_DETERMINISTIC',
      knownOpaqueSubsystems: ['Math.random() Particle Physics'],
      riskFactor: 'Non-deterministic particle physics causing un-reproducible frame trajectories',
    },
    {
      targetId: 'blind_13_multi_step_form',
      targetUrl: 'https://typeform.com/templates',
      architecturalFamily: 'Interactive Stepper State Machine',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Multi-stage state machine transitions with input validations',
    },
    {
      targetId: 'blind_14_parallax_multi',
      targetUrl: 'https://firewatchgame.com',
      architecturalFamily: 'Multi-Layer Parallax Depth Scroller',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Multi-layer CSS transform translate3d depth coordinates',
    },
    {
      targetId: 'blind_15_sticky_dual_pin',
      targetUrl: 'https://github.com/features/actions',
      architecturalFamily: 'Dual Sticky Sidebar & Pinned Container',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'CSS sticky sidebar combined with viewport pinned content container',
    },
    {
      targetId: 'blind_16_canvas_drag_drop',
      targetUrl: 'https://excalidraw.com',
      architecturalFamily: 'Canvas Interactive Drag-and-Drop Board',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['Pointer Event Canvas Mutation Loop'],
      riskFactor: 'Pointer physics mutations directly modifying raw pixel array buffer',
    },
    {
      targetId: 'blind_17_opaque_drm_media',
      targetUrl: 'https://netflix.com/browse',
      architecturalFamily: 'Opaque DRM Media Stream',
      oracleDisposition: 'COPY_USE_FAILED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: ['Encrypted Media Extensions / DRM'],
      riskFactor: 'Hardware-encrypted video stream causing blank frames and read-only media boundaries',
    },
    {
      targetId: 'blind_18_dynamic_filter',
      targetUrl: 'https://awwwards.com/websites',
      architecturalFamily: 'Dynamic Client Filter & Search Portal',
      oracleDisposition: 'COPY_USE_CERTIFIED',
      oracleDeterminism: 'DETERMINISTIC',
      knownOpaqueSubsystems: [],
      riskFactor: 'Faceted grid filtering with CSS transition reflows',
    },
    {
      targetId: 'blind_19_webgl_morph',
      targetUrl: 'https://active-theory.net',
      architecturalFamily: 'WebGL 3D Vertex Morphing',
      oracleDisposition: 'COPY_USE_PARTIAL',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['Custom Vertex Shader Buffer'],
      riskFactor: 'Procedural vertex buffer morphing bound to Tier-4 canvas fallback',
    },
    {
      targetId: 'blind_20_ambiguous_stream',
      targetUrl: 'https://interrupted-stream.internal/unresolved',
      architecturalFamily: 'Ambiguous & Incomplete Stream',
      oracleDisposition: 'COPY_USE_UNKNOWN',
      oracleDeterminism: 'BOUNDED_VARIANCE',
      knownOpaqueSubsystems: ['Incomplete Network Payload'],
      riskFactor: 'Missing network responses and unresolved canvas context creating insufficient evidence',
    },
  ];

  public static getOracle(targetId: string): BlindOracleSpecification | undefined {
    return this.ORACLE_TARGETS.find((t) => t.targetId === targetId);
  }
}
