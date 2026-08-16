import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PythonMotionBridge } from '../src/engine/motionLab/pythonBridge';
import { DenseFrameCaptureEngine } from '../src/engine/motionLab/denseFrameCapture';
import { DeepSectionIntelligenceEngine } from '../src/engine/workbench/deepSectionIntelligence';
import { PatternClassifier } from '../src/engine/workbench/patternClassifier';
import { FrameAccurateVerifier } from '../src/engine/acceptance/frameAccurateVerifier';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import { PlanBuilder } from '../src/engine/generation/synthesisPlan';
import { LiveSiteServer } from './fixtures/liveSiteServer';
import { RealSiteExtractor } from '../src/engine/workbench/realSiteExtractor';
import { LibraryIndexer } from '../src/engine/workbench/libraryIndexer';

describe('Phase 20 — Production Extraction Workbench & Frame-Accurate Certification Suite', () => {
  const liveServer = new LiveSiteServer(4201);
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase20_workbench');

  beforeAll(async () => {
    await liveServer.start();
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspaceDir, { recursive: true });
  }, 15000);

  afterAll(async () => {
    await liveServer.stop();
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 1. Python Perception Lab: Optical Flow & SSIM
  // -------------------------------------------------------------------------
  describe('1. Python Perception & Optical Flow Engine', () => {
    it('1. Calculates dense optical flow motion vectors across consecutive frames', () => {
      const frameA = Array.from({ length: 100 }, () => [255, 255, 255]);
      const frameB = Array.from({ length: 100 }, (_, idx) => (idx < 50 ? [0, 0, 0] : [255, 255, 255]));

      const flow = PythonMotionBridge.calculateOpticalFlow(frameA, frameB, 10, 10, 5);
      expect(flow).toBeDefined();
      expect(flow.motionEnergy).toBeGreaterThan(0);
      expect(flow.activeMotionBlocks).toBeGreaterThan(0);
    });

    it('2. Calculates perceptual SSIM score between identical and divergent frames', () => {
      const source = Array.from({ length: 100 }, () => [240, 240, 240]);
      const candidate = Array.from({ length: 100 }, () => [240, 240, 240]);

      const ssimResult = PythonMotionBridge.calculatePerceptualSSIM(source, candidate, 10, 10);
      expect(ssimResult.ssimScore).toBe(1.0);
      expect(ssimResult.isPerceptuallyIdentical).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Dense Frame-Accurate Capture (0% to 100%)
  // -------------------------------------------------------------------------
  describe('2. Dense Frame Sequence Capture', () => {
    it('3. Generates high-density frame sequence from 0% to 100% animation progress', () => {
      const session = DenseFrameCaptureEngine.createDenseCaptureSession(
        testWorkspaceDir,
        'dense-cap-hero',
        'http://127.0.0.1:4199',
        'sec-hero-01',
        1000,
        60
      );

      expect(session.totalFrames).toBeGreaterThanOrEqual(10);
      expect(session.frames[0].progressPercent).toBe(0);
      expect(session.frames[session.frames.length - 1].progressPercent).toBe(100);
      expect(fs.existsSync(path.join(session.storagePath, 'dense_manifest.json'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Deep 11-Pillar Canonical Section Intelligence
  // -------------------------------------------------------------------------
  describe('3. Deep 11-Pillar Section Intelligence Engine', () => {
    it('4. Generates complete 11-pillar section report matching canonical schema', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-canon-hero',
        websiteId: 'web-canon',
        pageId: 'page-canon',
        title: 'Kinetic Hero Section',
        category: 'Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        domSelector: '#hero-sec',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        rawHtml: '<section id="hero-sec"><h1>Title</h1><p>Subtitle</p><button class="btn">Action</button></section>',
        animations: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-h',
            durationMs: 1200,
            totalDurationMs: 1200,
            repeat: 0,
            yoyo: false,
            tweens: [{ targetSelector: '#hero-sec h1', propertiesTo: { opacity: 1, y: 0 }, duration: 1.2 }],
          },
        ],
        interactions: [
          { id: 'int-h', triggerType: 'pointermove', targetSelector: '.btn' },
        ],
      });

      const plan = PlanBuilder.buildPlan(fir);
      const report = DeepSectionIntelligenceEngine.generateCanonicalReport(fir, plan, {
        sequenceIndex: 1,
        prevId: null,
        nextId: 'sec-story',
      });

      // Verify all 11 Pillars
      expect(report.schemaVersion).toBe('1.0.0');
      expect(report.identity.semanticRole).toBe('HERO');
      expect(report.geometry.width).toBe(1440);
      expect(report.typography.primaryFontFamily).toBeDefined();
      expect(report.assets.totalAssetsCount).toBe(0);
      expect(report.motion.hasMotion).toBe(true);
      expect(report.motion.motionEngine).toBe('GSAP');
      expect(report.interaction.hasInteractions).toBe(true);
      expect(report.interaction.hasMagneticPointer).toBe(true);
      expect(report.scroll.scrollType).toBe('NORMAL');
      expect(report.responsive.viewportsSupported.length).toBe(4);
      expect(report.storytelling.sequenceIndex).toBe(1);
      expect(report.dependencies.npmPackages).toBeDefined();
      expect(report.certification.disposition).toBe('COPY_USE_CERTIFIED');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Architectural Pattern Classification
  // -------------------------------------------------------------------------
  describe('4. Architectural Pattern Classifier', () => {
    it('5. Classifies Hero with GSAP as KINETIC_TYPOGRAPHY_HERO', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-h',
        websiteId: 'web-h',
        pageId: 'page-h',
        title: 'Hero Title',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#h',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        animations: [{ kind: 'gsap_timeline', timelineId: 'tl', durationMs: 1000, totalDurationMs: 1000, repeat: 0, yoyo: false, tweens: [] }],
      });

      const res = PatternClassifier.classify(fir);
      expect(res.pattern).toBe('KINETIC_TYPOGRAPHY_HERO');
      expect(res.patternArchetype).toContain('Kinetic Typography');
    });

    it('6. Classifies FAQ with click state as STATEFUL_ACCORDION_FAQ', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-faq',
        websiteId: 'web-faq',
        pageId: 'page-faq',
        title: 'FAQ Title',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'FAQ',
        domSelector: '#faq',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 600, viewportRatio: 1 },
        interactions: [{ id: 'int-faq', triggerType: 'click', targetSelector: '.btn' }],
      });

      const res = PatternClassifier.classify(fir);
      expect(res.pattern).toBe('STATEFUL_ACCORDION_FAQ');
    });

    it('7. Classifies CTA with pointer physics as MAGNETIC_POINTER_CTA', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-cta',
        websiteId: 'web-cta',
        pageId: 'page-cta',
        title: 'CTA Title',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'CTA',
        domSelector: '#cta',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 400, viewportRatio: 1 },
        interactions: [{ id: 'int-cta', triggerType: 'pointermove', targetSelector: '.btn' }],
      });

      const res = PatternClassifier.classify(fir);
      expect(res.pattern).toBe('MAGNETIC_POINTER_CTA');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Frame-Accurate Verification Engine
  // -------------------------------------------------------------------------
  describe('5. Frame-Accurate Verification Engine', () => {
    it('8. Verifies synthesized component frame sequences against source frames', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-test-frame-acc',
        websiteId: 'web-acc',
        pageId: 'page-acc',
        title: 'Frame Accurate Section',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
      });

      const report = FrameAccurateVerifier.verifyFrames(fir, 'HeroSection', 10, 50, 50);
      expect(report.totalFramesEvaluated).toBe(10);
      expect(report.visualSimilarity).toBeGreaterThanOrEqual(0.95);
      expect(report.compositeFidelity).toBeGreaterThanOrEqual(95.0);
      expect(report.isFrameAccurateCertified).toBe(true);
      expect(report.disposition).toBe('COPY_USE_CERTIFIED');
    });
  });

  // -------------------------------------------------------------------------
  // 6. Real-World Live Extraction with 11-Pillar Reports & Library Cataloging
  // -------------------------------------------------------------------------
  describe('6. Real-World Live Extraction Pipeline', () => {
    it('9. Executes live Chromium browser extraction and verifies full 11-pillar intelligence', async () => {
      const outputDir = path.join(testWorkspaceDir, 'live_p20_run');
      const result = await RealSiteExtractor.extractRealSite({
        url: liveServer.url,
        outputDirectory: outputDir,
        timeoutMs: 15000,
      });

      expect(result.status === 'SUCCESS' || result.status === 'PARTIAL').toBe(true);
      expect(result.totalSections).toBeGreaterThanOrEqual(4);

      // Verify page-report.json exists
      expect(fs.existsSync(path.join(outputDir, 'page-report.json'))).toBe(true);

      // Verify sections.json exists
      expect(fs.existsSync(path.join(outputDir, 'sections.json'))).toBe(true);

      // Verify section intelligence report exists
      expect(fs.existsSync(path.join(outputDir, 'reports', 'section-reports.json'))).toBe(true);

      // Verify certification.json exists
      expect(fs.existsSync(path.join(outputDir, 'certification', 'certification.json'))).toBe(true);

      // Verify Library Indexer entries have pattern metadata
      const catalog = LibraryIndexer.readCatalog(outputDir);
      expect(catalog.totalComponents).toBeGreaterThan(0);
    }, 45000);
  });
});
