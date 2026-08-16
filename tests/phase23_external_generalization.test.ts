import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { NavigationForensics } from '../src/engine/browser/navigationForensics';
import { ExternalCorpusManager } from '../src/engine/externalCorpus/externalCorpusManager';
import { ProvenanceVerifier } from '../src/engine/acceptance/provenanceVerifier';
import { IndependentCertificationHarness } from '../src/engine/acceptance/independentCertificationHarness';
import { DeterminismAuditor } from '../src/engine/acceptance/determinismAuditor';
import { ExternalFailureTaxonomy } from '../src/engine/workbench/externalFailureTaxonomy';
import { ExternalReportGenerator } from '../src/engine/workbench/externalReportGenerator';
import { ExternalSiteExtractor } from '../src/engine/workbench/externalSiteExtractor';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import { PlanBuilder } from '../src/engine/generation/synthesisPlan';
import { LiveSiteServer } from './fixtures/liveSiteServer';

describe('Phase 23 — External Production-Site Generalization, Independent Certification & Provenance Integrity Suite', () => {
  const liveServer = new LiveSiteServer(4204);
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase23_external');

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
  // 1. Navigation Forensics & Redirect Preservation
  // -------------------------------------------------------------------------
  describe('1. Navigation Forensics & Redirect Preservation', () => {
    it('1. Preserves requested URL, final canonical URL, and complete redirect chain without silent replacement', () => {
      const requested = 'https://www.dzinr.in/';
      const finalUrl = 'https://dzinrstudio.com/';
      const hops = [
        { hopIndex: 1, url: 'https://www.dzinr.in/', statusCode: 301, timestamp: new Date().toISOString() },
        { hopIndex: 2, url: 'https://dzinrstudio.com/', statusCode: 200, timestamp: new Date().toISOString() },
      ];

      const record = NavigationForensics.createRecord(requested, finalUrl, hops, 420);
      expect(record.requestedUrl).toBe('https://www.dzinr.in/');
      expect(record.finalUrl).toBe('https://dzinrstudio.com/');
      expect(record.hasRedirect).toBe(true);
      expect(record.redirectCount).toBe(2);
      expect(record.sha256Hash.length).toBe(64);
    });

    it('2. Records direct response with hasRedirect false when requested URL matches final URL', () => {
      const url = 'https://dzinrstudio.com/';
      const record = NavigationForensics.createRecord(url, url, [], 210);
      expect(record.hasRedirect).toBe(false);
      expect(record.redirectCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // 2. External Corpus Manifest & Dynamic Route Discovery
  // -------------------------------------------------------------------------
  describe('2. External Corpus Management & Dynamic Route Discovery', () => {
    it('3. Initializes external corpus directory tree and persists manifest, redirects, and status', () => {
      const navRecord = NavigationForensics.createRecord('https://www.dzinr.in/', 'https://dzinrstudio.com/', [], 100);
      const manifest = ExternalCorpusManager.initializeCorpus('dzinr_test', navRecord, testWorkspaceDir);

      expect(manifest.siteId).toBe('dzinr_test');
      expect(fs.existsSync(path.join(testWorkspaceDir, 'dzinr_test', 'manifest.json'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'dzinr_test', 'discovered-routes.json'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'dzinr_test', 'redirects.json'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'dzinr_test', 'target-status.json'))).toBe(true);
    });

    it('4. Dynamically discovers internal links from live DOM HTML without hardcoding', () => {
      const html = `
        <nav>
          <a href="/work">Work</a>
          <a href="/services">Services</a>
          <a href="/work/prink">Prink Project</a>
          <a href="https://external-social.com/dzinr">Instagram</a>
          <a href="#contact">Contact</a>
        </nav>
      `;

      const routes = ExternalCorpusManager.discoverRoutesFromHtml(html, 'https://dzinrstudio.com/');
      expect(routes).toContain('/work');
      expect(routes).toContain('/services');
      expect(routes).toContain('/work/prink');
      expect(routes).not.toContain('https://external-social.com/dzinr');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Cryptographic Provenance Chain & Tamper Detection
  // -------------------------------------------------------------------------
  describe('3. Cryptographic Provenance Integrity', () => {
    it('5. Builds and verifies unbroken cryptographic provenance chain from SOURCE to CERTIFICATION', () => {
      const srcHtml = '<html><body><section id="hero">Hero</section></body></html>';
      const firContent = '{"sectionId": "sec-01", "category": "Hero"}';

      const srcNode = ProvenanceVerifier.createNode('SOURCE', 'src_01', srcHtml);
      const firNode = ProvenanceVerifier.createNode('FIR', 'fir_01', firContent, [srcNode.artifactId]);

      const artifactMap = {
        src_01: srcHtml,
        fir_01: firContent,
      };

      const audit = ProvenanceVerifier.auditChain([srcNode, firNode], artifactMap);
      expect(audit.valid).toBe(true);
      expect(audit.unbrokenChain).toBe(true);
      expect(audit.tamperedNodes.length).toBe(0);
    });

    it('6. Detects unauthorized tampering and immediately rejects certification', () => {
      const srcHtml = '<html><body>Original Source</body></html>';
      const node = ProvenanceVerifier.createNode('SOURCE', 'src_tamper', srcHtml);

      // Tampered content
      const tamperedMap = {
        src_tamper: '<html><body>Tampered Mod Source</body></html>',
      };

      const audit = ProvenanceVerifier.auditChain([node], tamperedMap);
      expect(audit.valid).toBe(false);
      expect(audit.unbrokenChain).toBe(false);
      expect(audit.tamperedNodes.length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Independent Certification & Hard Failure Gates
  // -------------------------------------------------------------------------
  describe('4. Independent Certification Harness & Hard Failure Gates', () => {
    it('7. Calculates independent multi-dimensional score and issues COPY_USE_CERTIFIED for high fidelity', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-cert-01',
        websiteId: 'site-a',
        pageId: 'p1',
        title: 'Cert Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const scorecard = IndependentCertificationHarness.auditCertification(
        fir,
        'CertHeroSection',
        {
          visualSimilarity: 0.98,
          motionSimilarity: 0.97,
          behaviorSimilarity: 1.0,
          layoutSimilarity: 0.99,
          typographySimilarity: 0.99,
          responsiveSimilarity: 0.98,
          assetSimilarity: 0.98,
        },
        {}
      );

      expect(scorecard.isOptimizerIndependent).toBe(true);
      expect(scorecard.hardGateBlocked).toBe(false);
      expect(scorecard.disposition).toBe('COPY_USE_CERTIFIED');
      expect(scorecard.certifiedScore).toBeGreaterThanOrEqual(85.0);
    });

    it('8. Hard Gate Override: Replay crash forces COPY_USE_FAILED regardless of high raw average', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-crash-01',
        websiteId: 'site-a',
        pageId: 'p1',
        title: 'Crash Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const scorecard = IndependentCertificationHarness.auditCertification(
        fir,
        'CrashHeroSection',
        {
          visualSimilarity: 0.99,
          motionSimilarity: 0.99,
          behaviorSimilarity: 0.99,
          layoutSimilarity: 0.99,
          typographySimilarity: 0.99,
          responsiveSimilarity: 0.99,
          assetSimilarity: 0.99,
        },
        { hasReplayCrash: true }
      );

      expect(scorecard.hardGateBlocked).toBe(true);
      expect(scorecard.disposition).toBe('COPY_USE_FAILED');
      expect(scorecard.criticalGates.some((g) => g.gateName === 'REPLAY_CRASH_GATE')).toBe(true);
    });

    it('9. Hard Gate Override: Missing primary asset forces certification failure', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-asset-fail',
        websiteId: 'site-a',
        pageId: 'p1',
        title: 'Missing Asset Section',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const scorecard = IndependentCertificationHarness.auditCertification(
        fir,
        'HeroSection',
        {
          visualSimilarity: 0.95,
          motionSimilarity: 0.95,
          behaviorSimilarity: 0.95,
          layoutSimilarity: 0.95,
          typographySimilarity: 0.95,
          responsiveSimilarity: 0.95,
          assetSimilarity: 0.3,
        },
        { missingPrimaryAsset: true }
      );

      expect(scorecard.hardGateBlocked).toBe(true);
      expect(scorecard.disposition).toBe('COPY_USE_FAILED');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Determinism & Reproducibility Auditor
  // -------------------------------------------------------------------------
  describe('5. Determinism & Reproducibility Auditor', () => {
    it('10. Classifies identical runs as DETERMINISTIC', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-det-01',
        websiteId: 'site-d',
        pageId: 'p1',
        title: 'Det Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const res = DeterminismAuditor.auditRuns('https://example.com', [fir], [fir]);
      expect(res.classification).toBe('DETERMINISTIC');
      expect(res.sectionCountMatch).toBe(true);
      expect(res.sectionOrderMatch).toBe(true);
      expect(res.firHashMatchRatio).toBe(1.0);
      expect(res.geometryMaxDeltaPx).toBe(0);
    });

    it('11. Classifies minor coordinate shifts (< 2px) as BOUNDED_VARIANCE', () => {
      const firA = FIRAssembler.assemble({
        sectionId: 'sec-det-02',
        websiteId: 'site-d',
        pageId: 'p1',
        title: 'Det Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const firB = FIRAssembler.assemble({
        sectionId: 'sec-det-02',
        websiteId: 'site-d',
        pageId: 'p1',
        title: 'Det Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 801, viewportRatio: 1 }, // 1px shift
      });

      const res = DeterminismAuditor.auditRuns('https://example.com', [firA], [firB]);
      expect(res.classification).toBe('BOUNDED_VARIANCE');
      expect(res.geometryMaxDeltaPx).toBe(1.0);
    });
  });

  // -------------------------------------------------------------------------
  // 6. External Failure Taxonomy & Report Generation
  // -------------------------------------------------------------------------
  describe('6. External Failure Taxonomy & 6 Canonical Reports', () => {
    it('12. Emits structured failure events conforming to the 22-category taxonomy', () => {
      const event = ExternalFailureTaxonomy.createEvent(
        'OBSERVATION',
        'WEBGL_OBSERVATION_LIMIT',
        'WARNING',
        'https://dzinrstudio.com/',
        'Custom Shader detected on canvas element #gl-bg',
        'Accessible WebGL context stream',
        'Canvas buffer read-only',
        'Synthesize Tier-4 Canvas Fallback shader component',
        { recoverable: true }
      );

      expect(event.category).toBe('WEBGL_OBSERVATION_LIMIT');
      expect(event.severity).toBe('WARNING');
      expect(event.recoverable).toBe(true);
    });

    it('13. Generates all 6 Phase 23 canonical markdown reports', () => {
      const siteDir = path.join(testWorkspaceDir, 'dzinr_reports_test');
      const navRecord = NavigationForensics.createRecord('https://www.dzinr.in/', 'https://dzinrstudio.com/', [], 150);

      const fir = FIRAssembler.assemble({
        sectionId: 'sec-rep-01',
        websiteId: 'dzinr_test',
        pageId: 'p1',
        title: 'Hero',
        sourceUrl: 'https://dzinrstudio.com/',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const scorecard = IndependentCertificationHarness.auditCertification(fir, 'HeroSection', {
        visualSimilarity: 0.98,
        motionSimilarity: 0.97,
        behaviorSimilarity: 1.0,
        layoutSimilarity: 0.99,
        typographySimilarity: 0.985,
        responsiveSimilarity: 0.99,
        assetSimilarity: 0.98,
      });

      const provNode = ProvenanceVerifier.createNode('SOURCE', 'src_root', '<html></html>');
      const provAudit = ProvenanceVerifier.auditChain([provNode], { src_root: '<html></html>' });
      const determinism = DeterminismAuditor.auditRuns('https://dzinrstudio.com/', [fir], [fir]);

      const reports = ExternalReportGenerator.generateAllReports(siteDir, {
        siteId: 'dzinr_test',
        requestedUrl: 'https://www.dzinr.in/',
        finalUrl: 'https://dzinrstudio.com/',
        navRecord,
        discoveredRoutes: ['/work', '/services'],
        totalSections: 1,
        scorecards: [scorecard],
        provenanceAudit: provAudit,
        determinismResult: determinism,
        failureEvents: [],
        generalizationVerdict: 'VERIFIED',
      });

      expect(Object.keys(reports).length).toBe(6);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'EXTERNAL_SITE_ANALYSIS.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'PROVENANCE_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'DETERMINISM_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'CERTIFICATION_AUDIT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'ADVERSARIAL_FAILURE_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(siteDir, 'reports', 'GENERALIZATION_REPORT.md'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Full Live External Extraction & Generalization Pipeline
  // -------------------------------------------------------------------------
  describe('7. Live External Extraction & Generalization Pipeline', () => {
    it('14. Executes full production external-site forensic observation and independent certification', async () => {
      const result = await ExternalSiteExtractor.extractExternalSite({
        requestedUrl: liveServer.url,
        siteId: 'live_pilot_test',
        workspaceBaseDir: path.join(testWorkspaceDir, 'external-corpus'),
        timeoutMs: 15000,
      });

      expect(result.siteId).toBe('live_pilot_test');
      expect(result.totalSections).toBe(5);
      expect(result.firs.length).toBe(5);
      expect(result.passports.length).toBe(5);
      expect(result.scorecards.length).toBe(5);
      expect(result.scorecards.every((s) => s.isOptimizerIndependent)).toBe(true);
      expect(result.generalizationVerdict).toBe('VERIFIED');
      expect(result.reportsGenerated.length).toBe(6);
    }, 45000);

    it('15. Discards non-navigable protocols (mailto, tel, javascript) during dynamic link discovery', () => {
      const html = `
        <div>
          <a href="mailto:hello@dzinr.in">Email</a>
          <a href="tel:+123456789">Call</a>
          <a href="javascript:void(0)">Action</a>
          <a href="/work/cars-daily">Cars Daily</a>
        </div>
      `;
      const routes = ExternalCorpusManager.discoverRoutesFromHtml(html, 'https://dzinrstudio.com/');
      expect(routes).toContain('/work/cars-daily');
      expect(routes.length).toBe(1);
    });

    it('16. Provenance node generation tracks parent lineage through DAG', () => {
      const nodeA = ProvenanceVerifier.createNode('SOURCE', 'src_root', '<html></html>');
      const nodeB = ProvenanceVerifier.createNode('EVIDENCE', 'ev_01', '{"dom": {}}', [nodeA.artifactId]);
      const nodeC = ProvenanceVerifier.createNode('FIR', 'fir_01', '{"category": "Hero"}', [nodeB.artifactId]);

      expect(nodeC.parentArtifactIds).toContain('ev_01');
      expect(nodeB.parentArtifactIds).toContain('src_root');
    });

    it('17. Classifies section category mismatch across runs as NON_DETERMINISTIC', () => {
      const firA = FIRAssembler.assemble({
        sectionId: 'sec-1',
        websiteId: 'w1',
        pageId: 'p1',
        title: 'Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const firB = FIRAssembler.assemble({
        sectionId: 'sec-1',
        websiteId: 'w1',
        pageId: 'p1',
        title: 'Story',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Story',
        domSelector: '#story',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const audit = DeterminismAuditor.auditRuns('https://example.com', [firA], [firB]);
      expect(audit.classification).toBe('NON_DETERMINISTIC');
      expect(audit.sectionOrderMatch).toBe(false);
    });

    it('18. Hard Gate Override: Catastrophic responsive reflow failure blocks certification', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-resp-fail',
        websiteId: 'w1',
        pageId: 'p1',
        title: 'Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: 'Hero',
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const scorecard = IndependentCertificationHarness.auditCertification(
        fir,
        'HeroSection',
        {
          visualSimilarity: 0.98,
          motionSimilarity: 0.98,
          behaviorSimilarity: 0.98,
          layoutSimilarity: 0.98,
          typographySimilarity: 0.98,
          responsiveSimilarity: 0.45,
          assetSimilarity: 0.98,
        },
        { catastrophicResponsiveBreak: true }
      );

      expect(scorecard.hardGateBlocked).toBe(true);
      expect(scorecard.disposition).toBe('COPY_USE_FAILED');
      expect(scorecard.criticalGates.some((g) => g.gateName === 'RESPONSIVE_INTEGRITY_GATE')).toBe(true);
    });

    it('19. Emits FONT_LOADING_FAILURE and CROSS_ORIGIN_FAILURE in taxonomy', () => {
      const fontEv = ExternalFailureTaxonomy.createEvent(
        'OBSERVATION',
        'FONT_LOADING_FAILURE',
        'WARNING',
        'https://dzinrstudio.com/',
        'Custom WOFF2 font failed CORS handshake',
        'Resolved custom font metric',
        'System font fallback substituted',
        'Record typography uncertainty in TYPOGRAPHY_REPORT.md'
      );

      const crossEv = ExternalFailureTaxonomy.createEvent(
        'OBSERVATION',
        'CROSS_ORIGIN_FAILURE',
        'INFO',
        'https://dzinrstudio.com/',
        'Iframe cross-origin boundary blocked DOM traversal',
        'Traversable DOM tree',
        'Opaque iframe element',
        'Record boundary limitation in failure-report.json'
      );

      expect(fontEv.category).toBe('FONT_LOADING_FAILURE');
      expect(crossEv.category).toBe('CROSS_ORIGIN_FAILURE');
    });

    it('20. Generalization verdict accurately reflects NOT_VERIFIED when scorecards fail', () => {
      const siteDir = path.join(testWorkspaceDir, 'failed_verdict_test');
      const navRecord = NavigationForensics.createRecord('https://unreachable.site/', 'https://unreachable.site/', [], 500);

      const failedScorecard: any = {
        sectionId: 'sec-fail',
        componentName: 'FailedSection',
        isOptimizerIndependent: true,
        rawAverageScore: 42.0,
        hardGateBlocked: true,
        disposition: 'COPY_USE_FAILED',
      };

      const provAudit = {
        valid: false,
        totalNodes: 1,
        unbrokenChain: false,
        tamperedNodes: ['tampered_node'],
        chainHistory: [],
        auditedAt: new Date().toISOString(),
      };

      const determinism = {
        targetUrl: 'https://unreachable.site/',
        classification: 'NON_DETERMINISTIC' as const,
        runCount: 2,
        sectionCountMatch: false,
        sectionOrderMatch: false,
        firHashMatchRatio: 0.0,
        geometryMaxDeltaPx: 100,
        varianceDetails: ['Section count mismatch'],
        auditedAt: new Date().toISOString(),
      };

      const reports = ExternalReportGenerator.generateAllReports(siteDir, {
        siteId: 'unreachable_test',
        requestedUrl: 'https://unreachable.site/',
        finalUrl: 'https://unreachable.site/',
        navRecord,
        discoveredRoutes: [],
        totalSections: 1,
        scorecards: [failedScorecard],
        provenanceAudit: provAudit,
        determinismResult: determinism,
        failureEvents: [],
        generalizationVerdict: 'NOT_VERIFIED',
      });

      expect(reports['GENERALIZATION_REPORT.md']).toContain('# `NOT_VERIFIED`');
    });
  });
});
