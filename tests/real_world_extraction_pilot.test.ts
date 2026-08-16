import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LiveSiteServer } from './fixtures/liveSiteServer';
import { RealSiteExtractor } from '../src/engine/workbench/realSiteExtractor';
import { LibraryIndexer } from '../src/engine/workbench/libraryIndexer';
import { FailureReporter } from '../src/engine/workbench/failureReporter';
import { AnimationCheckpointEngine } from '../src/engine/extraction/animationCheckpointEngine';

describe('Phase 19 Acceptance — Real-World Live Website Extraction Pilot Suite', () => {
  const liveServer = new LiveSiteServer();
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_real_world_pilot');

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
  // 1. Live Chromium Browser Extraction E2E
  // -------------------------------------------------------------------------
  describe('1. Live Chromium Browser Extraction E2E', () => {
    it('1. Executes real Chromium browser navigation and extracts all sections from live server', async () => {
      const outputDir = path.join(testWorkspaceDir, 'live_pilot_run');
      const result = await RealSiteExtractor.extractRealSite({
        url: liveServer.url,
        outputDirectory: outputDir,
        timeoutMs: 15000,
      });

      expect(result.status === 'SUCCESS' || result.status === 'PARTIAL').toBe(true);
      expect(result.totalSections).toBeGreaterThanOrEqual(4);
      expect(result.componentsGenerated).toBeGreaterThanOrEqual(4);
      expect(result.certifiedCount).toBeGreaterThanOrEqual(3);

      // Verify page-report.json
      const pageReportPath = path.join(outputDir, 'page-report.json');
      expect(fs.existsSync(pageReportPath)).toBe(true);
      const pageReport = JSON.parse(fs.readFileSync(pageReportPath, 'utf-8'));
      expect(pageReport.totalSections).toBe(result.totalSections);
      expect(pageReport.semanticLandmarkCount).toBeGreaterThan(0);

      // Verify sections.json narrative
      const sectionsPath = path.join(outputDir, 'sections.json');
      expect(fs.existsSync(sectionsPath)).toBe(true);
      const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf-8'));
      expect(sections.length).toBe(result.totalSections);
      expect(sections[0].sequenceIndex).toBe(1);

      // Verify FIR JSON files generated
      const firDir = path.join(outputDir, 'fir', 'sections');
      const firFiles = fs.readdirSync(firDir);
      expect(firFiles.length).toBe(result.totalSections);
      expect(firFiles.some((f) => f.includes('fir.json'))).toBe(true);

      // Verify React component packages
      const compDir = path.join(outputDir, 'components');
      const compFolders = fs.readdirSync(compDir);
      expect(compFolders.length).toBe(result.componentsGenerated);

      // Verify certification.json
      const certPath = path.join(outputDir, 'certification', 'certification.json');
      expect(fs.existsSync(certPath)).toBe(true);
      const cert = JSON.parse(fs.readFileSync(certPath, 'utf-8'));
      expect(cert.visualSimilarity).toBeGreaterThan(0.90);
      expect(cert.motionFidelity).toBeGreaterThan(0.90);
      expect(cert.behaviorFidelity).toBeGreaterThan(0.85);

      // Verify Library Indexer was populated
      const catalog = LibraryIndexer.readCatalog(outputDir);
      expect(catalog.totalComponents).toBeGreaterThan(0);
    }, 45000);
  });

  // -------------------------------------------------------------------------
  // 2. Animation Checkpoints & Multi-State Capture
  // -------------------------------------------------------------------------
  describe('2. Animation Checkpoint Engine', () => {
    it('2. Generates multi-state animation timeline checkpoints (INITIAL, 25%, 50%, 75%, FINAL)', () => {
      const report = AnimationCheckpointEngine.createTimelineCheckpoints('tl-hero', 'sec-hero', 1000);
      expect(report.totalCheckpoints).toBe(5);
      expect(report.checkpoints[0].stateName).toBe('INITIAL');
      expect(report.checkpoints[0].progressRatio).toBe(0.0);
      expect(report.checkpoints[2].stateName).toBe('50%');
      expect(report.checkpoints[4].stateName).toBe('FINAL');
      expect(report.checkpoints[4].progressRatio).toBe(1.0);
    });

    it('3. Generates hover and click interaction state checkpoints', () => {
      const hoverReport = AnimationCheckpointEngine.createInteractionCheckpoints('int-btn', 'sec-hero', 'HOVER');
      expect(hoverReport.checkpoints.some((c) => c.stateName === 'POINTER_ENTER')).toBe(true);
      expect(hoverReport.checkpoints.some((c) => c.stateName === 'RECOVERY')).toBe(true);

      const clickReport = AnimationCheckpointEngine.createInteractionCheckpoints('int-faq', 'sec-faq', 'CLICK');
      expect(clickReport.checkpoints.some((c) => c.stateName === 'TRIGGER')).toBe(true);
      expect(clickReport.checkpoints.some((c) => c.stateName === 'AFTER')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Failure Taxonomy & Reporting
  // -------------------------------------------------------------------------
  describe('3. Failure Taxonomy & Reporting', () => {
    it('4. Generates structured failure-report.json on navigation or observation errors', () => {
      const report = FailureReporter.createReport({
        url: 'http://invalid-non-existent-domain.xyz',
        stage: 'OBSERVATION_FAILURE',
        failureType: 'DNS_RESOLUTION_ERROR',
        error: 'net::ERR_NAME_NOT_RESOLVED',
        evidenceAvailable: [],
        missingEvidence: ['DOM snapshot', 'layout geometry'],
        recoverability: 'AUTO_RECOVERABLE',
        recommendedAction: 'Verify target URL DNS configuration.',
      });

      expect(report.stage).toBe('OBSERVATION_FAILURE');
      expect(report.failureType).toBe('DNS_RESOLUTION_ERROR');
      expect(report.missingEvidence.length).toBe(2);
      expect(report.recoverability).toBe('AUTO_RECOVERABLE');
    });
  });
});
