import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MotionSynthesizer } from '../src/engine/generation/motionSynthesizer';
import { InteractionSynthesizer } from '../src/engine/generation/interactionSynthesizer';
import { ReactGenerator } from '../src/engine/generation/reactGenerator';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { BehavioralReplayRunner } from '../src/engine/acceptance/behavioralReplayRunner';
import { PerceptualScorecardEngine } from '../src/engine/benchmark/perceptualScorecard';
import { GOLDEN_CORPUS_FIXTURES, GoldenCorpusRunner } from '../src/engine/benchmark/corpus';

describe('Phase 18 — Behavioral Reconstruction & Synthesis Fidelity Suite', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase18_reconstruction');

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
  // 1. GSAP Motion Graph Synthesizer
  // -------------------------------------------------------------------------
  describe('1. GSAP Motion Graph Synthesizer', () => {
    it('1. Synthesizes useGSAP hook with fromTo tweens and ease curves', () => {
      const result = MotionSynthesizer.synthesize(
        [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-reveal-01',
            durationMs: 1400,
            totalDurationMs: 1400,
            repeat: 0,
            yoyo: false,
            tweens: [
              {
                targetSelector: '.title-char',
                propertiesFrom: { opacity: 0, y: 80, rotateZ: 5 },
                propertiesTo: { opacity: 1, y: 0, rotateZ: 0 },
                duration: 1.4,
                ease: 'power3.out',
              },
            ],
          },
        ],
        '.hero-root'
      );

      expect(result.hasMotionCode).toBe(true);
      expect(result.importsCode).toContain("import { useGSAP } from '@gsap/react';");
      expect(result.importsCode).toContain("import gsap from 'gsap';");
      expect(result.hookCode).toContain('useGSAP(');
      expect(result.hookCode).toContain(".fromTo('.title-char',");
      expect(result.hookCode).toContain('"opacity":0');
      expect(result.hookCode).toContain('"opacity":1');
      expect(result.hookCode).toContain('power3.out');
    });

    it('2. Synthesizes ScrollTrigger pin and scrub configurations with plugin registration', () => {
      const result = MotionSynthesizer.synthesize(
        [
          {
            kind: 'scroll_trigger',
            triggerSelector: '#pin-container',
            start: 'top top',
            end: '+=2000',
            scrub: 1.5,
            pin: true,
            markers: false,
          },
        ],
        '.showcase-root'
      );

      expect(result.hasMotionCode).toBe(true);
      expect(result.importsCode).toContain("import { ScrollTrigger } from 'gsap/ScrollTrigger';");
      expect(result.importsCode).toContain('gsap.registerPlugin(ScrollTrigger);');
      expect(result.hookCode).toContain("trigger: '#pin-container'");
      expect(result.hookCode).toContain("start: 'top top'");
      expect(result.hookCode).toContain('scrub: 1.5');
      expect(result.hookCode).toContain('pin: true');
    });

    it('3. Returns clean empty output when no motion traces exist', () => {
      const result = MotionSynthesizer.synthesize([], '.static-root');
      expect(result.hasMotionCode).toBe(false);
      expect(result.importsCode).toBe('');
      expect(result.hookCode).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Interaction State Machine Synthesizer
  // -------------------------------------------------------------------------
  describe('2. Interaction State Machine Synthesizer', () => {
    it('4. Synthesizes pointer spring physics and magnetic hover handlers', () => {
      const result = InteractionSynthesizer.synthesize([
        {
          interactionId: 'int-mag',
          triggerType: 'pointermove',
          targetSelector: '.btn-mag',
          observedResponseDelta: {
            affectedSelectors: ['.btn-mag'],
            styleDeltas: [
              { selector: '.btn-mag', property: 'transform', beforeValue: 'scale(1)', afterValue: 'scale(1.1)' },
            ],
            domMutationsObserved: 0,
            settleDurationMs: 200,
          },
        },
      ]);

      expect(result.hasInteractionCode).toBe(true);
      expect(result.hookCode).toContain('setPointerOffset_0');
      expect(result.hookCode).toContain('handlePointerMove_0');
      expect(result.hookCode).toContain('handlePointerLeave_0');
      expect(result.injectedEventAttributes['.btn-mag']).toContain('onPointerMove={handlePointerMove_0}');
      expect(result.injectedEventAttributes['.btn-mag']).toContain('translate3d');
    });

    it('5. Synthesizes click state toggle and aria-expanded state machine', () => {
      const result = InteractionSynthesizer.synthesize([
        {
          interactionId: 'int-accordion',
          triggerType: 'click',
          targetSelector: '.accordion-btn',
          observedResponseDelta: {
            affectedSelectors: ['.accordion-btn'],
            styleDeltas: [],
            domMutationsObserved: 1,
            settleDurationMs: 300,
          },
        },
      ]);

      expect(result.hasInteractionCode).toBe(true);
      expect(result.hookCode).toContain('const [isActive_0, setIsActive_0] = React.useState(false);');
      expect(result.hookCode).toContain('handleClickToggle_0');
      expect(result.injectedEventAttributes['.accordion-btn']).toContain('onClick={handleClickToggle_0}');
      expect(result.injectedEventAttributes['.accordion-btn']).toContain('aria-expanded={isActive_0}');
    });
  });

  // -------------------------------------------------------------------------
  // 3. React Component Generation from FIR
  // -------------------------------------------------------------------------
  describe('3. React Component Generation from FIR', () => {
    it('6. Synthesizes complete interactive component with both GSAP and state hooks', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-combo',
        websiteId: 'web-combo',
        pageId: 'page-combo',
        title: 'Interactive Hero Section',
        category: 'Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        domSelector: '#hero-combo',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
        rawHtml: '<section id="hero-combo"><h1 class="hero-title">Welcome</h1><button class="hero-cta">Explore</button></section>',
        animations: [
          {
            kind: 'gsap_timeline',
            timelineId: 'tl-combo',
            durationMs: 1200,
            totalDurationMs: 1200,
            repeat: 0,
            yoyo: false,
            tweens: [{ targetSelector: '.hero-title', propertiesTo: { opacity: 1, y: 0 }, duration: 1.2 }],
          },
        ],
        interactions: [
          {
            id: 'int-cta',
            triggerType: 'pointermove',
            targetSelector: '.hero-cta',
          },
        ],
      });

      const generator = new ReactGenerator();
      const generated = generator.generateFromFIR(fir);

      expect(generated.tsxCode).toContain("import { useGSAP } from '@gsap/react';");
      expect(generated.tsxCode).toContain('handlePointerMove_0');
      expect(generated.tsxCode).toContain('useGSAP(');
      expect(generated.tsxCode).toContain('onPointerMove=');
      expect(generated.stage).toBe('GENERATED');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Behavioral Replay & Clean-Room Verification
  // -------------------------------------------------------------------------
  describe('4. Behavioral Replay Engine', () => {
    it('7. BehavioralReplayRunner verifies pointermove stimulus against generated component', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-08-pointermove-spring-physics'];
      const runResult = GoldenCorpusRunner.runFixture(fixture, testWorkspaceDir);

      const pkgDir = path.join(testWorkspaceDir, fixture.fixtureId, runResult.generated!.componentName);
      const replaySummary = BehavioralReplayRunner.executeReplay({
        packageDirectory: pkgDir,
        componentName: runResult.generated!.componentName,
        fir: runResult.fir!,
      });

      expect(replaySummary.status).toBe('REPLAY_VERIFIED');
      expect(replaySummary.replaySuccessRate).toBe(1.0);
      expect(replaySummary.results[0].stimulusType).toBe('pointermove');
      expect(replaySummary.results[0].isBehaviorEquivalent).toBe(true);
    });

    it('8. BehavioralReplayRunner verifies click state toggle stimulus against generated component', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-09-click-state-mutation'];
      const runResult = GoldenCorpusRunner.runFixture(fixture, testWorkspaceDir);

      const pkgDir = path.join(testWorkspaceDir, fixture.fixtureId, runResult.generated!.componentName);
      const replaySummary = BehavioralReplayRunner.executeReplay({
        packageDirectory: pkgDir,
        componentName: runResult.generated!.componentName,
        fir: runResult.fir!,
      });

      expect(replaySummary.status).toBe('REPLAY_VERIFIED');
      expect(replaySummary.replaySuccessRate).toBe(1.0);
      expect(replaySummary.results[0].stimulusType).toBe('click');
      expect(replaySummary.results[0].isBehaviorEquivalent).toBe(true);
    });

    it('9. BehavioralReplayRunner verifies GSAP timeline execution stimulus', () => {
      const fixture = GOLDEN_CORPUS_FIXTURES['fixture-06-gsap-timeline-fromto'];
      const runResult = GoldenCorpusRunner.runFixture(fixture, testWorkspaceDir);

      const pkgDir = path.join(testWorkspaceDir, fixture.fixtureId, runResult.generated!.componentName);
      const replaySummary = BehavioralReplayRunner.executeReplay({
        packageDirectory: pkgDir,
        componentName: runResult.generated!.componentName,
        fir: runResult.fir!,
      });

      expect(replaySummary.status).toBe('REPLAY_VERIFIED');
      expect(replaySummary.results.some((r) => r.stimulusType === 'timeline_execution')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Perceptual Certification Scorecard
  // -------------------------------------------------------------------------
  describe('5. Perceptual Certification Scorecard', () => {
    it('10. Computes exact weighted contribution across 7 core dimensions', () => {
      const result = PerceptualScorecardEngine.calculate({
        domLayoutScore: 1.0,        // 15% -> 15.0
        typographyScore: 1.0,       // 10% -> 10.0
        assetScore: 1.0,            // 10% -> 10.0
        animationFidelityScore: 0.94,// 25% -> 23.5
        interactionScore: 0.85,     // 15% -> 12.75
        visualSimilarityScore: 0.96,// 20% -> 19.2
        dependencyScore: 1.0,       // 5%  -> 5.0
      });

      // Sum: 15 + 10 + 10 + 23.5 + 12.75 + 19.2 + 5.0 = 95.45% (rounded to 95.4%)
      expect(result.compositeScore).toBe(95.4);
      expect(result.grade).toBe('A+');
      expect(result.disposition).toBe('COPY_USE_CERTIFIED');
      expect(result.dimensions.length).toBe(7);
    });

    it('11. Accurately assigns PARTIAL disposition for canvas-heavy fixtures', () => {
      const result = PerceptualScorecardEngine.calculate({
        domLayoutScore: 1.0,
        typographyScore: 1.0,
        assetScore: 1.0,
        animationFidelityScore: 0.0,
        interactionScore: 0.0,
        visualSimilarityScore: 0.80,
        dependencyScore: 0.90,
      });

      expect(result.compositeScore).toBeLessThan(80.0);
      expect(result.disposition).toBe('COPY_USE_PARTIAL');
      expect(result.grade).toBe('PARTIAL');
    });
  });

  // -------------------------------------------------------------------------
  // 6. End-to-End Golden Corpus Behavioral Re-Certification
  // -------------------------------------------------------------------------
  describe('6. Golden Corpus Behavioral Re-Certification', () => {
    it('12. Re-certifies all 13 Golden Corpus fixtures with behavioral hooks active', () => {
      const allFixtures = Object.values(GOLDEN_CORPUS_FIXTURES);
      const results = allFixtures.map((f) => GoldenCorpusRunner.runFixture(f, testWorkspaceDir));

      expect(results.filter((r) => r.status === 'FAILED').length).toBe(0);
      expect(results.filter((r) => r.status === 'CERTIFIED').length).toBe(12);
      expect(results.filter((r) => r.status === 'PARTIAL').length).toBe(1);

      // Verify Fixture 06 (GSAP) synthesized useGSAP
      const gsapResult = results.find((r) => r.fixtureId === 'fixture-06-gsap-timeline-fromto');
      expect(gsapResult?.generated?.tsxCode).toContain('useGSAP(');
      expect(gsapResult?.generated?.tsxCode).toContain('fromTo');

      // Verify Fixture 08 (Pointer) synthesized pointermove physics
      const pointerResult = results.find((r) => r.fixtureId === 'fixture-08-pointermove-spring-physics');
      expect(pointerResult?.generated?.tsxCode).toContain('onPointerMove=');
      expect(pointerResult?.generated?.tsxCode).toContain('translate3d');

      // Verify Fixture 09 (Accordion) synthesized useState toggle
      const accordionResult = results.find((r) => r.fixtureId === 'fixture-09-click-state-mutation');
      expect(accordionResult?.generated?.tsxCode).toContain('useState(false)');
      expect(accordionResult?.generated?.tsxCode).toContain('onClick=');
      expect(accordionResult?.generated?.tsxCode).toContain('aria-expanded=');
    });
  });
});
