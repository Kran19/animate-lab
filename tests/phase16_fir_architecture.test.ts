import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  SectionFIR,
  CURRENT_FIR_VERSION,
  CURRENT_FIR_SCHEMA_URL,
  FIRValidator,
  isFIRVersionCompatible,
  parseFIRVersion,
} from '../src/engine/domain/fir';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import {
  CapabilityResolver,
  PlanBuilder,
  SynthesisPlan,
} from '../src/engine/generation/synthesisPlan';
import { ReactGenerator } from '../src/engine/generation/reactGenerator';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { EvidenceBundleBuilder } from '../src/engine/package/evidenceBundleBuilder';
import { CleanRoomRunner } from '../src/engine/acceptance/cleanRoomRunner';

describe('Phase 16 — Forensic Intermediate Representation (FIR) Architecture Suite', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_fir_phase16');

  beforeEach(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspaceDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 1. FIR Schema & Validation Contracts
  // -------------------------------------------------------------------------
  describe('1. FIR Schema & Validation Invariants', () => {
    it('1. Rejects invalid schema URL', () => {
      const invalidFir: any = {
        schema: 'https://fake-schema.com/v1.json',
        firVersion: CURRENT_FIR_VERSION,
      };
      const res = FIRValidator.validate(invalidFir);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('Invalid schema'))).toBe(true);
    });

    it('2. Enforces SemVer version parsing and compatibility rules', () => {
      expect(parseFIRVersion('0.1.0')).toEqual({ major: 0, minor: 1, patch: 0 });
      expect(isFIRVersionCompatible('0.1.0', '0.1.0')).toBe(true);
      expect(isFIRVersionCompatible('0.0.9', '0.1.0')).toBe(true);
      expect(isFIRVersionCompatible('0.2.0', '0.1.0')).toBe(false); // higher minor
      expect(isFIRVersionCompatible('1.0.0', '0.1.0')).toBe(false); // different major
    });

    it('3. Computes deterministic SHA-256 integrity hash across canonical payload', () => {
      const firA = FIRAssembler.assemble({
        sectionId: 'sec-test-01',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Hero Section',
        category: 'Hero',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        rawHtml: '<section id="hero"><h1>Trionn Design Agency</h1></section>',
      });

      const firB = FIRAssembler.assemble({
        sectionId: 'sec-test-01',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Hero Section',
        category: 'Hero',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        rawHtml: '<section id="hero"><h1>Trionn Design Agency</h1></section>',
      });

      expect(firA.diagnostics.integrityHash).toBeDefined();
      expect(firA.diagnostics.integrityHash.length).toBe(64);
      expect(firA.diagnostics.integrityHash).toBe(firB.diagnostics.integrityHash);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Discriminated Union & Provenance Integrity
  // -------------------------------------------------------------------------
  describe('2. Motion & Canvas Discriminated Unions', () => {
    it('4. Supports CSS keyframe animation evidence', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-css-anim',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Marquee Section',
        category: 'Marquee',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#marquee',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 800, width: 1440, height: 200, viewportRatio: 0.25 },
        rawHtml: '<section id="marquee"><div class="track">Infinite Text</div></section>',
        animations: [
          {
            kind: 'css_animation',
            animationName: 'marquee-scroll',
            durationMs: 12000,
            delayMs: 0,
            timingFunction: 'linear',
            iterationCount: 'infinite',
            direction: 'normal',
            fillMode: 'none',
            keyframes: [
              { offset: 0.0, properties: { transform: 'translateX(0%)' } },
              { offset: 1.0, properties: { transform: 'translateX(-50%)' } },
            ],
            targetSelector: '.track',
          },
        ],
      });

      expect(fir.motion.hasMotion).toBe(true);
      expect(fir.motion.traces[0].kind).toBe('css_animation');
      expect((fir.motion.traces[0] as any).animationName).toBe('marquee-scroll');
    });

    it('5. Supports GSAP Timeline & ScrollTrigger evidence', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-gsap',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Projects Grid',
        category: 'Gallery',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#projects',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 1200, width: 1440, height: 900, viewportRatio: 1.0 },
        rawHtml: '<section id="projects"><div class="card">Card 1</div></section>',
        animations: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-projects-01',
            durationMs: 1500,
            totalDurationMs: 1500,
            repeat: 0,
            yoyo: false,
            tweens: [
              {
                targetSelector: '.card',
                propertiesFrom: { opacity: 0, y: 50 },
                propertiesTo: { opacity: 1, y: 0 },
                duration: 1.5,
                ease: 'power3.out',
              },
            ],
          },
          {
            kind: 'scroll_trigger',
            triggerSelector: '#projects',
            start: 'top 80%',
            scrub: 1,
            pin: false,
            markers: false,
            linkedTimelineId: 'tl-projects-01',
          },
        ],
      });

      expect(fir.motion.traces.length).toBe(2);
      expect(fir.motion.traces.some((t) => t.kind === 'gsap_timeline')).toBe(true);
      expect(fir.motion.traces.some((t) => t.kind === 'scroll_trigger')).toBe(true);
    });

    it('6. Supports WebGL Canvas Fallback evidence', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-webgl',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Interactive 3D Experience',
        category: '3D',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#webgl-canvas',
        domTagName: 'CANVAS',
        bounds: { x: 0, y: 2200, width: 1440, height: 800, viewportRatio: 0.9 },
        rawHtml: '<canvas id="webgl-canvas"></canvas>',
        canvasEvidence: [
          {
            kind: 'webgl_static_fallback',
            canvasSelector: '#webgl-canvas',
            contextType: 'webgl2',
            width: 1440,
            height: 800,
            staticSnapshotAssetId: 'asset-snapshot-3d',
            estimatedFps: 60,
          },
        ],
      });

      expect(fir.canvas.hasCanvas).toBe(true);
      expect(fir.canvas.canvasCount).toBe(1);
      expect(fir.canvas.evidence[0].kind).toBe('webgl_static_fallback');
    });

    it('7. Enforces Asset Provenance and SHA-256 metadata', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-assets',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Showcase Section',
        category: 'Showcase',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#showcase',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 3000, width: 1440, height: 800, viewportRatio: 1 },
        rawHtml: '<section id="showcase"><img src="./assets/hero.webp" /></section>',
        assets: [
          {
            id: 'asset-hero-img',
            type: 'image',
            sourceUrl: 'https://trionn.com/images/hero.webp',
            localPath: path.join(testWorkspaceDir, 'hero.webp'),
            exportPath: 'assets/hero.webp',
            sha256: 'a1b2c3d4e5f607182930415263748596a1b2c3d4e5f607182930415263748596',
            mimeType: 'image/webp',
            byteLength: 45020,
            discoveredBy: 'img_src',
          },
        ],
      });

      expect(fir.assets.totalAssetsCount).toBe(1);
      expect(fir.assets.assets[0].sha256).toBeDefined();
      expect(fir.assets.assets[0].discoveredBy).toBe('img_src');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Capability Resolution & Synthesis Planning
  // -------------------------------------------------------------------------
  describe('3. Capability Resolution & Synthesis Planning', () => {
    it('8. Resolves TIER_1_DETERMINISTIC for static DOM/CSS section', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-about',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'About Agency Section',
        category: 'About',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#about',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 500, width: 1440, height: 600, viewportRatio: 0.7 },
        rawHtml: '<section id="about"><h2>About Us</h2><p>We are a digital agency.</p></section>',
      });

      const resolution = CapabilityResolver.resolve(fir);
      expect(resolution.tier).toBe('TIER_1_DETERMINISTIC');
      expect(resolution.reconstructabilityScore).toBe(1.0);
    });

    it('9. Resolves TIER_2_MOTION_RECORDED for GSAP/ScrollTrigger section', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-gsap-card',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Featured Projects',
        category: 'Gallery',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#projects',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 1100, width: 1440, height: 800, viewportRatio: 1.0 },
        rawHtml: '<section id="projects"><div class="card">Card Item</div></section>',
        animations: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-01',
            durationMs: 1200,
            totalDurationMs: 1200,
            repeat: 0,
            yoyo: false,
            tweens: [{ targetSelector: '.card', propertiesTo: { y: 0 }, duration: 1.2 }],
          },
        ],
      });

      const resolution = CapabilityResolver.resolve(fir);
      expect(resolution.tier).toBe('TIER_2_MOTION_RECORDED');
      expect(resolution.hasRecordedGSAP).toBe(true);
      expect(resolution.reconstructabilityScore).toBeGreaterThanOrEqual(0.9);
    });

    it('10. Resolves TIER_4_CANVAS_FALLBACK for 3D canvas section', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-3d',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: '3D Background',
        category: '3D',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#bg3d',
        domTagName: 'CANVAS',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1.0 },
        rawHtml: '<canvas id="bg3d"></canvas>',
        canvasEvidence: [
          {
            kind: 'webgl_static_fallback',
            canvasSelector: '#bg3d',
            contextType: 'webgl2',
            width: 1440,
            height: 900,
            staticSnapshotAssetId: 'asset-3d',
            estimatedFps: 60,
          },
        ],
      });

      const resolution = CapabilityResolver.resolve(fir);
      expect(resolution.tier).toBe('TIER_4_CANVAS_FALLBACK');
      expect(resolution.hasCanvasOrWebGL).toBe(true);
      expect(resolution.knownLimitations.length).toBeGreaterThan(0);
    });

    it('11. Builds explicit, declarative SynthesisPlan from SectionFIR', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-cta',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Call To Action Section',
        category: 'CTA',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#cta',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 4000, width: 1440, height: 500, viewportRatio: 0.6 },
        rawHtml: '<section id="cta"><h2>Let us work together</h2><button>Contact Us</button></section>',
      });

      const plan = PlanBuilder.buildPlan(fir);
      expect(plan.componentName).toBe('CallToActionSection');
      expect(plan.domStrategy).toBe('JSX_CLEAN');
      expect(plan.cssStrategy).toBe('CSS_MODULE');
      expect(plan.dependencyStrategy).toBe('BUNDLE_LOCAL');
      expect(plan.declaredNpmDependencies['react']).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Component Synthesis from FIR & Zero-Browser Coupling
  // -------------------------------------------------------------------------
  describe('4. Component Synthesis from FIR', () => {
    it('12. ReactGenerator synthesizes component directly from SectionFIR without browser state', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-footer',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Footer Section',
        category: 'Footer',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#footer',
        domTagName: 'FOOTER',
        bounds: { x: 0, y: 5000, width: 1440, height: 400, viewportRatio: 0.5 },
        rawHtml: '<footer><p>© 2026 Trionn. All rights reserved.</p></footer>',
        scopedCss: '.footer-root { background: #050505; color: #ffffff; padding: 40px; }',
      });

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(fir);

      expect(generated.componentName).toBe('FooterSection');
      expect(generated.tsxCode).toContain('export const FooterSection: React.FC<Props>');
      expect(generated.tsxCode).toContain('import React from \'react\';');
      expect(generated.tsxCode).toContain('import \'./FooterSection.css\';');
      expect(generated.cssCode).toContain('.footer-root');
      expect(generated.stage).toBe('GENERATED');
    });

    it('13. Synthesizes useGSAP hook when motion traces exist in FIR', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-anim-hero',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Hero Section',
        category: 'Hero',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        rawHtml: '<section id="hero"><h1>Creative Studio</h1></section>',
        animations: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-hero',
            durationMs: 1000,
            totalDurationMs: 1000,
            repeat: 0,
            yoyo: false,
            tweens: [{ targetSelector: '#hero', propertiesTo: { opacity: 1 }, duration: 1.0 }],
          },
        ],
      });

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(fir);

      expect(generated.tsxCode).toContain("import { useGSAP } from '@gsap/react';");
      expect(generated.tsxCode).toContain("import gsap from 'gsap';");
      expect(generated.tsxCode).toContain('useGSAP(');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Standalone Package & Evidence Bundle Integration
  // -------------------------------------------------------------------------
  describe('5. Standalone Package & Evidence Integration', () => {
    it('14. Writes fir.json into standalone package root and evidence directory', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-testimonials',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Testimonials Section',
        category: 'Testimonials',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#testimonials',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 3500, width: 1440, height: 600, viewportRatio: 0.7 },
        rawHtml: '<section id="testimonials"><blockquote>Outstanding work</blockquote></section>',
      });

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(fir);

      const pkgResult = ComponentPackageBuilder.buildPackage({
        componentName: generated.componentName,
        category: 'Testimonials',
        sourceCandidateId: fir.identity.sectionId,
        websiteId: fir.identity.websiteId,
        pageId: fir.identity.pageId,
        sourceWebsiteUrl: fir.identity.sourceUrl,
        sourcePagePath: fir.identity.pagePath,
        tsxCode: generated.tsxCode,
        cssCode: generated.cssCode,
        assets: [],
        propsDocJson: generated.propsDocJson,
        technologies: ['React', 'CSS Modules'],
        animations: [],
        isolationStatus: 'ISOLATED',
        validationReport: { isValid: true, layersPassed: ['all'], layersFailed: [], errors: [], warnings: [] },
        fir,
        outputDirectory: testWorkspaceDir,
      });

      expect(pkgResult.status).toBe('created');
      expect(pkgResult.filesCreated).toContain('fir.json');
      expect(fs.existsSync(path.join(pkgResult.packagePath, 'fir.json'))).toBe(true);

      const evidenceResult = EvidenceBundleBuilder.buildEvidenceBundle({
        packageDirectory: pkgResult.packagePath,
        domHtml: fir.dom.rawHtmlSnapshot,
        computedStyles: fir.styles.nodeStyles,
        geometry: fir.geometry,
        typography: [],
        animations: fir.motion.traces,
        interactions: fir.interactions.interactions,
        resources: [],
        network: [],
        fir,
      });

      expect(evidenceResult.filesCreated).toContain('evidence/fir.json');
      expect(fs.existsSync(path.join(pkgResult.packagePath, 'evidence', 'fir.json'))).toBe(true);
    });

    it('15. CleanRoomRunner verifies standalone package generated from FIR with zero internal leaks', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-marquee-clean',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Infinite Marquee Section',
        category: 'Marquee',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#marquee',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 700, width: 1440, height: 250, viewportRatio: 0.3 },
        rawHtml: '<section id="marquee"><div>Branding • Motion • Interactive</div></section>',
      });

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(fir);

      const pkgResult = ComponentPackageBuilder.buildPackage({
        componentName: generated.componentName,
        category: 'Marquee',
        sourceCandidateId: fir.identity.sectionId,
        websiteId: fir.identity.websiteId,
        pageId: fir.identity.pageId,
        sourceWebsiteUrl: fir.identity.sourceUrl,
        sourcePagePath: fir.identity.pagePath,
        tsxCode: generated.tsxCode,
        cssCode: generated.cssCode,
        assets: [],
        propsDocJson: generated.propsDocJson,
        technologies: ['React'],
        animations: [],
        isolationStatus: 'ISOLATED',
        validationReport: { isValid: true, layersPassed: ['all'], layersFailed: [], errors: [], warnings: [] },
        fir,
        outputDirectory: testWorkspaceDir,
      });

      const cleanRoomResult = CleanRoomRunner.executeCleanRoomVerification({
        runId: 'run-fir-test',
        sectionId: fir.identity.sectionId,
        componentName: generated.componentName,
        packageDirectory: pkgResult.packagePath,
        targetBaseDirectory: path.join(testWorkspaceDir, 'clean_room'),
      });

      expect(cleanRoomResult.status).toBe('PASS');
      expect(cleanRoomResult.isCompilationValid).toBe(true);
      expect(cleanRoomResult.hasInternalPathLeakage).toBe(false);
    });

    it('16. Re-synthesizes component from persisted fir.json without revisiting original website', () => {
      const originalFir = FIRAssembler.assemble({
        sectionId: 'sec-resynth-01',
        websiteId: 'web-01',
        pageId: 'page-01',
        title: 'Agency Showreel Section',
        category: 'Video',
        sourceUrl: 'https://trionn.com',
        pagePath: '/',
        domSelector: '#showreel',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 2000, width: 1440, height: 700, viewportRatio: 0.8 },
        rawHtml: '<section id="showreel"><video src="./assets/reel.mp4"></video></section>',
        scopedCss: '.showreel-root { position: relative; width: 100%; }',
      });

      const firJsonPath = path.join(testWorkspaceDir, 'persisted-fir.json');
      fs.writeFileSync(firJsonPath, JSON.stringify(originalFir, null, 2), 'utf-8');

      // Read back from disk (simulating future generator running months later)
      const readFir: SectionFIR = JSON.parse(fs.readFileSync(firJsonPath, 'utf-8'));
      const validation = FIRValidator.validate(readFir);
      expect(validation.isValid).toBe(true);

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(readFir);

      expect(generated.componentName).toBe('AgencyShowreelSection');
      expect(generated.tsxCode).toContain('export const AgencyShowreelSection: React.FC<Props>');
      expect(generated.cssCode).toContain('.showreel-root');
    });
  });
});
