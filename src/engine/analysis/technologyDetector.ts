export interface DiscoveredEvidence {
  source: 'global_variable' | 'script_url' | 'bundle_signature' | 'dom_attribute' | 'network_request';
  evidenceType: string;
  evidenceValue: string;
  confidence: number;
}

export interface DetectedTechnology {
  name: string;
  category: 'Framework' | 'Animation' | '3D/Graphics' | 'Utility';
  version?: string;
  iconName: string;
  description: string;
  confidence: number;
  evidence: DiscoveredEvidence[];
}

export interface TechnologyDetectionInput {
  htmlContent: string;
  scriptUrls: string[];
  networkUrls: string[];
  windowGlobals: string[];
  domAttributes: Record<string, string[]>;
}

export class TechnologyDetector {
  /**
   * Performs multi-signal evidence detection for technologies present on a page.
   */
  public detectTechnologies(input: TechnologyDetectionInput): DetectedTechnology[] {
    const detectedMap = new Map<string, DetectedTechnology>();

    const addEvidence = (
      techName: string,
      category: 'Framework' | 'Animation' | '3D/Graphics' | 'Utility',
      iconName: string,
      description: string,
      source: DiscoveredEvidence['source'],
      evidenceType: string,
      evidenceValue: string,
      weight: number,
      version?: string
    ) => {
      let existing = detectedMap.get(techName);
      if (!existing) {
        existing = {
          name: techName,
          category,
          iconName,
          description,
          version,
          confidence: 0,
          evidence: [],
        };
        detectedMap.set(techName, existing);
      }

      if (version && !existing.version) {
        existing.version = version;
      }

      existing.evidence.push({
        source,
        evidenceType,
        evidenceValue,
        confidence: weight,
      });

      // Calculate confidence using probabilistic OR: 1 - prod(1 - w_i)
      const unconfidence = existing.evidence.reduce((acc, ev) => acc * (1 - ev.confidence), 1);
      existing.confidence = Number((1 - unconfidence).toFixed(2));
    };

    const globalsSet = new Set(input.windowGlobals);
    const scriptUrlsLower = input.scriptUrls.map((u) => u.toLowerCase());
    const networkUrlsLower = input.networkUrls.map((u) => u.toLowerCase());
    const htmlLower = input.htmlContent.toLowerCase();

    // 1. FRAMEWORKS
    // React
    if (globalsSet.has('React') || globalsSet.has('ReactDOM')) {
      addEvidence('React', 'Framework', 'react', 'React UI library', 'global_variable', 'window_global', 'window.React', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('react.production') || u.includes('react.development') || u.includes('/react@') || u.includes('/react/'))) {
      addEvidence('React', 'Framework', 'react', 'React UI library', 'script_url', 'script_src', 'react bundle script', 0.7);
    }
    if (htmlLower.includes('data-reactroot') || htmlLower.includes('__reactfiber')) {
      addEvidence('React', 'Framework', 'react', 'React UI library', 'dom_attribute', 'dom_marker', 'data-reactroot attribute', 0.85);
    }

    // Next.js
    if (globalsSet.has('__NEXT_DATA__') || globalsSet.has('next')) {
      addEvidence('Next.js', 'Framework', 'nextjs', 'Next.js React Framework', 'global_variable', 'window_global', 'window.__NEXT_DATA__', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('/_next/static/'))) {
      addEvidence('Next.js', 'Framework', 'nextjs', 'Next.js React Framework', 'script_url', 'script_src', '/_next/static/ script path', 0.9);
    }
    if (htmlLower.includes('__next')) {
      addEvidence('Next.js', 'Framework', 'nextjs', 'Next.js React Framework', 'dom_attribute', 'dom_marker', 'id="__next" container', 0.8);
    }

    // Vue
    if (globalsSet.has('Vue') || globalsSet.has('__VUE__')) {
      addEvidence('Vue.js', 'Framework', 'vue', 'Vue.js Framework', 'global_variable', 'window_global', 'window.Vue', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('vue.min.js') || u.includes('vue.global') || u.includes('/vue@') || u.includes('/vue/'))) {
      addEvidence('Vue.js', 'Framework', 'vue', 'Vue.js Framework', 'script_url', 'script_src', 'vue script file', 0.7);
    }
    if (htmlLower.includes('data-v-') || htmlLower.includes('v-bind') || htmlLower.includes('v-model')) {
      addEvidence('Vue.js', 'Framework', 'vue', 'Vue.js Framework', 'dom_attribute', 'dom_marker', 'Vue template directive attribute', 0.8);
    }

    // Nuxt
    if (globalsSet.has('$nuxt') || globalsSet.has('__NUXT__')) {
      addEvidence('Nuxt', 'Framework', 'nuxt', 'Nuxt Vue Framework', 'global_variable', 'window_global', 'window.$nuxt', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('/_nuxt/'))) {
      addEvidence('Nuxt', 'Framework', 'nuxt', 'Nuxt Vue Framework', 'script_url', 'script_src', '/_nuxt/ path', 0.9);
    }

    // Svelte
    if (scriptUrlsLower.some((u) => u.includes('svelte'))) {
      addEvidence('Svelte', 'Framework', 'svelte', 'Svelte UI Framework', 'script_url', 'script_src', 'svelte bundle reference', 0.6);
    }
    if (htmlLower.includes('svelte-')) {
      addEvidence('Svelte', 'Framework', 'svelte', 'Svelte UI Framework', 'dom_attribute', 'dom_marker', 'svelte class prefix', 0.85);
    }

    // Angular
    if (globalsSet.has('ng') || globalsSet.has('getAllAngularRootElements')) {
      addEvidence('Angular', 'Framework', 'angular', 'Angular Web Framework', 'global_variable', 'window_global', 'window.ng', 0.95);
    }
    if (htmlLower.includes('ng-version') || htmlLower.includes('ng-app')) {
      addEvidence('Angular', 'Framework', 'angular', 'Angular Web Framework', 'dom_attribute', 'dom_marker', 'ng-version attribute', 0.9);
    }

    // 2. ANIMATION LIBRARIES
    // GSAP
    if (globalsSet.has('gsap') || globalsSet.has('TweenMax') || globalsSet.has('TweenLite')) {
      addEvidence('GSAP', 'Animation', 'gsap', 'GreenSock Animation Platform', 'global_variable', 'window_global', 'window.gsap', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('gsap') || u.includes('tweenmax'))) {
      addEvidence('GSAP', 'Animation', 'gsap', 'GreenSock Animation Platform', 'script_url', 'script_src', 'gsap script URL', 0.65);
    }

    // GSAP ScrollTrigger
    if (globalsSet.has('ScrollTrigger')) {
      addEvidence('ScrollTrigger', 'Animation', 'scrolltrigger', 'GSAP ScrollTrigger plugin', 'global_variable', 'window_global', 'window.ScrollTrigger', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('scrolltrigger'))) {
      addEvidence('ScrollTrigger', 'Animation', 'scrolltrigger', 'GSAP ScrollTrigger plugin', 'script_url', 'script_src', 'scrolltrigger script URL', 0.7);
    }

    // Framer Motion
    if (globalsSet.has('FramerMotion') || globalsSet.has('__FramerMotion__')) {
      addEvidence('Framer Motion', 'Animation', 'framer-motion', 'Framer Motion for React', 'global_variable', 'window_global', 'window.FramerMotion', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('framer-motion') || u.includes('framer_motion'))) {
      addEvidence('Framer Motion', 'Animation', 'framer-motion', 'Framer Motion for React', 'script_url', 'script_src', 'framer-motion script URL', 0.7);
    }
    if (htmlLower.includes('data-projection-id')) {
      addEvidence('Framer Motion', 'Animation', 'framer-motion', 'Framer Motion for React', 'dom_attribute', 'dom_marker', 'data-projection-id attribute', 0.85);
    }

    // Motion One / Motion
    if (globalsSet.has('Motion') || globalsSet.has('animate')) {
      addEvidence('Motion', 'Animation', 'motion', 'Motion One Animation Library', 'global_variable', 'window_global', 'window.Motion', 0.8);
    }

    // Anime.js
    if (globalsSet.has('anime')) {
      addEvidence('Anime.js', 'Animation', 'animejs', 'Anime.js animation engine', 'global_variable', 'window_global', 'window.anime', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('anime.min.js') || u.includes('/animejs/'))) {
      addEvidence('Anime.js', 'Animation', 'animejs', 'Anime.js animation engine', 'script_url', 'script_src', 'anime.js script URL', 0.7);
    }

    // AOS (Animate on Scroll)
    if (globalsSet.has('AOS')) {
      addEvidence('AOS', 'Animation', 'aos', 'Animate On Scroll Library', 'global_variable', 'window_global', 'window.AOS', 0.95);
    }
    if (htmlLower.includes('data-aos')) {
      addEvidence('AOS', 'Animation', 'aos', 'Animate On Scroll Library', 'dom_attribute', 'dom_marker', 'data-aos attribute', 0.9);
    }

    // Locomotive Scroll
    if (globalsSet.has('LocomotiveScroll')) {
      addEvidence('Locomotive Scroll', 'Animation', 'locomotive', 'Locomotive Scroll Smooth Scroll Engine', 'global_variable', 'window_global', 'window.LocomotiveScroll', 0.95);
    }
    if (htmlLower.includes('data-scroll-section') || htmlLower.includes('data-scroll')) {
      addEvidence('Locomotive Scroll', 'Animation', 'locomotive', 'Locomotive Scroll Smooth Scroll Engine', 'dom_attribute', 'dom_marker', 'data-scroll attribute', 0.85);
    }

    // Lenis
    if (globalsSet.has('Lenis')) {
      addEvidence('Lenis', 'Animation', 'lenis', 'Lenis Smooth Scroll Engine', 'global_variable', 'window_global', 'window.Lenis', 0.95);
    }
    if (htmlLower.includes('data-lenis-prevent')) {
      addEvidence('Lenis', 'Animation', 'lenis', 'Lenis Smooth Scroll Engine', 'dom_attribute', 'dom_marker', 'data-lenis-prevent attribute', 0.85);
    }

    // CSS Animations / Transitions
    if (htmlLower.includes('@keyframes') || htmlLower.includes('animation:') || htmlLower.includes('animation-name:')) {
      addEvidence('CSS Animations', 'Animation', 'css3', 'Native CSS @keyframes Animations', 'bundle_signature', 'css_rule', '@keyframes CSS definition', 0.85);
    }
    if (htmlLower.includes('transition:') || htmlLower.includes('transition-property:')) {
      addEvidence('CSS Transitions', 'Animation', 'css3', 'Native CSS Property Transitions', 'bundle_signature', 'css_rule', 'transition property declaration', 0.7);
    }

    // Web Animations API
    if (globalsSet.has('Element.prototype.animate') || htmlLower.includes('.animate(')) {
      addEvidence('Web Animations API', 'Animation', 'waapi', 'Native Web Animations API', 'bundle_signature', 'api_usage', 'Element.animate() call', 0.75);
    }

    // 3. 3D / GRAPHICS LIBRARIES
    // Three.js
    if (globalsSet.has('THREE')) {
      addEvidence('Three.js', '3D/Graphics', 'threejs', 'Three.js 3D WebGL Library', 'global_variable', 'window_global', 'window.THREE', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('three.min.js') || u.includes('three.module') || u.includes('/three@') || u.includes('/three/'))) {
      addEvidence('Three.js', '3D/Graphics', 'threejs', 'Three.js 3D WebGL Library', 'script_url', 'script_src', 'three.js script URL', 0.75);
    }
    if (networkUrlsLower.some((u) => u.endsWith('.gltf') || u.endsWith('.glb'))) {
      addEvidence('Three.js', '3D/Graphics', 'threejs', 'Three.js 3D WebGL Library', 'network_request', 'asset_fetch', 'GLTF/GLB 3D model network request', 0.6);
    }

    // Babylon.js
    if (globalsSet.has('BABYLON')) {
      addEvidence('Babylon.js', '3D/Graphics', 'babylonjs', 'Babylon.js 3D Engine', 'global_variable', 'window_global', 'window.BABYLON', 0.95);
    }
    if (scriptUrlsLower.some((u) => u.includes('babylon.js') || u.includes('/babylonjs/'))) {
      addEvidence('Babylon.js', '3D/Graphics', 'babylonjs', 'Babylon.js 3D Engine', 'script_url', 'script_src', 'babylon.js script URL', 0.75);
    }

    // WebGL / Canvas
    if (htmlLower.includes('<canvas')) {
      addEvidence('Canvas 2D / WebGL Container', '3D/Graphics', 'canvas', 'HTML5 Canvas Rendering Surface', 'dom_attribute', 'dom_element', '<canvas> DOM element', 0.5);
    }

    // Filter results to only return technologies with non-zero confidence
    return Array.from(detectedMap.values()).filter((t) => t.confidence > 0.1);
  }
}
