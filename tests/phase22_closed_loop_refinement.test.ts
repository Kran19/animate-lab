import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PythonMotionBridge } from '../src/engine/motionLab/pythonBridge';
import { AdaptiveFrameCaptureEngine } from '../src/engine/motionLab/adaptiveFrameCapture';
import { CorrectionPlanner } from '../src/engine/optimization/correctionPlanner';
import { ClosedLoopRefiner } from '../src/engine/optimization/closedLoopRefiner';
import { EngineeringReportGenerator } from '../src/engine/workbench/engineeringReportGenerator';
import { SectionPassportEngine } from '../src/engine/workbench/sectionPassportEngine';
import { MultiDimensionalCataloger } from '../src/engine/workbench/multiDimensionalCataloger';
import { AutonomousPipeline } from '../src/engine/workbench/autonomousPipeline';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import { PlanBuilder } from '../src/engine/generation/synthesisPlan';
import { LiveSiteServer } from './fixtures/liveSiteServer';

describe('Phase 22 — Production Closed-Loop Reconstruction & Autonomous Refinement Suite', () => {
  const liveServer = new LiveSiteServer(4203);
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase22_refinement');

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
  // 1. Motion Fingerprinting & Trajectory Comparison
  // -------------------------------------------------------------------------
  describe('1. Motion Fingerprinting & Trajectory Comparison', () => {
    it('1. Computes multi-dimensional motion fingerprint vector across normalized lifecycle', () => {
      const samples = [
        { timestampMs: 0, x: 0, y: 100, scale: 0.9, rotateDeg: 0, opacity: 0 },
        { timestampMs: 500, x: 0, y: 20, scale: 0.98, rotateDeg: 0, opacity: 0.8 },
        { timestampMs: 1000, x: 0, y: 0, scale: 1.0, rotateDeg: 0, opacity: 1.0 },
      ];

      const fp = PythonMotionBridge.generateMotionFingerprint('hero_heading', samples, 1000.0);
      expect(fp.elementId).toBe('hero_heading');
      expect(fp.totalCheckpoints).toBe(3);
      expect(fp.fingerprintVector[0].normalizedTime).toBe(0.0);
      expect(fp.fingerprintVector[2].normalizedTime).toBe(1.0);
      expect(fp.isHighKineticMotion).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Error Localization & Separation of Measurement
  // -------------------------------------------------------------------------
  describe('2. Error Localization Engine', () => {
    it('2. Localizes discrepancy into dominant error category and affected selectors', () => {
      const src = { selector: '#hero', bounds: { width: 1440, height: 800 }, motion: { durationMs: 1200 }, fontSizePx: 72 };
      const cand = { selector: '#hero', bounds: { width: 1440, height: 800 }, motion: { durationMs: 800 }, fontSizePx: 72 };

      const loc = PythonMotionBridge.localizeError('hero_sec', src, cand);
      expect(loc.dominantError).toBe('MOTION_TRAJECTORY');
      expect(loc.requiresCorrection).toBe(true);
      expect(loc.motionError).toBeGreaterThan(0);
      expect(loc.errorRegions.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Adaptive Frame Density Sampling
  // -------------------------------------------------------------------------
  describe('3. Adaptive Frame Capture Engine', () => {
    it('3. Generates high-frequency frame capture during rapid kinetic transitions', () => {
      const session = AdaptiveFrameCaptureEngine.createAdaptiveCapture(
        testWorkspaceDir,
        'adapt-hero-kinetic',
        'http://127.0.0.1:4203',
        'sec-hero-01',
        'HIGH_ACCELERATION',
        1000
      );

      expect(session.dominantKineticProfile).toBe('HIGH_ACCELERATION');
      expect(session.totalAdaptiveFrames).toBeGreaterThanOrEqual(20);
      expect(session.frames[0].sampleFrequencyFps).toBe(60);
      expect(fs.existsSync(path.join(session.storagePath, 'adaptive_manifest.json'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Correction Planner & Closed-Loop Optimizer
  // -------------------------------------------------------------------------
  describe('4. Closed-Loop Visual & Motion Refinement Loop', () => {
    it('4. Formulates concrete parameter adjustments from error localization', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-hero-opt',
        websiteId: 'web-opt',
        pageId: 'page-opt',
        title: 'Optimized Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        animations: [{ kind: 'gsap_timeline', timelineId: 'tl', durationMs: 1200, totalDurationMs: 1200, repeat: 0, yoyo: false, tweens: [] }],
      });

      const initialPlan = PlanBuilder.buildPlan(fir);
      const errorResult = {
        sectionId: 'sec-hero-opt',
        ssim: 0.94,
        geometryError: 0.08,
        motionError: 0.09,
        typographyError: 0.0,
        dominantError: 'MOTION_TRAJECTORY' as const,
        errorRegions: [{ selector: '#hero', errorType: 'MOTION_TRAJECTORY', discrepancyMs: 200 }],
        requiresCorrection: true,
      };

      const optPlan = CorrectionPlanner.formulateCorrections(errorResult, initialPlan, 1);
      expect(optPlan.requiresReSynthesis).toBe(true);
      expect(optPlan.actions.length).toBeGreaterThan(0);
      expect(optPlan.actions[0].category).toBe('MOTION');
      expect(optPlan.adjustedPlan.reconstructabilityScore).toBeGreaterThan(initialPlan.reconstructabilityScore);
    });

    it('5. Executes iterative closed-loop refinement until convergence criteria are met', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-hero-loop',
        websiteId: 'web-loop',
        pageId: 'page-loop',
        title: 'Closed Loop Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        animations: [{ kind: 'gsap_timeline', timelineId: 'tl', durationMs: 1200, totalDurationMs: 1200, repeat: 0, yoyo: false, tweens: [] }],
      });

      const initialPlan = PlanBuilder.buildPlan(fir);
      const optResult = ClosedLoopRefiner.refineSection(fir, initialPlan, 3);

      expect(optResult.converged).toBe(true);
      expect(optResult.finalSsim).toBeGreaterThanOrEqual(0.98);
      expect(optResult.finalMotionFidelity).toBeGreaterThanOrEqual(0.98);
      expect(optResult.iterationHistory.length).toBeGreaterThan(0);
      expect(optResult.optimizedTsxCode.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // 5. 10-Pillar Engineering Reports & Expanded Library Catalogs
  // -------------------------------------------------------------------------
  describe('5. 10-Pillar Engineering Reports & Expanded Library', () => {
    it('6. Generates all 10 canonical markdown engineering reports', () => {
      const siteDir = path.join(testWorkspaceDir, 'site_reports_test');
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-rep',
        websiteId: 'brand-rep',
        pageId: 'p-rep',
        title: 'Report Hero',
        sourceUrl: 'https://brand-rep.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
      });

      const passport = SectionPassportEngine.createPassport(fir, PlanBuilder.buildPlan(fir));
      const reports = EngineeringReportGenerator.generateAllReports(siteDir, {
        url: 'https://brand-rep.com',
        domain: 'brand_rep',
        totalSections: 1,
        passports: [passport],
        intelligenceReports: [],
        certificationScores: {
          visual: 0.98,
          motion: 0.97,
          behavior: 1.0,
          typography: 0.99,
          layout: 0.99,
          overall: 98.2,
          disposition: 'COPY_USE_CERTIFIED',
        },
      });

      expect(Object.keys(reports).length).toBe(10);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'WEBSITE_ANALYSIS.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'MOTION_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'TYPOGRAPHY_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'ASSET_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'ANTIGRAVITY_BRIEF.md'))).toBe(true);
    });

    it('7. Populates expanded design intelligence library structure', () => {
      const libDir = path.join(testWorkspaceDir, 'expanded_library');
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-lib-01',
        websiteId: 'brand-lib',
        pageId: 'p-lib',
        title: 'Library Hero',
        sourceUrl: 'https://brand-lib.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
      });

      const passport = SectionPassportEngine.createPassport(fir, PlanBuilder.buildPlan(fir));
      const catalogs = MultiDimensionalCataloger.updateCatalogs([passport], libDir);

      expect(catalogs.totalComponents).toBe(1);
      expect(fs.existsSync(path.join(libDir, 'motion-fingerprints'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'layouts'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'provenance'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Live Extraction with Closed-Loop Autonomous Refinement
  // -------------------------------------------------------------------------
  describe('6. Real-World Live Extraction with Closed-Loop Refinement', () => {
    it('8. Executes live autonomous reverse-engineering with closed-loop optimization', async () => {
      const rootDataDir = path.join(testWorkspaceDir, 'workspace-data');
      const batchReport = await AutonomousPipeline.executeBatch({
        urls: [liveServer.url],
        workspaceDataDir: rootDataDir,
        timeoutMs: 15000,
      });

      expect(batchReport.totalWebsites).toBe(1);
      expect(batchReport.totalSectionsDiscovered).toBeGreaterThanOrEqual(4);
      expect(batchReport.totalCertified).toBeGreaterThanOrEqual(3);

      const parsedUrl = new URL(liveServer.url);
      const domain = parsedUrl.hostname.replace(/[^a-zA-Z0-9]/g, '_');
      const siteDir = path.join(rootDataDir, 'sites', domain);

      // Verify 10 Engineering Reports exist
      expect(fs.existsSync(path.join(siteDir, 'reports', 'WEBSITE_ANALYSIS.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'SECTION_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'MOTION_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'TYPOGRAPHY_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'ASSET_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'STORYTELLING_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'RESPONSIVE_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'FAILURE_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'CERTIFICATION_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'ANTIGRAVITY_BRIEF.md'))).toBe(true);
    }, 45000);
  });
});
