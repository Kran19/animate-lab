import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  DOMEvidenceCollector,
  StyleEvidenceCollector,
  AssetEvidenceCollector,
  MotionEvidenceCollector,
  InteractionEvidenceCollector,
  CanvasEvidenceCollector,
} from '../src/engine/extraction/collectors';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import {
  GOLDEN_CORPUS_FIXTURES,
  GoldenCorpusRunner,
  EvidenceAssertionEngine,
} from '../src/engine/benchmark/corpus';

describe('Phase 17 — Runtime Evidence Hardening & Golden Corpus Suite', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_corpus_phase17');

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
  // 1. Isolated Evidence Collectors (Zero Shared State Mutation)
  // -------------------------------------------------------------------------
  describe('1. Isolated Evidence Collectors', () => {
    it('1. DOMEvidenceCollector extracts sanitized DOM subtree without mutating caller input', () => {
      const input = {
        sectionId: 'sec-dom-01',
        domSelector: '#test-dom',
        domTagName: 'SECTION',
        rawHtml: '<section id="test-dom"><script>alert("hack")</script><h1>Title</h1></section>',
      };
      const dom = DOMEvidenceCollector.collect(input);

      expect(dom.rawHtmlSnapshot).toContain('<script>');
      expect(dom.sanitizedHtmlSnapshot).not.toContain('<script>');
      expect(dom.sanitizedHtmlSnapshot).toContain('<h1>Title</h1>');
      expect(dom.nodeCount).toBeGreaterThan(0);
      expect(input.rawHtml).toContain('<script>'); // Caller object untouched
    });

    it('2. StyleEvidenceCollector sorts custom properties and computed declarations deterministically', () => {
      const styles = StyleEvidenceCollector.collect({
        cssVariables: { '--color-primary': '#00ffcc', '--bg-main': '#111111' },
        fontFamilies: ['Inter', 'Monument Extended', 'Inter'], // Duplicate should be deduplicated
        computedStyles: {
          '.title': { color: '#ffffff', 'font-size': '32px' },
        },
      });

      expect(Object.keys(styles.cssVariableDeclarations)).toEqual(['--bg-main', '--color-primary']);
      expect(styles.fontFamilyDeclarations).toEqual(['Inter', 'Monument Extended']);
      expect(styles.nodeStyles['.title'].properties['color'].value).toBe('#ffffff');
    });

    it('3. AssetEvidenceCollector deduplicates assets by SHA-256 and records provenance', () => {
      const assets = AssetEvidenceCollector.collect([
        {
          id: 'asset-1',
          type: 'image',
          sourceUrl: 'https://example.com/img1.webp',
          localPath: 'assets/img1.webp',
          sha256: 'hash-abc',
          mimeType: 'image/webp',
          discoveredBy: 'img_src',
        },
        {
          id: 'asset-duplicate',
          type: 'image',
          sourceUrl: 'https://example.com/img1.webp',
          localPath: 'assets/img1.webp',
          sha256: 'hash-abc', // Duplicate hash
          mimeType: 'image/webp',
          discoveredBy: 'css_background',
        },
      ]);

      expect(assets.totalAssetsCount).toBe(1);
      expect(assets.assets[0].sha256).toBe('hash-abc');
      expect(assets.assets[0].discoveredBy).toBe('img_src');
    });

    it('4. MotionEvidenceCollector isolates CSS keyframes and GSAP traces', () => {
      const motion = MotionEvidenceCollector.collect({
        traces: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-1',
            durationMs: 1000,
            totalDurationMs: 1000,
            repeat: 0,
            yoyo: false,
            tweens: [{ targetSelector: '#title', propertiesTo: { y: 0 }, duration: 1.0 }],
          },
        ],
      });

      expect(motion.hasMotion).toBe(true);
      expect(motion.motionScore).toBe(0.95);
      expect(motion.traces[0].kind).toBe('gsap_timeline');
    });

    it('5. InteractionEvidenceCollector records stimulus-response delta values', () => {
      const interactions = InteractionEvidenceCollector.collect({
        interactions: [
          {
            id: 'int-hover',
            triggerType: 'hover',
            targetSelector: '.card',
            styleDeltas: [
              { selector: '.card', property: 'transform', beforeValue: 'scale(1)', afterValue: 'scale(1.05)' },
            ],
          },
        ],
      });

      expect(interactions.hasInteractions).toBe(true);
      expect(interactions.interactions[0].triggerType).toBe('hover');
      expect(interactions.interactions[0].observedResponseDelta.styleDeltas[0].afterValue).toBe('scale(1.05)');
    });

    it('6. CanvasEvidenceCollector captures WebGL fallback metadata', () => {
      const canvas = CanvasEvidenceCollector.collect({
        canvasEvidence: [
          {
            kind: 'webgl_static_fallback',
            canvasSelector: '#canvas-bg',
            contextType: 'webgl2',
            width: 1440,
            height: 900,
            staticSnapshotAssetId: 'asset-canvas-shot',
            estimatedFps: 60,
          },
        ],
      });

      expect(canvas.hasCanvas).toBe(true);
      expect(canvas.canvasCount).toBe(1);
      expect(canvas.evidence[0].kind).toBe('webgl_static_fallback');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Primary Assertion: Browser Observation == FIR Representation
  // -------------------------------------------------------------------------
  describe('2. Browser Observation == FIR Invariant', () => {
    it('7. EvidenceAssertionEngine confirms 100% match when all evidence is preserved', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'];
      const fir = FIRAssembler.assemble(fixture.observedData);
      const assertion = EvidenceAssertionEngine.assertObservationToFIR(fixture.observedData, fir);

      expect(assertion.isObservationFIRMatch).toBe(true);
      expect(assertion.mismatches.length).toBe(0);
      expect(assertion.evidenceFidelityScore).toBe(1.0);
    });

    it('8. EvidenceAssertionEngine flags missing or mutated assets accurately', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'];
      const fir = FIRAssembler.assemble(fixture.observedData);
      // Simulate an unfaithful mutation in FIR
      fir.assets.assets = [];
      fir.assets.totalAssetsCount = 0;

      const assertion = EvidenceAssertionEngine.assertObservationToFIR(fixture.observedData, fir);
      expect(assertion.isObservationFIRMatch).toBe(false);
      expect(assertion.mismatches.some((m) => m.includes('Asset count mismatch'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Golden Corpus 13 Fixtures Execution (Classes A through E)
  // -------------------------------------------------------------------------
  describe('3. Golden Corpus 13-Fixture Pipeline Execution', () => {
    // CLASS A: Deterministic
    it('9. Executes Fixture 01: static-marketing-grid (Class A)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.failureStage).toBe('NONE');
      expect(res.reconstructabilityScore).toBe(1.0);
      expect(res.cleanRoomResult?.isCompilationValid).toBe(true);
    });

    it('10. Executes Fixture 02: custom-woff2-typography (Class A)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-02-custom-woff2-typography'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.failureStage).toBe('NONE');
      expect(res.fir?.assets.totalAssetsCount).toBe(1);
    });

    it('11. Executes Fixture 03: svg-vector-complex (Class A)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-03-svg-vector-complex'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.failureStage).toBe('NONE');
      expect(res.generated?.tsxCode).toContain('svg');
    });

    // CLASS B: CSS Motion
    it('12. Executes Fixture 04: css-keyframes-infinite (Class B)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-04-css-keyframes-infinite'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.plan?.capabilityTier).toBe('TIER_2_MOTION_RECORDED');
      expect(res.fir?.motion.traces[0].kind).toBe('css_animation');
    });

    it('13. Executes Fixture 05: css-transitions-stagger (Class B)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-05-css-transitions-stagger'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.fir?.motion.traces[0].kind).toBe('css_transition');
    });

    // CLASS C: GSAP Runtime
    it('14. Executes Fixture 06: gsap-timeline-fromto (Class C)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-06-gsap-timeline-fromto'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.plan?.motionStrategy).toBe('GSAP_USE_HOOK');
      expect(res.generated?.tsxCode).toContain('useGSAP(');
    });

    it('15. Executes Fixture 07: gsap-scrolltrigger-pin (Class C)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-07-gsap-scrolltrigger-pin'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.fir?.motion.traces.some((t) => t.kind === 'scroll_trigger')).toBe(true);
    });

    // CLASS D: Interaction
    it('16. Executes Fixture 08: pointermove-spring-physics (Class D)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-08-pointermove-spring-physics'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.plan?.capabilityTier).toBe('TIER_3_INTERACTION_RECOVERED');
    });

    it('17. Executes Fixture 09: click-state-mutation (Class D)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-09-click-state-mutation'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.plan?.interactionStrategy).toBe('STATEFUL_HOOK');
    });

    // CLASS E: Hostile & Dynamic Websites
    it('18. Executes Fixture 10: react-hydration-delayed (Class E)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-10-react-hydration-delayed'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.fir?.dom.sanitizedHtmlSnapshot).not.toContain('data-hydrate=');
    });

    it('19. Executes Fixture 11: dynamic-css-modules (Class E)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-11-dynamic-css-modules'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.cleanRoomResult?.isCompilationValid).toBe(true);
    });

    it('20. Executes Fixture 12: smooth-scroll-wrapper (Class E)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-12-smooth-scroll-wrapper'], testWorkspaceDir);
      expect(res.status).toBe('CERTIFIED');
      expect(res.fir?.dependencies.dependencies.some((d) => d.name === 'lenis')).toBe(true);
    });

    it('21. Executes Fixture 13: webgl-canvas-shader with lossless static fallback (Class E)', () => {
      const res = GoldenCorpusRunner.runFixture(GOLDEN_CORPUS_FIXTURES['fixture-13-webgl-canvas-shader'], testWorkspaceDir);
      expect(res.status).toBe('PARTIAL'); // Honest partial disposition without pretending scene was extracted
      expect(res.plan?.capabilityTier).toBe('TIER_4_CANVAS_FALLBACK');
      expect(res.plan?.canvasStrategy).toBe('STATIC_IMAGE_FALLBACK');
      expect(res.cleanRoomResult?.isCompilationValid).toBe(true);
    });

    it('22. Batch executes all 13 Golden Corpus fixtures with zero silent failures', () => {
      const allFixtures = Object.values(GOLDEN_CORPUS_FIXTURES);
      expect(allFixtures.length).toBe(13);

      const results = allFixtures.map((f) => GoldenCorpusRunner.runFixture(f, testWorkspaceDir));
      const failedCount = results.filter((r) => r.status === 'FAILED').length;
      expect(failedCount).toBe(0);

      const certifiedCount = results.filter((r) => r.status === 'CERTIFIED').length;
      const partialCount = results.filter((r) => r.status === 'PARTIAL').length;

      expect(certifiedCount + partialCount).toBe(13);
      expect(partialCount).toBe(1); // Only WebGL fixture is honestly PARTIAL
    });
  });

  // -------------------------------------------------------------------------
  // 4. Failure Staging & Diagnostic Categorization
  // -------------------------------------------------------------------------
  describe('4. Diagnostic Failure Categorization', () => {
    it('23. Correctly categorizes schema error as FIR_FAILURE', () => {
      const corruptedFixture = {
        ...GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'],
        observedData: {
          ...GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'].observedData,
          bounds: { x: 0, y: 0, width: -100, height: 0, viewportRatio: 1 }, // Invalid bounds
        },
      };

      const res = GoldenCorpusRunner.runFixture(corruptedFixture, testWorkspaceDir);
      expect(res.status).toBe('FAILED');
      expect(res.failureStage).toBe('FIR_FAILURE');
    });

    it('24. Correctly categorizes observation mismatch as OBSERVATION_FAILURE', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-01-static-grid'];
      const fir = FIRAssembler.assemble(fixture.observedData);

      // Modify observed data with an extra observed asset that is missing from FIR
      const modifiedObservation = {
        ...fixture.observedData,
        assets: [
          ...(fixture.observedData.assets || []),
          {
            id: 'asset-extra',
            type: 'image',
            sourceUrl: 'https://example.com/unrecorded.webp',
            localPath: 'assets/unrecorded.webp',
            sha256: 'sha-unrecorded',
          },
        ],
      };

      const assertion = EvidenceAssertionEngine.assertObservationToFIR(modifiedObservation, fir);
      expect(assertion.isObservationFIRMatch).toBe(false);
      expect(assertion.mismatches.some((m) => m.includes('Missing asset in FIR'))).toBe(true);
    });

    it('25. Enforces truthful reporting without artificially inflating fidelity score', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-13-webgl-canvas-shader'];
      const res = GoldenCorpusRunner.runFixture(fixture, testWorkspaceDir);

      // WebGL is classified as 0.75 reconstructability and PARTIAL status
      expect(res.reconstructabilityScore).toBeLessThan(1.0);
      expect(res.status).toBe('PARTIAL');
      expect(res.plan?.knownLimitations.length).toBeGreaterThan(0);
    });
  });
});
