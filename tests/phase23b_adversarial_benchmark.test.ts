import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ArchetypeCorpusRegistry } from '../src/engine/benchmark/archetypeCorpusRegistry';
import { BoundaryClassifier } from '../src/engine/benchmark/boundaryClassifier';
import { AdversarialBenchmarkHarness } from '../src/engine/benchmark/adversarialBenchmarkHarness';
import { BenchmarkReportGenerator } from '../src/engine/benchmark/benchmarkReportGenerator';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';

describe('Phase 23B — Adversarial Corpus Expansion & Failure Diversity Benchmark Suite', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase23b_benchmark');

  beforeAll(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspaceDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 1. Archetype Corpus Specifications
  // -------------------------------------------------------------------------
  describe('1. Archetype Corpus Registry', () => {
    it('1. Loads all 12 architectural archetypes with distinct risk factors', () => {
      const archetypes = ArchetypeCorpusRegistry.ARCHETYPES;
      expect(archetypes.length).toBe(12);

      const ids = archetypes.map((a) => a.archetypeId);
      expect(ids).toContain('01_NEXTJS_REACT_HYDRATION');
      expect(ids).toContain('02_GSAP_SCROLLTRIGGER_PIN');
      expect(ids).toContain('03_THREEJS_WEBGL_SHADER');
      expect(ids).toContain('04_CANVAS_2D_INTERACTIVE');
      expect(ids).toContain('05_FULLSCREEN_BG_VIDEO');
      expect(ids).toContain('06_LENIS_SMOOTH_SCROLL');
      expect(ids).toContain('07_HORIZONTAL_SCROLL');
      expect(ids).toContain('08_ART_DIRECTED_RESPONSIVE');
      expect(ids).toContain('09_SPA_HISTORY_NAVIGATION');
      expect(ids).toContain('10_LAZY_INFINITE_SCROLL');
      expect(ids).toContain('11_VARIABLE_FONTS_TYPOGRAPHY');
      expect(ids).toContain('12_NON_DETERMINISTIC_RANDOM');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Boundary Classification & Hard Failure Gates
  // -------------------------------------------------------------------------
  describe('2. Boundary Classification & Hard Failure Gates', () => {
    it('2. Fully Reconstructable Archetypes classify as COPY_USE_CERTIFIED', () => {
      const nextjs = ArchetypeCorpusRegistry.getArchetype('01_NEXTJS_REACT_HYDRATION')!;
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-nextjs',
        websiteId: 'web-nextjs',
        pageId: 'p1',
        title: nextjs.name,
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: nextjs.category,
        domSelector: '#hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const res = BoundaryClassifier.classifyBoundary(fir, nextjs);
      expect(res.disposition).toBe('COPY_USE_CERTIFIED');
      expect(res.isCorrectlyClassified).toBe(true);
      expect(res.hardGateTriggered).toBeNull();
    });

    it('3. WebGL Canvas Shaders trigger CANVAS_PROCEDURAL_FALLBACK_GATE and classify as COPY_USE_PARTIAL', () => {
      const webgl = ArchetypeCorpusRegistry.getArchetype('03_THREEJS_WEBGL_SHADER')!;
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-webgl',
        websiteId: 'web-webgl',
        pageId: 'p1',
        title: webgl.name,
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: webgl.category,
        domSelector: '#webgl-hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        canvas: { count: 1, contexts: ['webgl2'] },
      });

      const res = BoundaryClassifier.classifyBoundary(fir, webgl);
      expect(res.disposition).toBe('COPY_USE_PARTIAL');
      expect(res.hardGateTriggered).toBe('CANVAS_PROCEDURAL_FALLBACK_GATE');
      expect(res.isCorrectlyClassified).toBe(true);
    });

    it('4. Fullscreen Background Video triggers MEDIA_STREAM_FALLBACK_GATE and classifies as COPY_USE_PARTIAL', () => {
      const video = ArchetypeCorpusRegistry.getArchetype('05_FULLSCREEN_BG_VIDEO')!;
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-video',
        websiteId: 'web-video',
        pageId: 'p1',
        title: video.name,
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: video.category,
        domSelector: '#video-hero',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
      });

      const res = BoundaryClassifier.classifyBoundary(fir, video);
      expect(res.disposition).toBe('COPY_USE_PARTIAL');
      expect(res.hardGateTriggered).toBe('MEDIA_STREAM_FALLBACK_GATE');
      expect(res.isCorrectlyClassified).toBe(true);
    });

    it('5. Non-Deterministic Generative Motion triggers NON_DETERMINISTIC_RUNTIME_GATE and rejects as COPY_USE_FAILED', () => {
      const random = ArchetypeCorpusRegistry.getArchetype('12_NON_DETERMINISTIC_RANDOM')!;
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-random',
        websiteId: 'web-random',
        pageId: 'p1',
        title: random.name,
        sourceUrl: 'https://example.com',
        pagePath: '/',
        category: random.category,
        domSelector: '#generative-particles',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        canvas: { count: 1, contexts: ['2d'] },
      });

      const res = BoundaryClassifier.classifyBoundary(fir, random, true);
      expect(res.disposition).toBe('COPY_USE_FAILED');
      expect(res.determinismClassification).toBe('NON_DETERMINISTIC');
      expect(res.hardGateTriggered).toBe('NON_DETERMINISTIC_RUNTIME_GATE');
      expect(res.isCorrectlyClassified).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Full Adversarial Benchmark Execution
  // -------------------------------------------------------------------------
  describe('3. Adversarial Benchmark Harness Execution', () => {
    it('6. Executes adversarial benchmark across all 12 archetypes with 100% classification accuracy', () => {
      const summary = AdversarialBenchmarkHarness.runBenchmark(testWorkspaceDir);

      expect(summary.totalArchetypesTested).toBe(12);
      expect(summary.correctlyClassifiedCount).toBe(12);
      expect(summary.accuracyPercentage).toBe(100.0);
      expect(summary.falsePositiveCertifications).toBe(0);
      expect(summary.falseNegativeFailures).toBe(0);
      expect(summary.provenanceViolations).toBe(0);
      expect(summary.firMutations).toBe(0);

      // Verify Dispositions
      expect(summary.totalCertified).toBe(7); // Next.js, ScrollTrigger, Lenis, Horizontal, Responsive, SPA, Variable Fonts
      expect(summary.totalPartial).toBe(4);   // Three.js, Canvas 2D, BG Video, Lazy Feed
      expect(summary.totalFailed).toBe(1);    // Non-deterministic random motion
    });

    it('7. Emits benchmark-summary.json and corpus-manifest.json in target directory', () => {
      expect(fs.existsSync(path.join(testWorkspaceDir, 'benchmark-summary.json'))).toBe(true);
      const summary = JSON.parse(fs.readFileSync(path.join(testWorkspaceDir, 'benchmark-summary.json'), 'utf-8'));
      expect(summary.totalArchetypesTested).toBe(12);
    });

    it('8. Generates all 7 Phase 23B canonical markdown benchmark reports', () => {
      const summary = AdversarialBenchmarkHarness.runBenchmark(testWorkspaceDir);
      const reports = BenchmarkReportGenerator.generateAllReports(testWorkspaceDir, summary);

      expect(Object.keys(reports).length).toBe(7);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'ADVERSARIAL_BENCHMARK.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'FAILURE_DIVERSITY_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'DETERMINISM_BENCHMARK.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'CERTIFICATION_BENCHMARK.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'PROVENANCE_INTEGRITY_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'GENERALIZATION_BOUNDARY.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'PHASE23B_FINAL_VERDICT.md'))).toBe(true);

      expect(reports['PHASE23B_FINAL_VERDICT.md']).toContain('# **`VERIFIED`**');
    });
  });
});
