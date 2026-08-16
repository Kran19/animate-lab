export interface MockSectionDef {
  sectionId: string;
  title: string;
  category: string;
  domSelector: string;
  domNodeSelectors: string[];
  html: string;
  css: string;
  assets: Array<{ id: string; originalUrl: string; localPath: string; mimeType: string; sizeBytes: number }>;
  animations: Array<{ id: string; name: string; type: string; affectedElements: string; durationMs: number; easing?: string }>;
  technologies: string[];
  isAdvancedShader?: boolean;
}

export const CANONICAL_10_SECTION_WEBSITE: {
  websiteId: string;
  url: string;
  pagePath: string;
  sections: MockSectionDef[];
} = {
  websiteId: 'web-trionn-canonical',
  url: 'https://trionn.com',
  pagePath: '/',
  sections: [
    {
      sectionId: 'sec-01',
      title: 'HeroSection',
      category: 'Hero',
      domSelector: '.trionn-hero',
      domNodeSelectors: ['.trionn-hero', '.trionn-headline', '.trionn-btn-magnetic'],
      html: '<section class="trionn-hero"><h1 class="trionn-headline">We Craft Digital Futures</h1><button class="trionn-btn-magnetic">Explore Work</button></section>',
      css: '.trionn-hero { min-height: 100vh; background: #0a0a0c; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; } .trionn-headline { font-size: 4rem; font-weight: 800; } .trionn-btn-magnetic { padding: 16px 32px; background: #6366f1; border-radius: 999px; }',
      assets: [{ id: 'hero-bg', originalUrl: 'https://trionn.com/assets/hero-bg.webp', localPath: 'mock/hero-bg.webp', mimeType: 'image/webp', sizeBytes: 85000 }],
      animations: [{ id: 'anim-hero-reveal', name: 'heroTextReveal', type: 'GSAP', affectedElements: '.trionn-headline', durationMs: 1200, easing: 'power3.out' }],
      technologies: ['GSAP', 'TailwindCSS'],
    },
    {
      sectionId: 'sec-02',
      title: 'InfiniteMarqueeSection',
      category: 'Marquee',
      domSelector: '.trionn-marquee',
      domNodeSelectors: ['.trionn-marquee', '.trionn-track', '.trionn-item'],
      html: '<section class="trionn-marquee"><div class="trionn-track"><span class="trionn-item">AWARD-WINNING AGENCY — DESIGN & MOTION —</span></div></section>',
      css: '.trionn-marquee { overflow: hidden; background: #000; padding: 24px 0; } .trionn-track { display: flex; animation: marquee-scroll 15s linear infinite; } @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }',
      assets: [],
      animations: [{ id: 'anim-marquee', name: 'marqueeLoop', type: 'CSS_KEYFRAMES', affectedElements: '.trionn-track', durationMs: 15000, easing: 'linear' }],
      technologies: ['CSS_KEYFRAMES'],
    },
    {
      sectionId: 'sec-03',
      title: 'AboutAgencySection',
      category: 'About',
      domSelector: '.trionn-about',
      domNodeSelectors: ['.trionn-about', '.trionn-about-title', '.trionn-about-text'],
      html: '<section class="trionn-about"><h2 class="trionn-about-title">About Our Studio</h2><p class="trionn-about-text">We blend bleeding-edge creative coding with timeless typography.</p></section>',
      css: '.trionn-about { padding: 100px 40px; max-width: 1200px; margin: 0 auto; color: #eee; } .trionn-about-title { font-size: 2.5rem; margin-bottom: 24px; }',
      assets: [],
      animations: [{ id: 'anim-about-fade', name: 'aboutFadeIn', type: 'GSAP', affectedElements: '.trionn-about-text', durationMs: 900 }],
      technologies: ['GSAP'],
    },
    {
      sectionId: 'sec-04',
      title: 'FeaturedProjectsGrid',
      category: 'Card-Grid',
      domSelector: '.trionn-projects',
      domNodeSelectors: ['.trionn-projects', '.trionn-grid', '.trionn-card'],
      html: '<section class="trionn-projects"><div class="trionn-grid"><article class="trionn-card"><h3>Project Alpha</h3></article><article class="trionn-card"><h3>Project Beta</h3></article></div></section>',
      css: '.trionn-projects { padding: 80px 24px; } .trionn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; } .trionn-card { background: #16161a; padding: 32px; border-radius: 16px; }',
      assets: [{ id: 'proj-1', originalUrl: 'https://trionn.com/assets/p1.webp', localPath: 'mock/p1.webp', mimeType: 'image/webp', sizeBytes: 120000 }],
      animations: [{ id: 'anim-grid-stagger', name: 'staggerCards', type: 'ScrollTrigger', affectedElements: '.trionn-card', durationMs: 800 }],
      technologies: ['ScrollTrigger', 'GSAP'],
    },
    {
      sectionId: 'sec-05',
      title: 'Interactive3DExperience',
      category: '3D-Section',
      domSelector: '.trionn-3d-showcase',
      domNodeSelectors: ['.trionn-3d-showcase', '.trionn-canvas'],
      html: '<section class="trionn-3d-showcase"><canvas id="webgl-sphere" class="trionn-canvas"></canvas><div class="trionn-canvas-overlay"><h2>Interactive Spatial Model</h2></div></section>',
      css: '.trionn-3d-showcase { position: relative; height: 600px; background: #050507; } .trionn-canvas { width: 100%; height: 100%; }',
      assets: [{ id: 'shader-tex', originalUrl: 'https://trionn.com/assets/noise.png', localPath: 'mock/noise.png', mimeType: 'image/png', sizeBytes: 42000 }],
      animations: [{ id: 'anim-3d-rotate', name: 'sphereRenderLoop', type: 'Three.js / WebGL', affectedElements: '#webgl-sphere', durationMs: 16 }],
      technologies: ['Three.js', 'WebGL2'],
      isAdvancedShader: true,
    },
    {
      sectionId: 'sec-06',
      title: 'VideoShowreelSection',
      category: 'VideoShowcase',
      domSelector: '.trionn-video-section',
      domNodeSelectors: ['.trionn-video-section', '.trionn-video-wrapper', '.trionn-video'],
      html: '<section class="trionn-video-section"><div class="trionn-video-wrapper"><video class="trionn-video" poster="https://trionn.com/assets/poster.webp" autoplay loop muted playsinline><source src="https://trionn.com/assets/showreel.mp4" type="video/mp4" /></video></div></section>',
      css: '.trionn-video-section { position: relative; width: 100%; height: 80vh; overflow: hidden; } .trionn-video { width: 100%; height: 100%; object-fit: cover; }',
      assets: [
        { id: 'video-poster', originalUrl: 'https://trionn.com/assets/poster.webp', localPath: 'mock/poster.webp', mimeType: 'image/webp', sizeBytes: 65000 },
        { id: 'video-mp4', originalUrl: 'https://trionn.com/assets/showreel.mp4', localPath: 'mock/showreel.mp4', mimeType: 'video/mp4', sizeBytes: 2500000 },
      ],
      animations: [],
      technologies: ['HTML5_Video'],
    },
    {
      sectionId: 'sec-07',
      title: 'InteractiveGallerySection',
      category: 'Image-Gallery',
      domSelector: '.trionn-gallery',
      domNodeSelectors: ['.trionn-gallery', '.trionn-gallery-strip', '.trionn-slide'],
      html: '<section class="trionn-gallery"><div class="trionn-gallery-strip"><div class="trionn-slide">Slide 1</div><div class="trionn-slide">Slide 2</div></div></section>',
      css: '.trionn-gallery { overflow: hidden; padding: 60px 0; } .trionn-gallery-strip { display: flex; gap: 24px; }',
      assets: [],
      animations: [{ id: 'anim-gallery-pan', name: 'galleryPan', type: 'ScrollTrigger', affectedElements: '.trionn-gallery-strip', durationMs: 1000 }],
      technologies: ['ScrollTrigger'],
    },
    {
      sectionId: 'sec-08',
      title: 'TestimonialsSection',
      category: 'Testimonials',
      domSelector: '.trionn-testimonials',
      domNodeSelectors: ['.trionn-testimonials', '.trionn-quote', '.trionn-author'],
      html: '<section class="trionn-testimonials"><blockquote class="trionn-quote">"AnimateLab transformed our frontend extraction."</blockquote><cite class="trionn-author">— Creative Director</cite></section>',
      css: '.trionn-testimonials { padding: 80px 40px; text-align: center; background: #111116; color: #fff; } .trionn-quote { font-size: 2rem; font-style: italic; }',
      assets: [],
      animations: [{ id: 'anim-quote-fade', name: 'quoteFade', type: 'GSAP', affectedElements: '.trionn-quote', durationMs: 700 }],
      technologies: ['GSAP'],
    },
    {
      sectionId: 'sec-09',
      title: 'CallToActionSection',
      category: 'CTA',
      domSelector: '.trionn-cta',
      domNodeSelectors: ['.trionn-cta', '.trionn-cta-heading', '.trionn-cta-button'],
      html: '<section class="trionn-cta"><h2 class="trionn-cta-heading">Ready to build something unforgettable?</h2><button class="trionn-cta-button">Start a Project</button></section>',
      css: '.trionn-cta { padding: 120px 24px; text-align: center; background: #6366f1; color: #fff; } .trionn-cta-button { padding: 18px 40px; background: #000; color: #fff; border-radius: 999px; font-weight: bold; }',
      assets: [],
      animations: [{ id: 'anim-cta-pulse', name: 'buttonPulse', type: 'CSS_TRANSITION', affectedElements: '.trionn-cta-button', durationMs: 300 }],
      technologies: ['CSS_TRANSITION'],
    },
    {
      sectionId: 'sec-10',
      title: 'FooterSection',
      category: 'Footer',
      domSelector: '.trionn-footer',
      domNodeSelectors: ['.trionn-footer', '.trionn-footer-links', '.trionn-copy'],
      html: '<footer class="trionn-footer"><div class="trionn-footer-links"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div><p class="trionn-copy">© 2026 Studio. All rights reserved.</p></footer>',
      css: '.trionn-footer { padding: 60px 40px; background: #050507; color: #888; display: flex; justify-content: space-between; border-top: 1px solid #222; } .trionn-footer-links { display: flex; gap: 24px; }',
      assets: [{ id: 'footer-logo', originalUrl: 'https://trionn.com/assets/logo.svg', localPath: 'mock/logo.svg', mimeType: 'image/svg+xml', sizeBytes: 3200 }],
      animations: [],
      technologies: ['Vanilla_CSS'],
    },
  ],
};
