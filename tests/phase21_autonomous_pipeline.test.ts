import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PythonMotionBridge } from '../src/engine/motionLab/pythonBridge';
import { SectionPassportEngine } from '../src/engine/workbench/sectionPassportEngine';
import { MultiDimensionalCataloger } from '../src/engine/workbench/multiDimensionalCataloger';
import { AutonomousPipeline } from '../src/engine/workbench/autonomousPipeline';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import { PlanBuilder } from '../src/engine/generation/synthesisPlan';
import { LiveSiteServer } from './fixtures/liveSiteServer';

describe('Phase 21 — Autonomous Website Reverse-Engineering Pipeline Suite', () => {
  const liveServer = new LiveSiteServer(4202);
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase21_pipeline');

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
  // 1. Python Multi-Domain Trajectory & Perceptual Segmentation
  // -------------------------------------------------------------------------
  describe('1. Python Multi-Domain Trajectory & Spatial Segmentation', () => {
    it('1. Reconstructs time-domain parametric motion curve with velocity derivatives', () => {
      const samples = [
        { timestampMs: 0, x: 0, y: 50, scale: 0.95, opacity: 0 },
        { timestampMs: 500, x: 0, y: 15, scale: 0.98, opacity: 0.7 },
        { timestampMs: 1000, x: 0, y: 0, scale: 1.0, opacity: 1.0 },
      ];

      const traj = PythonMotionBridge.reconstructTrajectory(samples, 'TIME_DOMAIN');
      expect(traj.totalSamples).toBe(3);
      expect(traj.durationMs).toBe(1000);
      expect(traj.trajectoryCurve.length).toBe(3);
      expect(traj.peakVelocity).toBeGreaterThan(0);
    });

    it('2. Segments DOM elements into spatial visual clusters (headings, cards, actions)', () => {
      const elements = [
        { tagName: 'H1', selector: '#title', width: 800, height: 100, x: 50, y: 50 },
        { tagName: 'DIV', selector: '.service-card', width: 300, height: 200, x: 50, y: 200 },
        { tagName: 'DIV', selector: '.service-card', width: 300, height: 200, x: 380, y: 200 },
        { tagName: 'DIV', selector: '.service-card', width: 300, height: 200, x: 710, y: 200 },
        { tagName: 'BUTTON', selector: '.btn-cta', width: 180, height: 50, x: 50, y: 450 },
      ];

      const seg = PythonMotionBridge.segmentFrame(elements, 1440, 900);
      expect(seg.totalRegions).toBeGreaterThanOrEqual(3);
      expect(seg.dominantLayout).toBe('GRID');
      expect(seg.hasCardGrid).toBe(true);
      expect(seg.hasActionTrigger).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Section Passport Schema & Atomic Generation
  // -------------------------------------------------------------------------
  describe('2. Section Passport Engine', () => {
    it('3. Generates Section Passport conforming to the canonical schema', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-hero-pass',
        websiteId: 'awwwards-site',
        pageId: 'page-root',
        title: 'Cinematic Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        animations: [{ kind: 'gsap_timeline', timelineId: 'tl', durationMs: 1200, totalDurationMs: 1200, repeat: 0, yoyo: false, tweens: [] }],
        interactions: [{ id: 'int-p', triggerType: 'pointermove', targetSelector: '.btn' }],
      });

      const plan = PlanBuilder.buildPlan(fir);
      const passport = SectionPassportEngine.createPassport(fir, plan, {
        componentName: 'CinematicHeroSection',
        sequenceIndex: 1,
        prevId: null,
        nextId: 'sec-story',
      });

      expect(passport.schemaVersion).toBe('1.0.0');
      expect(passport.sectionId).toBe('sec-hero-pass');
      expect(passport.identity.pattern).toBe('KINETIC_TYPOGRAPHY_HERO');
      expect(passport.identity.confidence).toBeGreaterThan(0.9);
      expect(passport.layout.containerWidth).toBe(1440);
      expect(passport.typography.families.length).toBeGreaterThan(0);
      expect(passport.motion.engine).toBe('GSAP');
      expect(passport.interaction.pointermove).toBe(true);
      expect(passport.responsive.desktop).toBe(true);
      expect(passport.storytelling.sequenceIndex).toBe(1);
      expect(passport.certification.disposition).toBe('COPY_USE_CERTIFIED');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Multi-Dimensional Library Database
  // -------------------------------------------------------------------------
  describe('3. Multi-Dimensional Library Database (6 Catalogs)', () => {
    it('4. Updates all 6 queryable catalogs (index, patterns, technologies, typography, animation-patterns, assets)', () => {
      const libDir = path.join(testWorkspaceDir, 'library');
      const firHero = FIRAssembler.assemble({
        sectionId: 'sec-01-hero',
        websiteId: 'brand-a',
        pageId: 'p1',
        title: 'Hero A',
        sourceUrl: 'https://brand-a.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        animations: [{ kind: 'gsap_timeline', timelineId: 'tl', durationMs: 1000, totalDurationMs: 1000, repeat: 0, yoyo: false, tweens: [] }],
      });

      const firFaq = FIRAssembler.assemble({
        sectionId: 'sec-02-faq',
        websiteId: 'brand-a',
        pageId: 'p1',
        title: 'FAQ A',
        sourceUrl: 'https://brand-a.com',
        pagePath: '/',
        category: 'FAQ',
        domSelector: '#faq',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 600, viewportRatio: 1 },
        interactions: [{ id: 'int-clk', triggerType: 'click', targetSelector: '.btn' }],
      });

      const passHero = SectionPassportEngine.createPassport(firHero, PlanBuilder.buildPlan(firHero));
      const passFaq = SectionPassportEngine.createPassport(firFaq, PlanBuilder.buildPlan(firFaq));

      const catalogs = MultiDimensionalCataloger.updateCatalogs([passHero, passFaq], libDir);

      expect(catalogs.totalComponents).toBe(2);
      expect(catalogs.totalPatterns).toBeGreaterThanOrEqual(2);

      expect(fs.existsSync(path.join(libDir, 'index.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'patterns.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'technologies.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'typography.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'animation-patterns.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'assets.json'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Full Autonomous Pipeline Execution
  // -------------------------------------------------------------------------
  describe('4. Autonomous Reverse-Engineering Pipeline Execution', () => {
    it('5. Executes full autonomous website extraction and generates complete directory tree', async () => {
      const rootDataDir = path.join(testWorkspaceDir, 'workspace-data');
      const batchReport = await AutonomousPipeline.executeBatch({
        urls: [liveServer.url],
        workspaceDataDir: rootDataDir,
        timeoutMs: 15000,
      });

      expect(batchReport.totalWebsites).toBe(1);
      expect(batchReport.totalSectionsDiscovered).toBeGreaterThanOrEqual(4);
      expect(batchReport.totalComponentsGenerated).toBeGreaterThanOrEqual(4);
      expect(batchReport.totalCertified).toBeGreaterThanOrEqual(3);

      const parsedUrl = new URL(liveServer.url);
      const domain = parsedUrl.hostname.replace(/[^a-zA-Z0-9]/g, '_');
      const siteDir = path.join(rootDataDir, 'sites', domain);

      // Verify Complete Required Directory Structure
      expect(fs.existsSync(path.join(siteDir, 'manifest.json'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'capture', 'desktop'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'capture', 'laptop'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'capture', 'tablet'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'capture', 'mobile'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'sections'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'fir'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'intelligence'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'verification'))).toBe(true);

      // Verify Section Folders contain passport.json and intelligence.json
      const sectionFolders = fs.readdirSync(path.join(siteDir, 'sections'));
      expect(sectionFolders.length).toBeGreaterThan(0);
      const firstSecDir = path.join(siteDir, 'sections', sectionFolders[0]);
      expect(fs.existsSync(path.join(firstSecDir, 'passport.json'))).toBe(true);
      expect(fs.existsSync(path.join(firstSecDir, 'fir.json'))).toBe(true);
      expect(fs.existsSync(path.join(firstSecDir, 'intelligence.json'))).toBe(true);

      // Verify Library Database
      const libDir = path.join(rootDataDir, 'library');
      expect(fs.existsSync(path.join(libDir, 'index.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'patterns.json'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'technologies.json'))).toBe(true);

      // Verify batch-report.json
      expect(fs.existsSync(path.join(rootDataDir, 'batch-report.json'))).toBe(true);
    }, 45000);
  });
});
