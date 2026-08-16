import { RawObservedSectionData } from '../../extraction/firAssembler';

export type GoldenCorpusClass =
  | 'CLASS_A_DETERMINISTIC'
  | 'CLASS_B_CSS_MOTION'
  | 'CLASS_C_GSAP_RUNTIME'
  | 'CLASS_D_INTERACTION'
  | 'CLASS_E_HOSTILE_DYNAMIC';

export interface GoldenFixtureExpectation {
  expectedTier: 'TIER_1_DETERMINISTIC' | 'TIER_2_MOTION_RECORDED' | 'TIER_3_INTERACTION_RECOVERED' | 'TIER_4_CANVAS_FALLBACK';
  expectedMinReconstructability: number;
  expectedMotionKinds: string[];
  expectedAssetCount: number;
  expectedCanvasKinds: string[];
  isCompleteSceneReconstructionExpected: boolean; // false for WebGL
  isFullScrollEngineReconstructionExpected: boolean; // false for Lenis/Locomotive
}

export interface GoldenCorpusFixture {
  fixtureId: string;
  fixtureClass: GoldenCorpusClass;
  title: string;
  category: string;
  description: string;
  observedData: RawObservedSectionData;
  expectation: GoldenFixtureExpectation;
}

export const GOLDEN_CORPUS_FIXTURES: Record<string, GoldenCorpusFixture> = {
  // -------------------------------------------------------------------------
  // CLASS A: DETERMINISTIC (Static layouts, fonts, SVGs, grid)
  // -------------------------------------------------------------------------
  'fixture-01-static-grid': {
    fixtureId: 'fixture-01-static-grid',
    fixtureClass: 'CLASS_A_DETERMINISTIC',
    title: 'Marketing Grid Section',
    category: 'Features',
    description: 'Complex CSS grid card layout with background image and responsive column auto-fit.',
    observedData: {
      sectionId: 'sec-gc-01',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Marketing Grid Section',
      category: 'Features',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#features-grid',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 600, width: 1440, height: 750, viewportRatio: 0.8 },
      rawHtml: '<section id="features-grid"><div class="card"><h3>Feature 1</h3><p>Description</p></div></section>',
      scopedCss: '.features-grid-root { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }',
      assets: [
        {
          id: 'asset-bg-card',
          type: 'image',
          sourceUrl: 'https://example.com/images/card-bg.webp',
          localPath: 'assets/card-bg.webp',
          exportPath: 'assets/card-bg.webp',
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          mimeType: 'image/webp',
          byteLength: 28400,
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 1.0,
      expectedMotionKinds: [],
      expectedAssetCount: 1,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-02-custom-woff2-typography': {
    fixtureId: 'fixture-02-custom-woff2-typography',
    fixtureClass: 'CLASS_A_DETERMINISTIC',
    title: 'Typography Hero Section',
    category: 'Hero',
    description: 'Hero heading relying on custom localized @font-face WOFF2 binary buffer.',
    observedData: {
      sectionId: 'sec-gc-02',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Typography Hero Section',
      category: 'Hero',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#hero-typo',
      domTagName: 'HEADER',
      bounds: { x: 0, y: 0, width: 1440, height: 850, viewportRatio: 1.0 },
      rawHtml: '<header id="hero-typo"><h1>Monument Extended Typography</h1></header>',
      fontFamilies: ['Monument Extended', 'sans-serif'],
      assets: [
        {
          id: 'asset-font-monument',
          type: 'font',
          sourceUrl: 'https://example.com/fonts/monument-regular.woff2',
          localPath: 'assets/monument-regular.woff2',
          exportPath: 'assets/monument-regular.woff2',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          mimeType: 'font/woff2',
          byteLength: 42100,
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 1.0,
      expectedMotionKinds: [],
      expectedAssetCount: 1,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-03-svg-vector-complex': {
    fixtureId: 'fixture-03-svg-vector-complex',
    fixtureClass: 'CLASS_A_DETERMINISTIC',
    title: 'Vector Brand Identity Section',
    category: 'Brand',
    description: 'Complex inline SVG with clip-path masks, gradient definitions, and viewBox scaling.',
    observedData: {
      sectionId: 'sec-gc-03',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Vector Brand Identity Section',
      category: 'Brand',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#brand-svg',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 1400, width: 1440, height: 500, viewportRatio: 0.6 },
      rawHtml: '<section id="brand-svg"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="url(#g1)"/></svg></section>',
      assets: [],
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 1.0,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  // -------------------------------------------------------------------------
  // CLASS B: CSS MOTION (Keyframes & transitions)
  // -------------------------------------------------------------------------
  'fixture-04-css-keyframes-infinite': {
    fixtureId: 'fixture-04-css-keyframes-infinite',
    fixtureClass: 'CLASS_B_CSS_MOTION',
    title: 'Infinite Marquee Section',
    category: 'Marquee',
    description: 'Infinite horizontal scrolling marquee with keyframe translation.',
    observedData: {
      sectionId: 'sec-gc-04',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Infinite Marquee Section',
      category: 'Marquee',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#marquee-sec',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 1900, width: 1440, height: 220, viewportRatio: 0.25 },
      rawHtml: '<section id="marquee-sec"><div class="marquee-track"><span>Design • Motion • Tech</span></div></section>',
      animations: [
        {
          kind: 'css_animation',
          animationName: 'marquee-anim',
          durationMs: 10000,
          delayMs: 0,
          timingFunction: 'linear',
          iterationCount: 'infinite',
          direction: 'normal',
          fillMode: 'none',
          keyframes: [
            { offset: 0, properties: { transform: 'translateX(0%)' } },
            { offset: 1, properties: { transform: 'translateX(-50%)' } },
          ],
          targetSelector: '.marquee-track',
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_2_MOTION_RECORDED',
      expectedMinReconstructability: 0.90,
      expectedMotionKinds: ['css_animation'],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-05-css-transitions-stagger': {
    fixtureId: 'fixture-05-css-transitions-stagger',
    fixtureClass: 'CLASS_B_CSS_MOTION',
    title: 'Staggered Card Hover Section',
    category: 'Cards',
    description: 'Card group with staggered CSS transition delays on transform and opacity.',
    observedData: {
      sectionId: 'sec-gc-05',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Staggered Card Hover Section',
      category: 'Cards',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#cards-stagger',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 2200, width: 1440, height: 600, viewportRatio: 0.7 },
      rawHtml: '<section id="cards-stagger"><div class="card c1">Card 1</div><div class="card c2">Card 2</div></section>',
      animations: [
        {
          kind: 'css_transition',
          property: 'transform',
          durationMs: 300,
          delayMs: 100,
          timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          targetSelector: '.c1',
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_2_MOTION_RECORDED',
      expectedMinReconstructability: 0.90,
      expectedMotionKinds: ['css_transition'],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  // -------------------------------------------------------------------------
  // CLASS C: GSAP RUNTIME (Timeline, fromTo, ScrollTrigger)
  // -------------------------------------------------------------------------
  'fixture-06-gsap-timeline-fromto': {
    fixtureId: 'fixture-06-gsap-timeline-fromto',
    fixtureClass: 'CLASS_C_GSAP_RUNTIME',
    title: 'GSAP Text Reveal Section',
    category: 'Typography',
    description: 'Multi-stage GSAP timeline animating split text elements with power3.out easing.',
    observedData: {
      sectionId: 'sec-gc-06',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'GSAP Text Reveal Section',
      category: 'Typography',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#gsap-reveal',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 2800, width: 1440, height: 800, viewportRatio: 0.9 },
      rawHtml: '<section id="gsap-reveal"><h1 class="reveal-char">Award Winning Work</h1></section>',
      animations: [
        {
          kind: 'gsap_timeline',
          timelineId: 'tl-reveal-01',
          durationMs: 1400,
          totalDurationMs: 1400,
          repeat: 0,
          yoyo: false,
          tweens: [
            {
              targetSelector: '.reveal-char',
              propertiesFrom: { opacity: 0, y: 80, rotateZ: 5 },
              propertiesTo: { opacity: 1, y: 0, rotateZ: 0 },
              duration: 1.4,
              ease: 'power3.out',
            },
          ],
        },
      ],
      dependencies: [{ name: 'gsap', category: 'animation_lib', version: '^3.12.5', confidence: 1.0 }],
    },
    expectation: {
      expectedTier: 'TIER_2_MOTION_RECORDED',
      expectedMinReconstructability: 0.94,
      expectedMotionKinds: ['gsap_timeline'],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-07-gsap-scrolltrigger-pin': {
    fixtureId: 'fixture-07-gsap-scrolltrigger-pin',
    fixtureClass: 'CLASS_C_GSAP_RUNTIME',
    title: 'Pinned Showcase Section',
    category: 'Showcase',
    description: 'GSAP ScrollTrigger pin container with scrubbed progress bar and pinned panels.',
    observedData: {
      sectionId: 'sec-gc-07',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Pinned Showcase Section',
      category: 'Showcase',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#pin-showcase',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 3600, width: 1440, height: 900, viewportRatio: 1.0 },
      rawHtml: '<section id="pin-showcase"><div class="panel">Pinned Panel</div></section>',
      animations: [
        {
          kind: 'scroll_trigger',
          triggerSelector: '#pin-showcase',
          start: 'top top',
          end: '+=1500',
          scrub: 1.2,
          pin: true,
          markers: false,
        },
      ],
      dependencies: [{ name: 'gsap', category: 'animation_lib', version: '^3.12.5', confidence: 1.0 }],
    },
    expectation: {
      expectedTier: 'TIER_2_MOTION_RECORDED',
      expectedMinReconstructability: 0.94,
      expectedMotionKinds: ['scroll_trigger'],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  // -------------------------------------------------------------------------
  // CLASS D: INTERACTION BEHAVIOR (Pointermove physics, click deltas)
  // -------------------------------------------------------------------------
  'fixture-08-pointermove-spring-physics': {
    fixtureId: 'fixture-08-pointermove-spring-physics',
    fixtureClass: 'CLASS_D_INTERACTION',
    title: 'Magnetic Button Section',
    category: 'Interactive',
    description: 'Button element with magnetic pointer-following spring physics.',
    observedData: {
      sectionId: 'sec-gc-08',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Magnetic Button Section',
      category: 'Interactive',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#magnetic-btn',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 4500, width: 1440, height: 400, viewportRatio: 0.5 },
      rawHtml: '<section id="magnetic-btn"><button class="btn-mag">Hover Me</button></section>',
      interactions: [
        {
          id: 'int-mag-01',
          triggerType: 'pointermove',
          targetSelector: '.btn-mag',
          styleDeltas: [
            { selector: '.btn-mag', property: 'transform', beforeValue: 'matrix(1, 0, 0, 1, 0, 0)', afterValue: 'matrix(1, 0, 0, 1, 14, -8)' },
          ],
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_3_INTERACTION_RECOVERED',
      expectedMinReconstructability: 0.85,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-09-click-state-mutation': {
    fixtureId: 'fixture-09-click-state-mutation',
    fixtureClass: 'CLASS_D_INTERACTION',
    title: 'FAQ Accordion Section',
    category: 'Interactive',
    description: 'Collapsible accordion items with click toggle state and height animation.',
    observedData: {
      sectionId: 'sec-gc-09',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'FAQ Accordion Section',
      category: 'Interactive',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#faq-sec',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 5000, width: 1440, height: 600, viewportRatio: 0.7 },
      rawHtml: '<section id="faq-sec"><div class="faq-item"><button>Question 1</button><div class="faq-body">Answer</div></div></section>',
      interactions: [
        {
          id: 'int-click-01',
          triggerType: 'click',
          targetSelector: '.faq-item button',
          styleDeltas: [
            { selector: '.faq-body', property: 'max-height', beforeValue: '0px', afterValue: '240px' },
          ],
        },
      ],
    },
    expectation: {
      expectedTier: 'TIER_3_INTERACTION_RECOVERED',
      expectedMinReconstructability: 0.85,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  // -------------------------------------------------------------------------
  // CLASS E: HOSTILE / DYNAMIC WEBSITES
  // -------------------------------------------------------------------------
  'fixture-10-react-hydration-delayed': {
    fixtureId: 'fixture-10-react-hydration-delayed',
    fixtureClass: 'CLASS_E_HOSTILE_DYNAMIC',
    title: 'Hydrated Dynamic Feed Section',
    category: 'Feed',
    description: 'Next.js client-hydrated feed component with delayed DOM insertion and SSR placeholder removal.',
    observedData: {
      sectionId: 'sec-gc-10',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Hydrated Dynamic Feed Section',
      category: 'Feed',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#hydrated-feed',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 5700, width: 1440, height: 700, viewportRatio: 0.8 },
      rawHtml: '<section id="hydrated-feed" data-hydrate="done"><div class="feed-item">Post 1</div></section>',
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 1.0,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-11-dynamic-css-modules': {
    fixtureId: 'fixture-11-dynamic-css-modules',
    fixtureClass: 'CLASS_E_HOSTILE_DYNAMIC',
    title: 'Hashed CSS Module Section',
    category: 'Layout',
    description: 'Production website with hashed class names (e.g. .Hero_card__a8f9x) requiring scoped normalization.',
    observedData: {
      sectionId: 'sec-gc-11',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Hashed CSS Module Section',
      category: 'Layout',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '.Hero_root__98f3z',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 6400, width: 1440, height: 500, viewportRatio: 0.6 },
      rawHtml: '<section class="Hero_root__98f3z"><div class="Hero_card__a8f9x">Hashed Content</div></section>',
      scopedCss: '.Hero_root__98f3z { display: flex; } .Hero_card__a8f9x { padding: 16px; }',
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 1.0,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-12-smooth-scroll-wrapper': {
    fixtureId: 'fixture-12-smooth-scroll-wrapper',
    fixtureClass: 'CLASS_E_HOSTILE_DYNAMIC',
    title: 'Lenis Smooth Scroll Section',
    category: 'Showcase',
    description: 'Section operating inside body-level Lenis smooth scroll coordinate space.',
    observedData: {
      sectionId: 'sec-gc-12',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: 'Lenis Smooth Scroll Section',
      category: 'Showcase',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#lenis-section',
      domTagName: 'SECTION',
      bounds: { x: 0, y: 7000, width: 1440, height: 900, viewportRatio: 1.0 },
      rawHtml: '<section id="lenis-section"><div class="parallax-layer">Parallax Layer</div></section>',
      dependencies: [{ name: 'lenis', category: 'animation_lib', version: '^1.1.0', confidence: 1.0 }],
    },
    expectation: {
      expectedTier: 'TIER_1_DETERMINISTIC',
      expectedMinReconstructability: 0.90,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: [],
      isCompleteSceneReconstructionExpected: false,
      isFullScrollEngineReconstructionExpected: false,
    },
  },

  'fixture-13-webgl-canvas-shader': {
    fixtureId: 'fixture-13-webgl-canvas-shader',
    fixtureClass: 'CLASS_E_HOSTILE_DYNAMIC',
    title: '3D WebGL Shader Experience',
    category: '3D',
    description: 'WebGL shader canvas captured with lossless static frame buffer fallback.',
    observedData: {
      sectionId: 'sec-gc-13',
      websiteId: 'web-gc',
      pageId: 'page-gc',
      title: '3D WebGL Shader Experience',
      category: '3D',
      sourceUrl: 'https://example.com',
      pagePath: '/',
      domSelector: '#webgl-canvas-hero',
      domTagName: 'CANVAS',
      bounds: { x: 0, y: 8000, width: 1440, height: 900, viewportRatio: 1.0 },
      rawHtml: '<canvas id="webgl-canvas-hero"></canvas>',
      canvasEvidence: [
        {
          kind: 'webgl_static_fallback',
          canvasSelector: '#webgl-canvas-hero',
          contextType: 'webgl2',
          width: 1440,
          height: 900,
          staticSnapshotAssetId: 'asset-webgl-frame',
          estimatedFps: 60,
        },
      ],
      dependencies: [{ name: 'three.js', category: '3d_lib', version: '^0.160.0', confidence: 1.0 }],
    },
    expectation: {
      expectedTier: 'TIER_4_CANVAS_FALLBACK',
      expectedMinReconstructability: 0.75,
      expectedMotionKinds: [],
      expectedAssetCount: 0,
      expectedCanvasKinds: ['webgl_static_fallback'],
      isCompleteSceneReconstructionExpected: false, // Rule: Lossless fallback without full scene extraction
      isFullScrollEngineReconstructionExpected: false,
    },
  },
};
