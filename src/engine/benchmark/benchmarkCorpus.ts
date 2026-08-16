import { BenchmarkCorpusItem, BenchmarkSiteId } from './types';

export const BENCHMARK_CORPUS: Record<BenchmarkSiteId, BenchmarkCorpusItem> = {
  trionn: {
    id: 'trionn',
    name: 'Trionn Creative Agency',
    url: 'https://trionn.com/',
    normalizedUrl: 'https://trionn.com',
    primaryCategory: 'CREATIVE_STUDIO',
    observedCapabilities: ['CREATIVE_STUDIO', 'GSAP_HEAVY', 'SCROLL_DRIVEN', 'CUSTOM_CURSOR', 'WEBGL', 'PARALLAX', 'RESPONSIVE'],
    description: 'Award-winning digital agency featuring smooth momentum scrolling, WebGL interactive canvas, custom magnetic cursor, and complex GSAP timeline interactions.',
    techStackExpected: ['GSAP', 'ScrollTrigger', 'Three.js', 'LocomotiveScroll', 'TailwindCSS'],
    testFocus: ['Scroll-triggered typography reveals', 'Magnetic cursor tracking', 'WebGL canvas shader background', 'Dark mode palette scoping'],
  },
  noth_in: {
    id: 'noth_in',
    name: 'Nothing Studio / Design Portfolio',
    url: 'https://www.noth.in/',
    normalizedUrl: 'https://www.noth.in',
    primaryCategory: 'STATIC_EDITORIAL',
    observedCapabilities: ['STATIC_EDITORIAL', 'PORTFOLIO', 'MARQUEE', 'CUSTOM_CURSOR', 'RESPONSIVE'],
    description: 'High-minimalist editorial design featuring infinite typography marquees, high-contrast monospace typography, and clean semantic section dividers.',
    techStackExpected: ['Vanilla CSS', 'CSS Animations', 'Web Components', 'Custom Fonts'],
    testFocus: ['Infinite CSS marquee loops', 'Variable font weight transitions', 'High-contrast monochrome themes', 'Zero global CSS leak'],
  },
  cula_tech: {
    id: 'cula_tech',
    name: 'Cula Technologies (About)',
    url: 'https://www.cula.tech/about',
    normalizedUrl: 'https://www.cula.tech/about',
    primaryCategory: 'PRODUCT_MARKETING',
    observedCapabilities: ['PRODUCT_MARKETING', 'THREE_JS', 'WEBGL', 'CANVAS', 'PINNED_SCROLL', 'RESPONSIVE'],
    description: 'B2B carbon removal platform with interactive 3D particle systems, Spline 3D embeds, sticky section pinning, and glassmorphic telemetry cards.',
    techStackExpected: ['Three.js', 'WebGL2', 'GLSL Shaders', 'Framer Motion', 'React'],
    testFocus: ['3D WebGL canvas isolation without execution', 'Sticky pinned timeline cards', 'Glassmorphism backdrop-filter extraction', 'Safe shader string retention'],
  },
  nk_studio: {
    id: 'nk_studio',
    name: 'NK Studio Experience',
    url: 'https://www.nk.studio/',
    normalizedUrl: 'https://www.nk.studio',
    primaryCategory: 'CREATIVE_STUDIO',
    observedCapabilities: ['CREATIVE_STUDIO', 'VIDEO_HEAVY', 'HORIZONTAL_SCROLL', 'CUSTOM_CURSOR', 'EXPERIMENTAL'],
    description: 'Full-bleed video background showcase with horizontal card track scrolling, sound toggle state triggers, and interactive portfolio project modals.',
    techStackExpected: ['HTML5 Video', 'GSAP', 'ScrollTrigger', 'Lenis Scroll'],
    testFocus: ['HTML5 video poster and source asset discovery', 'Horizontal transform calculation', 'Sound state button extraction', 'Fullscreen modal container isolation'],
  },
  vero_studio: {
    id: 'vero_studio',
    name: 'Vero Studio Portfolio',
    url: 'https://www.verostudio.com/',
    normalizedUrl: 'https://www.verostudio.com',
    primaryCategory: 'PORTFOLIO',
    observedCapabilities: ['PORTFOLIO', 'CREATIVE_STUDIO', 'SHADER', 'PINNED_SCROLL', 'SCROLL_DRIVEN', 'RESPONSIVE'],
    description: 'Architecture & spatial design showcase utilizing WebGL ripple distortion shaders on image hover, sticky pinned case studies, and smooth layout transitions.',
    techStackExpected: ['Three.js', 'Curtains.js', 'GSAP', 'GLSL Fragment Shaders'],
    testFocus: ['Image texture shader metadata parsing', 'Sticky project preview panels', 'Hover event capture without JS execution', 'Clean scoped CSS layout'],
  },
  ciao_energy: {
    id: 'ciao_energy',
    name: 'Ciao Energy Brand',
    url: 'https://www.ciaoenergy.com/',
    normalizedUrl: 'https://www.ciaoenergy.com',
    primaryCategory: 'PRODUCT_MARKETING',
    observedCapabilities: ['PRODUCT_MARKETING', 'LOTTIE', 'SVG_ANIMATION', 'MOUSE_INTERACTION', 'RESPONSIVE'],
    description: 'Vibrant consumer beverage website featuring vector SVG path morphing, interactive can rotation, Lottie sticker animations, and multi-breakpoint responsive grid.',
    techStackExpected: ['Lottie Web', 'SVG SMIL / CSS', 'TailwindCSS', 'Alpine.js'],
    testFocus: ['Lottie JSON asset discovery & extraction', 'SVG morphing path retention', 'Mobile-first viewport fidelity at 375px', 'Asset path portability'],
  },
  made_with_gsap_home: {
    id: 'made_with_gsap_home',
    name: 'Made With GSAP Showcase',
    url: 'https://madewithgsap.com/',
    normalizedUrl: 'https://madewithgsap.com',
    primaryCategory: 'CMS_DRIVEN',
    observedCapabilities: ['CMS_DRIVEN', 'PORTFOLIO', 'INFINITE_SCROLL', 'GSAP_HEAVY', 'RESPONSIVE'],
    description: 'Curated showcase directory featuring masonry card grid layout, category filtering tabs, search filter inputs, and rich preview modal drawers.',
    techStackExpected: ['GSAP', 'Next.js', 'TailwindCSS', 'Masonry Grid'],
    testFocus: ['Card component boundary identification', 'Category filter tab extraction', 'Evidence-derived prop discovery for cards', 'Clean reusable component packaging'],
  },
  made_with_gsap_effects: {
    id: 'made_with_gsap_effects',
    name: 'Made With GSAP — Effects Directory',
    url: 'https://madewithgsap.com/effects/',
    normalizedUrl: 'https://madewithgsap.com/effects',
    primaryCategory: 'GSAP_HEAVY',
    observedCapabilities: ['GSAP_HEAVY', 'INTERACTION_ANALYSIS_FAILURE' as any, 'SCROLL_DRIVEN', 'MOUSE_INTERACTION'],
    description: 'Interactive directory of animation effects with parameter controls, live code snippets, timeline scrubbers, and trigger buttons.',
    techStackExpected: ['GSAP', 'ScrollTrigger', 'SplitText', 'MorphSVG'],
    testFocus: ['Timeline parameter analysis', 'Keyframe easing profile extraction', 'Read-only code snippet capture', 'Safe dependency attribution'],
  },
  obys_experiment: {
    id: 'obys_experiment',
    name: 'Obys Agency Experiments',
    url: 'https://experiment.obys.agency/',
    normalizedUrl: 'https://experiment.obys.agency',
    primaryCategory: 'EXPERIMENTAL',
    observedCapabilities: ['EXPERIMENTAL', 'WEBGL', 'SHADER', 'MOUSE_INTERACTION', 'CANVAS'],
    description: 'Experimental typography showcase featuring interactive fluid WebGL distortion shaders following pointer velocity, custom cursor trail, and audio visualizer.',
    techStackExpected: ['WebGL', 'GLSL Shaders', 'Three.js', 'Canvas 2D', 'Web Audio API'],
    testFocus: ['Safe classification as WEBGL_PARTIAL/WEBGL_NATIVE', 'Fluid canvas discovery without node execution', 'Pointer velocity event logging', 'Structured failure diagnostics'],
  },
  artem_portfolio: {
    id: 'artem_portfolio',
    name: 'Artem Portfolio',
    url: 'https://artemartemartem.com/',
    normalizedUrl: 'https://artemartemartem.com',
    primaryCategory: 'PORTFOLIO',
    observedCapabilities: ['PORTFOLIO', 'DRAG_INTERACTION', 'THREE_JS', 'EXPERIMENTAL', 'RESPONSIVE'],
    description: 'Playful retro aesthetic portfolio featuring physics-based draggable cards, 3D floating icons, sound effect triggers, and dynamic layout shuffling.',
    techStackExpected: ['Matter.js / Cannon.js', 'Three.js', 'GSAP Draggable', 'CSS Transforms'],
    testFocus: ['Draggable container identification without state fabrication', 'Floating card component isolation', 'Relative asset link integrity', 'Graceful runtime degradation'],
  },
  normal_is_boring: {
    id: 'normal_is_boring',
    name: 'Normal is Boring Studio',
    url: 'https://normalisboring.es/',
    normalizedUrl: 'https://normalisboring.es',
    primaryCategory: 'CREATIVE_STUDIO',
    observedCapabilities: ['CREATIVE_STUDIO', 'SCROLL_DRIVEN', 'PINNED_SCROLL', 'HORIZONTAL_SCROLL', 'RESPONSIVE'],
    description: 'High-concept brutalist branding studio featuring scroll-jacked reveals, oversized typography, high-contrast layouts, and horizontal section transitions.',
    techStackExpected: ['GSAP ScrollTrigger', 'LocomotiveScroll', 'Custom Web Fonts', 'SVG'],
    testFocus: ['Scroll-jacked section boundary detection', 'Oversized typography CSS clamp isolation', 'Horizontal scroll container handling', 'Deterministic TSX generation'],
  },
};

export class BenchmarkCorpusManager {
  public static getAllItems(): BenchmarkCorpusItem[] {
    return Object.values(BENCHMARK_CORPUS);
  }

  public static getItemById(id: BenchmarkSiteId): BenchmarkCorpusItem | undefined {
    return BENCHMARK_CORPUS[id];
  }

  public static normalizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase();
      let path = parsed.pathname;
      if (path === '/') {
        path = '';
      } else if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return `${parsed.protocol}//${host}${path}`;
    } catch {
      return rawUrl.trim().replace(/\/+$/, '');
    }
  }

  public static findByUrl(url: string): BenchmarkCorpusItem | undefined {
    const norm = this.normalizeUrl(url);
    return Object.values(BENCHMARK_CORPUS).find((item) => item.normalizedUrl === norm || item.url === url);
  }
}
