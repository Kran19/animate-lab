import { BENCHMARK_CORPUS } from '../../../src/engine/benchmark/benchmarkCorpus';
import { BenchmarkFixtureData } from '../../../src/engine/benchmark/benchmarkRunner';
import { BenchmarkSiteId } from '../../../src/engine/benchmark/types';

export const BENCHMARK_FIXTURES: Record<BenchmarkSiteId, BenchmarkFixtureData> = {
  trionn: {
    corpusItem: BENCHMARK_CORPUS.trionn,
    rawHtml: `
      <section class="trionn-hero" data-section="hero">
        <div class="trionn-container">
          <h1 class="trionn-headline" data-animate="split-text">We Craft Award-Winning Digital Experiences</h1>
          <p class="trionn-subhead">A full-service creative agency pushing the boundaries of web animation.</p>
          <div class="trionn-cta-group">
            <button class="trionn-btn-magnetic" data-magnetic="true"><span>Explore Case Studies</span></button>
            <button class="trionn-btn-secondary"><span>Contact Studio</span></button>
          </div>
          <div class="trionn-webgl-wrapper" data-canvas="interactive-globe">
            <canvas id="webgl-canvas" class="trionn-canvas" width="1200" height="800"></canvas>
          </div>
        </div>
      </section>
    `,
    css: `
      .trionn-hero { position: relative; width: 100%; min-height: 100vh; background: #0a0a0c; color: #ffffff; display: flex; align-items: center; justify-content: center; }
      .trionn-container { max-width: 1440px; margin: 0 auto; padding: 0 40px; text-align: center; }
      .trionn-headline { font-size: clamp(2.5rem, 6vw, 5.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 24px; }
      .trionn-subhead { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); max-width: 680px; margin: 0 auto 40px; }
      .trionn-btn-magnetic { display: inline-flex; align-items: center; justify-content: center; padding: 18px 36px; border-radius: 9999px; background: #6366f1; color: #ffffff; border: none; font-weight: 600; cursor: pointer; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      .trionn-canvas { position: absolute; inset: 0; pointer-events: none; opacity: 0.6; }
    `,
    jsSnippet: `// GSAP ScrollTrigger timeline\ngsap.from(".trionn-headline", { opacity: 0, y: 60, duration: 1.2, ease: "power3.out" });`,
    expectedResources: [
      { url: 'https://trionn.com/assets/logo.svg', mimeType: 'image/svg+xml', sizeBytes: 3400 },
      { url: 'https://trionn.com/assets/hero-bg.webp', mimeType: 'image/webp', sizeBytes: 124000 },
      { url: 'https://trionn.com/fonts/ClashDisplay.woff2', mimeType: 'font/woff2', sizeBytes: 48000 },
    ],
    expectedAnimations: [
      { name: 'heroTextReveal', library: 'GSAP', trigger: 'load', durationMs: 1200, easing: 'power3.out' },
      { name: 'magneticButtonHover', library: 'GSAP', trigger: 'hover', durationMs: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    ],
    expectedTechs: ['GSAP', 'ScrollTrigger', 'Three.js', 'TailwindCSS'],
  },

  noth_in: {
    corpusItem: BENCHMARK_CORPUS.noth_in,
    rawHtml: `
      <header class="nothin-header">
        <div class="nothin-brand"><span class="nothin-logo">NOTH.IN</span></div>
        <nav class="nothin-nav"><a href="#work">Index</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      </header>
      <section class="nothin-marquee-section">
        <div class="nothin-marquee-track">
          <span class="nothin-marquee-item">CREATIVE DIRECTION — EDITORIAL DESIGN — DIGITAL ARCHITECTURE — </span>
          <span class="nothin-marquee-item" aria-hidden="true">CREATIVE DIRECTION — EDITORIAL DESIGN — DIGITAL ARCHITECTURE — </span>
        </div>
      </section>
    `,
    css: `
      .nothin-header { display: flex; justify-content: space-between; align-items: center; padding: 32px 48px; font-family: monospace; border-bottom: 1px solid #e5e5e5; }
      .nothin-marquee-section { overflow: hidden; white-space: nowrap; padding: 48px 0; background: #000000; color: #ffffff; }
      .nothin-marquee-track { display: flex; animation: nothin-marquee-scroll 20s linear infinite; }
      .nothin-marquee-item { font-size: 3rem; font-weight: 700; text-transform: uppercase; padding-right: 2rem; }
      @keyframes nothin-marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    `,
    expectedResources: [
      { url: 'https://www.noth.in/assets/monotype.woff2', mimeType: 'font/woff2', sizeBytes: 28000 },
    ],
    expectedAnimations: [
      { name: 'marqueeScrollLoop', library: 'CSS Keyframes', trigger: 'continuous', durationMs: 20000, easing: 'linear' },
    ],
    expectedTechs: ['Vanilla CSS', 'Custom Fonts'],
  },

  cula_tech: {
    corpusItem: BENCHMARK_CORPUS.cula_tech,
    rawHtml: `
      <section class="cula-about-section">
        <div class="cula-grid">
          <div class="cula-card cula-glassmorphic">
            <h2 class="cula-card-title">Carbon Removal Telemetry</h2>
            <p class="cula-card-desc">Quantified, verified, and permanent removal protocols.</p>
            <div class="cula-stat-box"><span class="cula-stat-val">12,450 t</span><span class="cula-stat-lbl">CO2 Neutralized</span></div>
          </div>
          <div class="cula-model-container" data-model="spline-carbon-sphere">
            <canvas id="cula-3d-canvas" class="cula-canvas" width="600" height="600"></canvas>
          </div>
        </div>
      </section>
    `,
    css: `
      .cula-about-section { padding: 80px 24px; max-width: 1280px; margin: 0 auto; }
      .cula-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; align-items: center; }
      .cula-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 40px; color: #ffffff; }
      .cula-card-title { font-size: 2rem; font-weight: 700; margin-bottom: 12px; }
      .cula-stat-val { font-size: 2.5rem; font-weight: 800; color: #10b981; font-family: monospace; }
    `,
    expectedResources: [
      { url: 'https://www.cula.tech/models/carbon_sphere.gltf', mimeType: 'model/gltf+json', sizeBytes: 450000 },
      { url: 'https://www.cula.tech/textures/particle_noise.png', mimeType: 'image/png', sizeBytes: 32000 },
    ],
    expectedAnimations: [
      { name: 'sphereRotationLoop', library: 'Three.js / WebGL', trigger: 'render-loop', durationMs: 8000, easing: 'linear' },
    ],
    expectedTechs: ['Three.js', 'WebGL2', 'React', 'Framer Motion'],
  },

  nk_studio: {
    corpusItem: BENCHMARK_CORPUS.nk_studio,
    rawHtml: `
      <section class="nk-horizontal-showcase" data-scroll="horizontal">
        <div class="nk-video-bg">
          <video autoplay loop muted playsinline poster="https://www.nk.studio/poster.webp" class="nk-video">
            <source src="https://www.nk.studio/showreel.mp4" type="video/mp4">
          </video>
        </div>
        <div class="nk-track">
          <article class="nk-slide"><h3 class="nk-project-title">Future Form</h3><span class="nk-tag">Identity</span></article>
          <article class="nk-slide"><h3 class="nk-project-title">Neo Velocity</h3><span class="nk-tag">Motion</span></article>
        </div>
      </section>
    `,
    css: `
      .nk-horizontal-showcase { position: relative; height: 100vh; overflow: hidden; display: flex; align-items: center; }
      .nk-video-bg { position: absolute; inset: 0; z-index: -1; }
      .nk-video { width: 100%; height: 100%; object-fit: cover; }
      .nk-track { display: flex; gap: 40px; padding: 0 80px; }
      .nk-slide { min-width: 420px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); padding: 32px; border-radius: 16px; color: #fff; }
    `,
    expectedResources: [
      { url: 'https://www.nk.studio/poster.webp', mimeType: 'image/webp', sizeBytes: 85000 },
      { url: 'https://www.nk.studio/showreel.mp4', mimeType: 'video/mp4', sizeBytes: 4200000 },
    ],
    expectedAnimations: [
      { name: 'horizontalTrackPan', library: 'GSAP ScrollTrigger', trigger: 'scroll', durationMs: 1500, easing: 'power2.out' },
    ],
    expectedTechs: ['HTML5 Video', 'GSAP', 'ScrollTrigger'],
  },

  vero_studio: {
    corpusItem: BENCHMARK_CORPUS.vero_studio,
    rawHtml: `
      <section class="vero-project-grid">
        <div class="vero-card" data-project="lumina">
          <div class="vero-img-wrapper" data-shader="ripple">
            <img src="https://www.verostudio.com/project1.jpg" alt="Lumina Project" class="vero-img" />
          </div>
          <div class="vero-info"><h4 class="vero-title">Lumina Spatial Design</h4><p class="vero-cat">Architecture</p></div>
        </div>
      </section>
    `,
    css: `
      .vero-project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 48px; padding: 64px 32px; }
      .vero-img-wrapper { position: relative; overflow: hidden; border-radius: 12px; height: 480px; }
      .vero-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .vero-img-wrapper:hover .vero-img { transform: scale(1.05); }
      .vero-info { margin-top: 16px; display: flex; justify-content: space-between; font-family: sans-serif; }
    `,
    expectedResources: [
      { url: 'https://www.verostudio.com/project1.jpg', mimeType: 'image/jpeg', sizeBytes: 210000 },
    ],
    expectedAnimations: [
      { name: 'imageScaleHover', library: 'CSS Transitions', trigger: 'hover', durationMs: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    ],
    expectedTechs: ['Curtains.js', 'GSAP', 'GLSL Fragment Shaders'],
  },

  ciao_energy: {
    corpusItem: BENCHMARK_CORPUS.ciao_energy,
    rawHtml: `
      <section class="ciao-hero">
        <div class="ciao-badge"><span>100% Organic Energy</span></div>
        <h1 class="ciao-title">Spark Your Mind</h1>
        <div class="ciao-can-wrapper" data-lottie="can-spin">
          <svg class="ciao-vector-svg" viewBox="0 0 200 400"><path d="M20,40 C50,20 150,20 180,40 L180,360 C150,380 50,380 20,360 Z" fill="#ff4757" /></svg>
        </div>
      </section>
    `,
    css: `
      .ciao-hero { text-align: center; padding: 60px 20px; background: #ffeaa7; color: #2d3436; }
      .ciao-badge { display: inline-block; padding: 6px 14px; background: #ff4757; color: #fff; border-radius: 20px; font-weight: 700; }
      .ciao-title { font-size: clamp(2rem, 5vw, 4.5rem); margin: 20px 0; font-weight: 900; }
      .ciao-can-wrapper { width: 220px; height: 380px; margin: 0 auto; }
    `,
    expectedResources: [
      { url: 'https://www.ciaoenergy.com/lottie/can_sparkle.json', mimeType: 'application/json', sizeBytes: 64000 },
    ],
    expectedAnimations: [
      { name: 'lottieSparkleAnimation', library: 'Lottie Web', trigger: 'autoplay', durationMs: 3000, easing: 'linear' },
    ],
    expectedTechs: ['Lottie Web', 'SVG SMIL', 'TailwindCSS'],
  },

  made_with_gsap_home: {
    corpusItem: BENCHMARK_CORPUS.made_with_gsap_home,
    rawHtml: `
      <main class="mwg-main">
        <nav class="mwg-tabs"><button class="mwg-tab mwg-tab-active">All</button><button class="mwg-tab">3D</button><button class="mwg-tab">Typography</button></nav>
        <div class="mwg-masonry">
          <div class="mwg-card"><h4 class="mwg-card-title">Stripe Press</h4><span class="mwg-tag">WebGL</span></div>
          <div class="mwg-card"><h4 class="mwg-card-title">Apple Vision Pro</h4><span class="mwg-tag">ScrollTrigger</span></div>
        </div>
      </main>
    `,
    css: `
      .mwg-main { max-width: 1360px; margin: 0 auto; padding: 40px 24px; }
      .mwg-tabs { display: flex; gap: 8px; margin-bottom: 32px; }
      .mwg-tab { padding: 8px 18px; border-radius: 8px; border: 1px solid #333; background: #111; color: #fff; cursor: pointer; }
      .mwg-tab-active { background: #6366f1; border-color: #6366f1; }
      .mwg-masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
      .mwg-card { background: #1a1a1a; padding: 24px; border-radius: 12px; border: 1px solid #2a2a2a; }
    `,
    expectedResources: [
      { url: 'https://madewithgsap.com/assets/favicon.svg', mimeType: 'image/svg+xml', sizeBytes: 2400 },
    ],
    expectedAnimations: [
      { name: 'cardStaggerFade', library: 'GSAP', trigger: 'load', durationMs: 800, easing: 'power2.out' },
    ],
    expectedTechs: ['GSAP', 'Next.js', 'TailwindCSS'],
  },

  made_with_gsap_effects: {
    corpusItem: BENCHMARK_CORPUS.made_with_gsap_effects,
    rawHtml: `
      <section class="mwg-effects-section">
        <h2 class="mwg-heading">ScrollTrigger Velocity Tilt Effect</h2>
        <div class="mwg-demo-box" data-effect="velocity-tilt">
          <div class="mwg-tilt-card"><p>Velocity Responsive Component</p></div>
        </div>
      </section>
    `,
    css: `
      .mwg-effects-section { padding: 48px; background: #0f172a; color: #f8fafc; }
      .mwg-demo-box { height: 360px; display: flex; align-items: center; justify-content: center; background: #1e293b; border-radius: 16px; }
      .mwg-tilt-card { padding: 32px 48px; background: #3b82f6; border-radius: 12px; font-weight: 700; }
    `,
    expectedResources: [],
    expectedAnimations: [
      { name: 'velocityTilt', library: 'GSAP ScrollTrigger', trigger: 'scroll', durationMs: 400, easing: 'power1.out' },
    ],
    expectedTechs: ['GSAP', 'ScrollTrigger', 'SplitText'],
  },

  obys_experiment: {
    corpusItem: BENCHMARK_CORPUS.obys_experiment,
    rawHtml: `
      <section class="obys-fluid-section">
        <div class="obys-canvas-container" data-canvas="fluid-distortion">
          <canvas id="obys-canvas" width="800" height="600"></canvas>
        </div>
        <h1 class="obys-text">KINETIC TYPE</h1>
      </section>
    `,
    css: `
      .obys-fluid-section { position: relative; height: 100vh; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
      .obys-canvas-container { position: absolute; inset: 0; }
      .obys-text { font-size: 8vw; color: #fff; font-weight: 900; letter-spacing: 0.1em; pointer-events: none; z-index: 2; }
    `,
    expectedResources: [],
    expectedAnimations: [
      { name: 'fluidShaderVelocity', library: 'WebGL / GLSL', trigger: 'pointermove', durationMs: 16, easing: 'linear' },
    ],
    expectedTechs: ['WebGL', 'GLSL Shaders', 'Three.js', 'Canvas 2D'],
  },

  artem_portfolio: {
    corpusItem: BENCHMARK_CORPUS.artem_portfolio,
    rawHtml: `
      <section class="artem-board">
        <div class="artem-card artem-draggable" data-drag="true"><p>Project Arcade</p></div>
        <div class="artem-card artem-draggable" data-drag="true"><p>3D Toybox</p></div>
      </section>
    `,
    css: `
      .artem-board { width: 100vw; height: 100vh; background: #fdf6e2; position: relative; overflow: hidden; }
      .artem-card { position: absolute; width: 220px; height: 140px; background: #fff; border: 3px solid #000; box-shadow: 6px 6px 0px #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: grab; }
    `,
    expectedResources: [],
    expectedAnimations: [
      { name: 'dragPhysicsSnap', library: 'GSAP Draggable', trigger: 'drag', durationMs: 500, easing: 'elastic.out(1, 0.5)' },
    ],
    expectedTechs: ['GSAP Draggable', 'Matter.js', 'CSS Transforms'],
  },

  normal_is_boring: {
    corpusItem: BENCHMARK_CORPUS.normal_is_boring,
    rawHtml: `
      <section class="nib-hero">
        <div class="nib-col nib-left"><span class="nib-huge">NORMAL</span></div>
        <div class="nib-col nib-right"><span class="nib-huge">IS BORING</span></div>
      </section>
    `,
    css: `
      .nib-hero { display: flex; min-height: 100vh; background: #000; color: #fff; font-family: Impact, sans-serif; }
      .nib-col { flex: 1; display: flex; align-items: center; justify-content: center; border-right: 1px solid #333; }
      .nib-huge { font-size: clamp(3rem, 10vw, 9rem); text-transform: uppercase; }
    `,
    expectedResources: [],
    expectedAnimations: [
      { name: 'scrollJackReveal', library: 'GSAP ScrollTrigger', trigger: 'scroll', durationMs: 1000, easing: 'power3.inOut' },
    ],
    expectedTechs: ['GSAP ScrollTrigger', 'LocomotiveScroll', 'Custom Web Fonts'],
  },
};
