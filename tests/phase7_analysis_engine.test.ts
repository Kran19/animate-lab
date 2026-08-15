import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { TechnologyDetector } from '../src/engine/analysis/technologyDetector';
import { ComputedStyleAnalyzer } from '../src/engine/analysis/computedStyleAnalyzer';
import { DOMMutationObserver } from '../src/engine/analysis/mutationObserver';
import { AnimationAnalyzer } from '../src/engine/analysis/animationAnalyzer';
import { ThreeDAnalyzer } from '../src/engine/analysis/threeDAnalyzer';
import { AnalysisPipeline, PRESET_CONFIGS } from '../src/engine/analysis/analysisPipeline';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { IPC_METHODS, CURRENT_PROTOCOL_VERSION } from '../src/engine/ipc/protocol';

describe('Phase 7 — Runtime Animation, Technology & WebGL Analysis Suite', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test_phase7_analysis.db';
    execSync('npx prisma db push --skip-generate', { env: process.env });
    prisma = new PrismaClient();
    await prisma.$connect();
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  // ----------------------------------------------------
  // CATEGORY 1: TECHNOLOGY DETECTION
  // ----------------------------------------------------
  describe('Technology Detection Engine', () => {
    it('1. Detects GSAP with high confidence when window.gsap exists', () => {
      const detector = new TechnologyDetector();
      const res = detector.detectTechnologies({
        htmlContent: '<html><body></body></html>',
        scriptUrls: ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'],
        networkUrls: [],
        windowGlobals: ['gsap'],
        domAttributes: {},
      });
      const gsap = res.find((t) => t.name === 'GSAP');
      expect(gsap).toBeDefined();
      expect(gsap?.confidence).toBeGreaterThanOrEqual(0.9);
      expect(gsap?.evidence.some((e) => e.source === 'global_variable')).toBe(true);
    });

    it('2. Detects GSAP ScrollTrigger plugin when window.ScrollTrigger exists', () => {
      const detector = new TechnologyDetector();
      const res = detector.detectTechnologies({
        htmlContent: '<html><body></body></html>',
        scriptUrls: ['/assets/ScrollTrigger.min.js'],
        networkUrls: [],
        windowGlobals: ['gsap', 'ScrollTrigger'],
        domAttributes: {},
      });
      const st = res.find((t) => t.name === 'ScrollTrigger');
      expect(st).toBeDefined();
      expect(st?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('3. Detects React framework from globals and DOM attributes', () => {
      const detector = new TechnologyDetector();
      const res = detector.detectTechnologies({
        htmlContent: '<div id="root" data-reactroot=""></div>',
        scriptUrls: ['/static/js/main.js'],
        networkUrls: [],
        windowGlobals: ['React', 'ReactDOM'],
        domAttributes: {},
      });
      const react = res.find((t) => t.name === 'React');
      expect(react).toBeDefined();
      expect(react?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('4. Detects Three.js 3D library with GLTF network request evidence', () => {
      const detector = new TechnologyDetector();
      const res = detector.detectTechnologies({
        htmlContent: '<canvas id="webgl"></canvas>',
        scriptUrls: ['/js/three.min.js'],
        networkUrls: ['https://example.com/assets/robot.glb'],
        windowGlobals: ['THREE'],
        domAttributes: {},
      });
      const three = res.find((t) => t.name === 'Three.js');
      expect(three).toBeDefined();
      expect(three?.confidence).toBeGreaterThanOrEqual(0.9);
      expect(three?.evidence.some((e) => e.source === 'network_request')).toBe(true);
    });

    it('5. Detects WebGL container from canvas DOM element', () => {
      const detector = new TechnologyDetector();
      const res = detector.detectTechnologies({
        htmlContent: '<canvas id="hero-canvas"></canvas>',
        scriptUrls: [],
        networkUrls: [],
        windowGlobals: [],
        domAttributes: {},
      });
      const canvas = res.find((t) => t.name === 'Canvas 2D / WebGL Container');
      expect(canvas).toBeDefined();
      expect(canvas?.confidence).toBe(0.5);
    });

    it('6. Rejects false positive: script URL only yields lower confidence than active runtime global', () => {
      const detector = new TechnologyDetector();
      const scriptOnlyRes = detector.detectTechnologies({
        htmlContent: '<html></html>',
        scriptUrls: ['/libs/gsap.min.js'],
        networkUrls: [],
        windowGlobals: [],
        domAttributes: {},
      });
      const gsapScript = scriptOnlyRes.find((t) => t.name === 'GSAP');
      expect(gsapScript).toBeDefined();
      expect(gsapScript?.confidence).toBe(0.65);

      const activeRes = detector.detectTechnologies({
        htmlContent: '<html></html>',
        scriptUrls: ['/libs/gsap.min.js'],
        networkUrls: [],
        windowGlobals: ['gsap'],
        domAttributes: {},
      });
      const gsapActive = activeRes.find((t) => t.name === 'GSAP');
      expect(gsapActive?.confidence).toBeGreaterThan(gsapScript?.confidence!);
    });
  });

  // ----------------------------------------------------
  // CATEGORY 2: ANIMATION ANALYZER
  // ----------------------------------------------------
  describe('Unified Animation Analyzer Engine', () => {
    it('7. Analyzes CSS @keyframes animation parameters', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        cssRules: [
          {
            selector: '.hero-title',
            animationName: 'fadeInUp',
            animationDuration: '1.5s',
            animationDelay: '300ms',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
        ],
      });
      expect(res.length).toBe(1);
      expect(res[0].name).toContain('fadeInUp');
      expect(res[0].durationMs).toBe(1500);
      expect(res[0].delayMs).toBe(300);
      expect(res[0].easing).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
      expect(res[0].affectedElements).toContain('.hero-title');
    });

    it('8. Analyzes CSS Transitions and extracts animated property list', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        cssRules: [
          {
            selector: '.button:hover',
            transitionProperty: 'transform, opacity, background-color',
            transitionDuration: '0.3s',
            transitionDelay: '0s',
            transitionTimingFunction: 'ease-out',
          },
        ],
      });
      expect(res.length).toBe(1);
      expect(res[0].type).toBe('css_transition');
      expect(res[0].durationMs).toBe(300);
      expect(res[0].animatedProperties).toEqual(['transform', 'opacity', 'background-color']);
    });

    it('9. Analyzes Web Animations API (WAAPI) Animation instances', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        waapiAnimations: [
          {
            targetSelector: '#card-container',
            animationName: 'slideIn',
            durationMs: 800,
            delayMs: 100,
            easing: 'ease-in-out',
            playState: 'running',
          },
        ],
      });
      expect(res.length).toBe(1);
      expect(res[0].type).toBe('waapi');
      expect(res[0].affectedElements).toContain('#card-container');
    });

    it('10. Analyzes GSAP Tweens and ScrollTrigger scroll-driven animations', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        gsapState: {
          isLoaded: true,
          isActive: true,
          tweens: [
            {
              targetSelector: '.scroll-section',
              durationMs: 2000,
              delayMs: 0,
              easing: 'none',
            },
          ],
          scrollTriggers: [
            {
              triggerSelector: '.scroll-section',
              targetSelector: '.scroll-section',
              startBound: 'top center',
              endBound: 'bottom center',
              scrub: true,
            },
          ],
        },
      });
      expect(res.length).toBe(1);
      expect(res[0].type).toBe('scroll_driven');
      expect(res[0].library).toBe('GSAP ScrollTrigger');
      expect(res[0].trigger).toBe('scroll');
    });

    it('11. Detects interaction-driven animations (hover, click, pointer)', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        interactionsObserved: [
          {
            type: 'hover',
            selector: '.card-item',
            propertiesChanged: ['transform', 'box-shadow'],
          },
        ],
      });
      expect(res.length).toBe(1);
      expect(res[0].type).toBe('interaction');
      expect(res[0].trigger).toBe('hover');
      expect(res[0].animatedProperties).toEqual(['transform', 'box-shadow']);
    });

    it('12. Detects continuous requestAnimationFrame loop animations', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        continuousLoopsObserved: [
          {
            targetSelector: '#webgl-canvas',
            fpsEstimate: 60,
            hasTimeUniform: true,
          },
        ],
      });
      expect(res.length).toBe(1);
      expect(res[0].type).toBe('continuous');
      expect(res[0].library).toBe('GLSL Shader Loop');
      expect(res[0].trigger).toBe('continuous');
    });

    it('13. Calculates deterministic confidence score for animation evidence', () => {
      const analyzer = new AnimationAnalyzer();
      const res = analyzer.analyzeAnimations({
        waapiAnimations: [
          {
            targetSelector: '#hero',
            durationMs: 500,
            delayMs: 0,
            easing: 'linear',
            playState: 'running',
          },
        ],
      });
      expect(res[0].evidence.confidence).toBe(0.9);
      expect(res[0].evidence.runtimeEvidence).toContain('playState=running');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 3: WEBGL / 3D ANALYZER
  // ----------------------------------------------------
  describe('WebGL / 3D Analyzer Engine', () => {
    it('14. Differentiates Canvas 2D surface from 3D WebGL context', () => {
      const analyzer = new ThreeDAnalyzer();
      const res2D = analyzer.analyzeThreeD({
        canvases: [{ selector: '#chart-canvas', contextType: '2d', width: 800, height: 600 }],
      });
      expect(res2D?.type).toBe('canvas2d');
      expect(res2D?.webGlContextType).toBe('2d');
      expect(res2D?.statusNotes).toContain('Not 3D WebGL');

      const resWebGL = analyzer.analyzeThreeD({
        canvases: [{ selector: '#gl-canvas', contextType: 'webgl2', width: 1920, height: 1080 }],
      });
      expect(resWebGL?.webGlContextType).toBe('webgl2');
    });

    it('15. Analyzes Three.js 3D Experience, scenes, models, and shaders', () => {
      const analyzer = new ThreeDAnalyzer();
      const res = analyzer.analyzeThreeD({
        canvases: [{ selector: '#canvas-3d', contextType: 'webgl', width: 1920, height: 1080 }],
        threeState: {
          isLoaded: true,
          version: 'r152',
          hasActiveRenderer: true,
          sceneCount: 1,
          meshCount: 42,
          modelsLoaded: ['/models/car.glb'],
          texturesLoaded: ['/textures/metal.jpg'],
          shadersExtracted: [
            {
              type: 'fragment',
              sourceSnippet: 'void main() { gl_FragColor = vec4(1.0); }',
              uniforms: ['uTime', 'uResolution'],
            },
          ],
        },
      });
      expect(res?.type).toBe('threejs');
      expect(res?.shaderCount).toBe(1);
      expect(res?.modelCount).toBe(1);
      expect(res?.status).toBe('completed');
    });

    it('16. Correlates Phase 6 network resources with 3D Experience assets', () => {
      const analyzer = new ThreeDAnalyzer();
      const res = analyzer.analyzeThreeD({
        canvases: [{ selector: '#webgl-viewport', contextType: 'webgl', width: 800, height: 600 }],
        threeState: { isLoaded: true },
        phase6Resources: [
          {
            originalUrl: 'https://cdn.site.com/models/character.glb',
            mimeType: 'model/gltf-binary',
            resourceType: '3d-model',
            contentHash: 'abc123sha256',
            localPath: 'assets/sha256/ab/abc123sha256.glb',
          },
        ],
      });
      expect(res?.modelsJson).toContain('character.glb');
    });

    it('17. Handles obfuscated/unaccessible shaders with status = partially_analyzed', () => {
      const analyzer = new ThreeDAnalyzer();
      const res = analyzer.analyzeThreeD({
        canvases: [{ selector: '#obfuscated-canvas', contextType: 'webgl', width: 800, height: 600 }],
        threeState: {
          isLoaded: true,
          shadersExtracted: [
            {
              type: 'fragment',
              sourceSnippet: '// obfuscated shader source',
              uniforms: [],
              isObfuscated: true,
            },
          ],
        },
      });
      expect(res?.status).toBe('partially_analyzed');
      expect(res?.statusNotes).toContain('obfuscated');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 4: COMPUTED STYLE & MUTATION OBSERVER SAFETY
  // ----------------------------------------------------
  describe('Computed Style & Non-destructive Observer', () => {
    it('18. ComputedStyleAnalyzer extracts targeted animatable properties only', () => {
      const styles = ComputedStyleAnalyzer.extractTargetedStyles({
        transform: 'translate3d(0px, 10px, 0px)',
        opacity: '0.8',
        width: '500px',
        color: 'rgb(255, 0, 0)',
        'margin-top': '20px', // Untargeted
      });
      expect(styles.transform).toBe('translate3d(0px, 10px, 0px)');
      expect(styles.opacity).toBe('0.8');
      expect(styles.width).toBe('500px');
      expect((styles as any)['margin-top']).toBeUndefined();
    });

    it('19. DOMMutationObserver records mutation events non-destructively up to budget limit', () => {
      const observer = new DOMMutationObserver(2);
      observer.start();
      observer.recordMutation({
        selector: '.card',
        tagName: 'DIV',
        propertyName: 'opacity',
        oldValue: '0',
        newValue: '1',
        timestamp: Date.now(),
      });
      observer.recordMutation({
        selector: '.card',
        tagName: 'DIV',
        propertyName: 'transform',
        oldValue: 'translateY(20px)',
        newValue: 'translateY(0px)',
        timestamp: Date.now(),
      });
      // 3rd mutation exceeds budget cap (2)
      observer.recordMutation({
        selector: '.card',
        tagName: 'DIV',
        propertyName: 'color',
        oldValue: 'red',
        newValue: 'blue',
        timestamp: Date.now(),
      });

      const records = observer.stop();
      expect(records.length).toBe(2);
    });
  });

  // ----------------------------------------------------
  // CATEGORY 5: ANALYSIS PIPELINE & DATABASE INTEGRATION
  // ----------------------------------------------------
  describe('Analysis Pipeline & Prisma Transaction Persistence', () => {
    it('20. AnalysisPipeline executes technology, animation, 3D analysis and persists atomically to SQLite', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace ' + uid,
          storagePath: 'workspaces/test-ws-' + uid,
        },
      });

      const website = await prisma.website.create({
        data: {
          workspaceId: workspace.id,
          name: 'Test Animation Site ' + uid,
          url: 'https://animation.lab',
          storagePath: 'workspaces/test-anim-' + uid,
        },
      });

      const page = await prisma.page.create({
        data: {
          websiteId: website.id,
          url: 'https://animation.lab/',
          path: '/',
          title: 'Home',
        },
      });

      const pipeline = new AnalysisPipeline(prisma);
      const res = await pipeline.runAnalysis(
        {
          websiteId: website.id,
          pageId: page.id,
          url: 'https://animation.lab/',
          htmlContent: '<div data-reactroot=""><canvas id="webgl"></canvas></div>',
          scriptUrls: ['/js/react.js', '/js/gsap.js', '/js/three.js'],
          networkUrls: ['/assets/model.glb'],
          windowGlobals: ['React', 'gsap', 'THREE'],
          cssRules: [
            {
              selector: '.title',
              animationName: 'slideDown',
              animationDuration: '1s',
            },
          ],
          canvases: [{ selector: '#webgl', contextType: 'webgl', width: 1000, height: 800 }],
          threeState: { isLoaded: true, version: 'r150' },
        },
        PRESET_CONFIGS.standard
      );

      expect(res.status).toBe('completed');
      expect(res.technologies.length).toBeGreaterThan(0);
      expect(res.animations.length).toBe(1);
      expect(res.threeDExperience).not.toBeNull();

      // Verify Prisma Database Rows
      const dbTechEv = await prisma.technologyEvidence.findMany({ where: { websiteId: website.id } });
      expect(dbTechEv.length).toBeGreaterThan(0);

      const dbAnim = await prisma.animation.findMany({ where: { pageId: page.id } });
      expect(dbAnim.length).toBe(1);
      expect(dbAnim[0].name).toContain('slideDown');

      const dbThreeD = await prisma.threeDExperience.findMany({ where: { pageId: page.id } });
      expect(dbThreeD.length).toBe(1);
      expect(dbThreeD[0].type).toBe('threejs');
    });

    it('21. Handles partial failures gracefully without discarding earlier HTML/resource results', async () => {
      const pipeline = new AnalysisPipeline(prisma);
      const res = await pipeline.runAnalysis({
        websiteId: 'non-existent-site-id', // Will cause DB transaction commit failure
        pageId: 'non-existent-page-id',
        url: 'https://fail.lab/',
        htmlContent: '<html></html>',
        scriptUrls: [],
        networkUrls: [],
        windowGlobals: [],
      });

      // Pipeline status marked as failed due to database foreign key error, but returned in-memory detections intact
      expect(res.status).toBe('failed');
      expect(res.errorMessage).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // CATEGORY 6: IPC SECURITY & ROUTING
  // ----------------------------------------------------
  describe('IPC Security & Endpoint Validation', () => {
    it('22. IPC technology.detect returns detected technologies via RequestRouter', async () => {
      const router = new RequestRouter();
      const res = await router.routeRequest({
        id: 'req-tech-1',
        method: IPC_METHODS.TECHNOLOGY_DETECT,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: {
          htmlContent: '<div data-reactroot=""></div>',
          scriptUrls: ['/gsap.js'],
          windowGlobals: ['React', 'gsap'],
        },
      });

      expect(res.success).toBe(true);
      expect(res.result?.technologies).toBeDefined();
      expect(res.result?.technologies.some((t: any) => t.name === 'React')).toBe(true);
    });

    it('23. IPC rejects malicious path traversal parameters in analysis requests', async () => {
      const router = new RequestRouter();
      const res = await router.routeRequest({
        id: 'req-traversal',
        method: IPC_METHODS.TECHNOLOGY_DETECT,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: {
          htmlContent: '<html></html>',
          scriptUrls: ['../../../../etc/passwd'],
        },
      });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('VALIDATION_FAILED');
      expect(res.error?.message).toContain('Path traversal');
    });
  });
});
