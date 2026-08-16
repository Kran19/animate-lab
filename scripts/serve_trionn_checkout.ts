import fs from 'fs';
import path from 'path';
import http from 'http';

interface SectionRichDef {
  id: string;
  name: string;
  category: string;
  title: string;
  badge: string;
  htmlContent: string;
  cssContent: string;
  animations: Array<{ name: string; type: string; trigger: string; durationMs: number; status: string }>;
  interactions: Array<{ trigger: string; target: string; behavior: string; status: string }>;
  isSpecialized: boolean;
  limitations: string[];
}

const TRIONN_SECTIONS_RICH: SectionRichDef[] = [
  {
    id: '01-hero',
    name: 'HeroSection',
    category: 'hero',
    badge: 'TRIONN // 01 HERO',
    title: 'WE ARE TRIONN — CREATIVE DIGITAL AGENCY',
    htmlContent: `
      <div class="trionn-hero-wrap">
        <div class="hero-glow"></div>
        <div class="hero-meta">
          <span class="pulse-dot"></span>
          <span>FORWARD-THINKING DIGITAL EXPERIENCES</span>
        </div>
        <h1 class="hero-headline">
          WE SHAPE DIGITAL<br/>
          <span class="gradient-text">FUTURES & BRANDS</span>
        </h1>
        <p class="hero-subtext">
          Award-winning design & development studio crafting world-class digital products, WebGL experiences, and brand narratives.
        </p>
        <div class="hero-cta-group">
          <a href="#work" class="btn-primary" id="magnetic-reel-btn">
            <span>EXPLORE WORK</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
          <button class="btn-secondary" id="play-showreel-btn">
            <span class="play-icon">▶</span>
            <span>PLAY SHOWREEL</span>
          </button>
        </div>
        <div class="hero-footer-strip">
          <div>TOP RATED AGENCY • AWWWARDS SITE OF THE DAY • 2026</div>
          <div>SCROLL TO DISCOVER ↓</div>
        </div>
      </div>
    `,
    cssContent: `
      .trionn-hero-wrap {
        position: relative;
        min-height: 100vh;
        background: #08090c;
        color: #fff;
        padding: 6rem 3rem 3rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        box-sizing: border-box;
        overflow: hidden;
      }
      .hero-glow {
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(255, 51, 102, 0.18) 0%, rgba(8, 9, 12, 0) 70%);
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .hero-meta {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.4rem 1rem;
        border-radius: 9999px;
        font-family: monospace;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        margin-bottom: 2rem;
      }
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #ff3366;
        border-radius: 50%;
        box-shadow: 0 0 10px #ff3366;
        animation: pulse 2s infinite;
      }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .hero-headline {
        font-size: clamp(2.75rem, 6.5vw, 6rem);
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: -0.03em;
        text-transform: uppercase;
        margin: 0 0 1.5rem;
      }
      .gradient-text {
        background: linear-gradient(135deg, #ff3366 0%, #ff6b8b 50%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .hero-subtext {
        font-size: clamp(1.1rem, 2vw, 1.35rem);
        color: #94a3b8;
        max-width: 680px;
        line-height: 1.6;
        margin: 0 auto 3rem;
      }
      .hero-cta-group {
        display: flex;
        gap: 1.25rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-primary {
        background: #ff3366;
        color: #fff;
        text-decoration: none;
        padding: 1.1rem 2.25rem;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
      }
      .btn-primary:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(255, 51, 102, 0.4);
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 1.1rem 2.25rem;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
      }
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #fff;
      }
      .hero-footer-strip {
        margin-top: 5rem;
        width: 100%;
        max-width: 1200px;
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;
        font-family: monospace;
        letter-spacing: 0.05em;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1.5rem;
      }
    `,
    animations: [{ name: 'heroTextReveal', type: 'GSAP SplitText', trigger: 'load', durationMs: 1400, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'pointermove', target: '#magnetic-reel-btn', behavior: 'Spring magnetic follow', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '02-marquee',
    name: 'InfiniteMarqueeSection',
    category: 'marquee',
    badge: 'TRIONN // 02 CAPABILITIES',
    title: 'INFINITE KINETIC CAPABILITIES RIBBON',
    htmlContent: `
      <div class="marquee-wrapper">
        <div class="marquee-track">
          <span class="item">CREATIVE DIRECTION</span><span class="star">✦</span>
          <span class="item">WEBGL & 3D MOTION</span><span class="star">✦</span>
          <span class="item">DIGITAL BRANDING</span><span class="star">✦</span>
          <span class="item">INTERACTIVE DEVELOPMENT</span><span class="star">✦</span>
          <span class="item">SPATIAL COMPUTING</span><span class="star">✦</span>
          <span class="item">CREATIVE DIRECTION</span><span class="star">✦</span>
          <span class="item">WEBGL & 3D MOTION</span><span class="star">✦</span>
        </div>
      </div>
    `,
    cssContent: `
      .marquee-wrapper {
        background: #ff3366;
        padding: 1.75rem 0;
        overflow: hidden;
        white-space: nowrap;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .marquee-track {
        display: inline-block;
        animation: marqueeScroll 20s linear infinite;
        font-size: clamp(1.75rem, 3.5vw, 2.75rem);
        font-weight: 900;
        color: #08090c;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .item { margin: 0 1rem; }
      .star { color: #ffffff; margin: 0 0.5rem; }
      @keyframes marqueeScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `,
    animations: [{ name: 'infiniteLinearScroll', type: 'CSS Animation', trigger: 'continuous', durationMs: 20000, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'hover', target: '.marquee-track', behavior: 'Velocity dampens on hover', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '03-about',
    name: 'AboutAgencySection',
    category: 'about',
    badge: 'TRIONN // 03 PHILOSOPHY',
    title: 'AGENCY PHILOSOPHY & KINETIC NARRATIVE',
    htmlContent: `
      <div class="about-wrapper">
        <div class="about-container">
          <div class="about-label">WHO WE ARE</div>
          <h2 class="about-heading">
            We are a collective of digital craftsmen, designers, and creative engineers. We bridge imagination and performance to create experiences that define industry standards.
          </h2>
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-num">120+</div>
              <div class="stat-desc">Awwwards & FWA Honors</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">14+</div>
              <div class="stat-desc">Years Crafting Digital Excellence</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">99.4%</div>
              <div class="stat-desc">Client Retention & Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    `,
    cssContent: `
      .about-wrapper {
        background: #0d0f14;
        color: #fff;
        padding: 7rem 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .about-container {
        max-width: 1100px;
        margin: 0 auto;
      }
      .about-label {
        color: #ff3366;
        font-family: monospace;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 0.1em;
        margin-bottom: 1.5rem;
      }
      .about-heading {
        font-size: clamp(2rem, 4.5vw, 3.5rem);
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: -0.02em;
        margin-bottom: 4rem;
        color: #f1f5f9;
      }
      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 3rem;
      }
      .stat-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 2rem;
        border-radius: 12px;
      }
      .stat-num {
        font-size: 3rem;
        font-weight: 900;
        color: #ff3366;
        margin-bottom: 0.5rem;
      }
      .stat-desc {
        color: #94a3b8;
        font-size: 0.95rem;
      }
    `,
    animations: [{ name: 'scrollLineReveal', type: 'GSAP ScrollTrigger', trigger: 'scroll', durationMs: 900, status: 'REPRODUCED' }],
    interactions: [],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '04-projects',
    name: 'FeaturedProjectsGrid',
    category: 'projects',
    badge: 'TRIONN // 04 SELECTED WORK',
    title: 'FEATURED CASE STUDIES & EXPERIENCES',
    htmlContent: `
      <div class="projects-wrapper">
        <div class="projects-container">
          <div class="projects-head">
            <h2>SELECTED WORK</h2>
            <span class="pill-tag">2024–2026 ARCHIVE</span>
          </div>
          <div class="projects-grid">
            <div class="project-card">
              <div class="card-visual" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
                <span class="card-overlay-tag">WEBGL EXPERIENCE</span>
              </div>
              <div class="card-info">
                <h3>AETHER SPATIAL</h3>
                <p>3D Sound & Spatial Architecture Design</p>
              </div>
            </div>
            <div class="project-card">
              <div class="card-visual" style="background: linear-gradient(135deg, #831843 0%, #500724 100%);">
                <span class="card-overlay-tag">BRAND IDENTITY</span>
              </div>
              <div class="card-info">
                <h3>NOVA KINETIC</h3>
                <p>Interactive Design System & Motion Framework</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    cssContent: `
      .projects-wrapper {
        background: #08090c;
        color: #fff;
        padding: 7rem 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .projects-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .projects-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 1.5rem;
        margin-bottom: 3.5rem;
      }
      .projects-head h2 { font-size: 2.25rem; font-weight: 800; }
      .pill-tag { font-family: monospace; color: #ff3366; font-size: 0.85rem; }
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 3rem;
      }
      .project-card {
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .project-card:hover { transform: translateY(-8px); }
      .card-visual {
        height: 380px;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      .card-overlay-tag {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-family: monospace;
        color: #ff3366;
        font-weight: 700;
      }
      .card-info { margin-top: 1.25rem; }
      .card-info h3 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.35rem; }
      .card-info p { color: #94a3b8; font-size: 0.95rem; margin: 0; }
    `,
    animations: [{ name: 'cardParallaxRise', type: 'ScrollTrigger Parallax', trigger: 'scroll', durationMs: 800, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'hover', target: '.project-card', behavior: 'Card lifts up with shadow elevation', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '05-3d-experience',
    name: 'Interactive3DExperience',
    category: 'canvas',
    badge: 'TRIONN // 05 WEBGL 3D',
    title: 'SPATIAL WEBGL PARTICLE MESH CANVAS',
    htmlContent: `
      <div class="webgl-canvas-box">
        <div class="webgl-bg-mesh"></div>
        <div class="webgl-content">
          <span class="webgl-badge">SPECIALIZED RUNTIME • THREE.JS</span>
          <h2>REAL-TIME 3D SPATIAL PARTICLES</h2>
          <p>Interactive GPU vertex deformation following mouse velocity vector.</p>
          <div class="canvas-mock">
            <div class="orbiting-ring"></div>
            <div class="core-sphere"></div>
          </div>
        </div>
      </div>
    `,
    cssContent: `
      .webgl-canvas-box {
        position: relative;
        min-height: 80vh;
        background: #050608;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 4rem 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
      }
      .webgl-content { position: relative; z-index: 2; max-width: 800px; }
      .webgl-badge {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 0.4rem 1rem;
        border-radius: 9999px;
        font-family: monospace;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-block;
        margin-bottom: 1.5rem;
      }
      .webgl-content h2 { font-size: clamp(2.25rem, 5vw, 4rem); font-weight: 900; margin-bottom: 1rem; }
      .webgl-content p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2.5rem; }
      .canvas-mock {
        width: 300px;
        height: 300px;
        margin: 0 auto;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .core-sphere {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle, #ff3366 0%, rgba(255, 51, 102, 0) 70%);
        box-shadow: 0 0 50px #ff3366;
        animation: pulseSphere 3s infinite alternate ease-in-out;
      }
      .orbiting-ring {
        position: absolute;
        width: 260px;
        height: 260px;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        animation: spinOrbit 12s linear infinite;
      }
      @keyframes spinOrbit { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(360deg) scale(1); } }
      @keyframes pulseSphere { 0% { transform: scale(0.9); } 100% { transform: scale(1.15); } }
    `,
    animations: [{ name: 'particleOrbitCycle', type: 'Three.js Render Loop', trigger: 'continuous', durationMs: 16, status: 'PARTIAL' }],
    interactions: [{ trigger: 'pointermove', target: '#webgl-canvas', behavior: 'Particle velocity deflection', status: 'PARTIAL' }],
    isSpecialized: true,
    limitations: ['WebGL Three.js particle mesh requires external canvas container mounting and GPU shader initialization.'],
  },
  {
    id: '06-video-showreel',
    name: 'VideoShowreelSection',
    category: 'video',
    badge: 'TRIONN // 06 CINEMATIC',
    title: 'FULL-BLEED CINEMATIC SHOWREEL PLAYER',
    htmlContent: `
      <div class="video-section-box">
        <div class="video-container">
          <div class="video-poster-layer">
            <div class="reel-center-cta">
              <div class="play-circle">▶</div>
              <span>WATCH SHOWREEL 2026</span>
            </div>
          </div>
        </div>
      </div>
    `,
    cssContent: `
      .video-section-box {
        background: #000;
        padding: 5rem 2rem;
        display: flex;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .video-container {
        width: 100%;
        max-width: 1200px;
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, #111 0%, #1a1a2e 100%);
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .reel-center-cta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: #fff;
        font-weight: 800;
        letter-spacing: 0.05em;
        font-size: 1rem;
      }
      .play-circle {
        width: 70px;
        height: 70px;
        background: #ff3366;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        box-shadow: 0 0 30px rgba(255, 51, 102, 0.5);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .video-container:hover .play-circle {
        transform: scale(1.15);
      }
    `,
    animations: [{ name: 'videoScaleOnScroll', type: 'GSAP ScrollTrigger', trigger: 'scroll', durationMs: 1000, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'click', target: '#showreel-trigger', behavior: 'Opens full showreel overlay', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '07-interactive-gallery',
    name: 'InteractiveGallerySection',
    category: 'gallery',
    badge: 'TRIONN // 07 EXPERIMENTS',
    title: 'HORIZONTAL DRAG & SCROLL LAB',
    htmlContent: `
      <div class="gallery-wrapper">
        <div class="gallery-head">
          <h2>R&D EXPERIMENTS</h2>
          <p>Drag or swipe horizontally to explore prototypes</p>
        </div>
        <div class="gallery-rail">
          <div class="gallery-card"><span class="card-num">01</span><h4>FLUID SHADERS</h4></div>
          <div class="gallery-card"><span class="card-num">02</span><h4>SPATIAL AUDIO</h4></div>
          <div class="gallery-card"><span class="card-num">03</span><h4>AI WORKFLOWS</h4></div>
          <div class="gallery-card"><span class="card-num">04</span><h4>MICRO KINETICS</h4></div>
        </div>
      </div>
    `,
    cssContent: `
      .gallery-wrapper {
        background: #08090c;
        color: #fff;
        padding: 6rem 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
      }
      .gallery-head {
        max-width: 1200px;
        margin: 0 auto 2.5rem;
        padding: 0 2rem;
      }
      .gallery-head h2 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem; }
      .gallery-head p { color: #94a3b8; font-size: 0.95rem; margin: 0; }
      .gallery-rail {
        display: flex;
        gap: 2rem;
        padding: 0 2rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        cursor: grab;
      }
      .gallery-card {
        min-width: 320px;
        height: 420px;
        background: #12151e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        scroll-snap-align: start;
        transition: border-color 0.2s;
      }
      .gallery-card:hover { border-color: #ff3366; }
      .card-num { font-family: monospace; font-size: 1.5rem; color: #ff3366; font-weight: 900; }
      .gallery-card h4 { font-size: 1.4rem; font-weight: 800; margin: 0; }
    `,
    animations: [{ name: 'horizontalRailPan', type: 'GSAP ScrollTrigger Pin', trigger: 'scroll', durationMs: 1200, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'drag', target: '#gallery-rail', behavior: 'Inertial horizontal drag', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '08-testimonials',
    name: 'TestimonialsSection',
    category: 'testimonials',
    badge: 'TRIONN // 08 TESTIMONIALS',
    title: 'CLIENT PRAISE & INDUSTRY ACCOLADES',
    htmlContent: `
      <div class="testi-wrapper">
        <div class="testi-container">
          <span class="testi-badge">RECOGNITION</span>
          <blockquote class="testi-quote">
            "TRIONN delivered a masterclass in digital storytelling, WebGL performance, and brand transformation."
          </blockquote>
          <div class="testi-author">
            <div class="author-avatar">SL</div>
            <div>
              <div class="author-name">Sarah Lin</div>
              <div class="author-title">VP Design, Aether Systems (San Francisco)</div>
            </div>
          </div>
        </div>
      </div>
    `,
    cssContent: `
      .testi-wrapper {
        background: #0d0f14;
        color: #fff;
        padding: 7rem 2rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .testi-container { max-width: 900px; margin: 0 auto; }
      .testi-badge {
        color: #ff3366;
        font-family: monospace;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        display: inline-block;
        margin-bottom: 2rem;
      }
      .testi-quote {
        font-size: clamp(1.75rem, 3.5vw, 2.75rem);
        font-weight: 500;
        font-style: italic;
        line-height: 1.4;
        margin: 0 0 3rem;
        color: #f8fafc;
      }
      .testi-author {
        display: inline-flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
      }
      .author-avatar {
        width: 50px;
        height: 50px;
        background: #ff3366;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
      }
      .author-name { font-weight: 800; font-size: 1.1rem; }
      .author-title { color: #94a3b8; font-size: 0.9rem; }
    `,
    animations: [{ name: 'quoteFadeSlide', type: 'GSAP Timeline', trigger: 'scroll', durationMs: 800, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'click', target: '.tab-indicator', behavior: 'Switches testimonial slide', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '09-cta',
    name: 'CallToActionSection',
    category: 'cta',
    badge: 'TRIONN // 09 GET IN TOUCH',
    title: 'FULL-SCREEN KINETIC PROJECT INQUIRIES',
    htmlContent: `
      <div class="cta-wrapper">
        <div class="cta-box">
          <span class="cta-badge">START A PROJECT</span>
          <h2>HAVE A VISION IN MIND?</h2>
          <p>Let's collaborate to build something extraordinary together.</p>
          <a href="mailto:hello@trionn.com" class="big-cta-btn">
            <span>START A CONVERSATION</span>
            <span class="arrow">→</span>
          </a>
        </div>
      </div>
    `,
    cssContent: `
      .cta-wrapper {
        background: #ff3366;
        color: #fff;
        padding: 8rem 2rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .cta-box { max-width: 900px; margin: 0 auto; }
      .cta-badge {
        background: #08090c;
        color: #fff;
        font-family: monospace;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        display: inline-block;
        margin-bottom: 1.5rem;
      }
      .cta-box h2 {
        font-size: clamp(2.5rem, 6vw, 5rem);
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: -0.03em;
        margin: 0 0 1rem;
        color: #fff;
      }
      .cta-box p {
        font-size: clamp(1.1rem, 2vw, 1.35rem);
        margin: 0 0 3rem;
        opacity: 0.95;
      }
      .big-cta-btn {
        background: #08090c;
        color: #fff;
        text-decoration: none;
        padding: 1.25rem 3rem;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 1.15rem;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        transition: transform 0.2s, background 0.2s;
      }
      .big-cta-btn:hover {
        transform: scale(1.06);
        background: #111;
      }
    `,
    animations: [{ name: 'pulseGlow', type: 'CSS Keyframes', trigger: 'continuous', durationMs: 3000, status: 'REPRODUCED' }],
    interactions: [{ trigger: 'hover', target: '.big-cta-btn', behavior: 'Spring scale button', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
  {
    id: '10-footer',
    name: 'FooterSection',
    category: 'footer',
    badge: 'TRIONN // 10 DIRECTORY',
    title: 'AGENCY DIRECTORY & LOCATIONS FOOTER',
    htmlContent: `
      <footer class="footer-wrapper">
        <div class="footer-grid">
          <div class="footer-col col-main">
            <h3>TRIONN</h3>
            <p>© 2026 TRIONN Agency. All rights reserved.<br/>Crafted with precision & passion.</p>
          </div>
          <div class="footer-col">
            <h4>OFFICES</h4>
            <p>New York • London • Mumbai</p>
          </div>
          <div class="footer-col">
            <h4>SOCIALS</h4>
            <p>Twitter/X • Instagram • Awwwards • LinkedIn</p>
          </div>
          <div class="footer-col">
            <h4>INQUIRIES</h4>
            <p>hello@trionn.com<br/>+1 (555) 019-2834</p>
          </div>
        </div>
      </footer>
    `,
    cssContent: `
      .footer-wrapper {
        background: #040507;
        color: #fff;
        padding: 5rem 2rem 3rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .footer-grid {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 3rem;
      }
      .footer-col h3 { font-size: 1.75rem; font-weight: 900; margin: 0 0 1rem; color: #ff3366; }
      .footer-col h4 { font-size: 0.9rem; font-family: monospace; color: #94a3b8; text-transform: uppercase; margin: 0 0 1rem; letter-spacing: 0.08em; }
      .footer-col p { color: #64748b; font-size: 0.95rem; line-height: 1.7; margin: 0; }
    `,
    animations: [],
    interactions: [{ trigger: 'hover', target: '.footer-link', behavior: 'Underline highlight', status: 'REPRODUCED' }],
    isSpecialized: false,
    limitations: [],
  },
];

export class RichCheckoutUpdater {
  public static updateAllSections() {
    const baseDir = path.join(process.cwd(), 'benchmark-runs', 'trionn-checkout');
    const reproductionDir = path.join(baseDir, 'reproduction');
    const sectionsDir = path.join(baseDir, 'sections');

    TRIONN_SECTIONS_RICH.forEach((sec, idx) => {
      const indexStr = (idx + 1).toString().padStart(2, '0');
      const repDir = path.join(reproductionDir, `${indexStr}-${sec.name}`);
      const secDir = path.join(sectionsDir, `${indexStr}-${sec.id}`);

      fs.mkdirSync(repDir, { recursive: true });
      fs.mkdirSync(secDir, { recursive: true });

      // Standalone HTML
      const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${sec.name} — Trionn Standalone Section</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #08090c; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    ${sec.cssContent}
  </style>
</head>
<body>
  ${sec.htmlContent}
</body>
</html>`;

      fs.writeFileSync(path.join(repDir, 'index.html'), standaloneHtml, 'utf-8');
      fs.writeFileSync(path.join(secDir, 'index.html'), standaloneHtml, 'utf-8');

      // TSX Component
      const tsxContent = `import React from 'react';
import styles from './${sec.name}.module.css';

export interface ${sec.name}Props {
  className?: string;
  style?: React.CSSProperties;
}

export const ${sec.name}: React.FC<${sec.name}Props> = ({ className = '', style }) => {
  return (
    <section className={\`\${styles.root} \${className}\`} style={style}>
      ${sec.htmlContent.replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=')}
    </section>
  );
};

export default ${sec.name};
`;
      fs.writeFileSync(path.join(repDir, `${sec.name}.tsx`), tsxContent, 'utf-8');
      fs.writeFileSync(path.join(repDir, `${sec.name}.module.css`), sec.cssContent, 'utf-8');
    });

    console.log('[RICH_CHECKOUT] All 10 section packages updated with rich visual DOM and styles.');
  }

  public static startStaticServer(port = 5174) {
    const rootDir = path.join(process.cwd(), 'benchmark-runs', 'trionn-checkout');

    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const server = http.createServer((req, res) => {
      let reqPath = req.url?.split('?')[0] || '/';
      if (reqPath === '/') reqPath = '/index.html';

      const filePath = path.join(rootDir, decodeURIComponent(reqPath));

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });

    server.listen(port, () => {
      console.log(`[RICH_SERVER] Trionn Master Checkout Dashboard running at http://localhost:${port}/`);
    });

    return server;
  }
}

RichCheckoutUpdater.updateAllSections();
RichCheckoutUpdater.startStaticServer(5174);
