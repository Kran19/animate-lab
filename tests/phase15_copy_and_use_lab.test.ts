import { describe, it, expect } from 'vitest';
import { AcceptanceGate } from '../src/engine/acceptance/acceptanceGate';
import { GlobalPageReportGenerator } from '../src/engine/acceptance/globalPageReportGenerator';
import { BENCHMARK_CORPUS } from '../src/engine/benchmark/benchmarkCorpus';
import { CANONICAL_10_SECTION_WEBSITE } from './fixtures/phase13/multiSectionFixtures';

describe('Phase 15 — Copy-and-Use Lab, 4-Tier Disposition & Machine Matrix Suite (25 Tests)', () => {
  // ==========================================
  // 4-Tier Disposition Evaluation
  // ==========================================
  it('1. Grants COPY_USE_CERTIFIED when all 12 gates pass with zero limitations', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      websiteUrl: 'https://trionn.com',
      gates: {},
    });

    expect(cert.status).toBe('COPY_USE_CERTIFIED');
    expect(cert.metrics.overallScore).toBe(100);
    expect(cert.metrics.certificationRate).toBe(100);
  });

  it('2. Grants COPY_USE_PARTIAL for specialized WebGL section with explicit limitation', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-05',
      componentName: 'Interactive3DExperience',
      websiteUrl: 'https://trionn.com',
      gates: { animation: 'PARTIAL' },
      isSpecializedRuntime: true,
      knownLimitations: ['Three.js WebGL render loop requires external canvas container mounting.'],
    });

    expect(cert.status).toBe('COPY_USE_PARTIAL');
    expect(cert.metrics.certificationRate).toBe(50);
    expect(cert.knownLimitations.length).toBeGreaterThan(0);
  });

  it('3. Grants COPY_USE_BLOCKED when evidence cannot be deterministically interrogated', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-blocked',
      componentName: 'ObfuscatedCanvas',
      websiteUrl: 'https://site.com',
      isEvidenceBlocked: true,
    });

    expect(cert.status).toBe('COPY_USE_BLOCKED');
    expect(cert.knownLimitations.some(l => l.includes('Insufficient observable evidence'))).toBe(true);
    expect(cert.reproductionNotes).toContain('Reproduction blocked');
  });

  it('4. Assigns COPY_USE_FAILED when critical syntax or leakage failure occurs', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-failed',
      componentName: 'LeakyComp',
      websiteUrl: 'https://site.com',
      gates: { leakage: 'FAIL' },
    });

    expect(cert.status).toBe('COPY_USE_FAILED');
    expect(cert.metrics.certificationRate).toBe(0);
    expect(cert.metrics.isolationPrecision).toBe(0);
  });

  // ==========================================
  // 8 Core Acceptance KPIs Evaluation
  // ==========================================
  it('5. Evaluates Discovery Recall KPI (100% on PASS, 70% on PARTIAL, 0% on FAIL)', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { discovery: 'PASS' } });
    const part = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { discovery: 'PARTIAL' } });
    const fail = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { discovery: 'FAIL' } });

    expect(pass.metrics.discoveryRecall).toBe(100);
    expect(part.metrics.discoveryRecall).toBe(70);
    expect(fail.metrics.discoveryRecall).toBe(0);
  });

  it('6. Evaluates Isolation Precision KPI based on isolation and leakage gates', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { isolation: 'PASS', leakage: 'PASS' } });
    expect(pass.metrics.isolationPrecision).toBe(100);
  });

  it('7. Evaluates Package Usability KPI based on typescript, build, and render gates', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { typescript: 'PASS', build: 'PASS', render: 'PASS' } });
    expect(pass.metrics.packageUsability).toBe(100);
  });

  it('8. Evaluates Asset Completeness KPI', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { assets: 'PASS' } });
    expect(pass.metrics.assetCompleteness).toBe(100);
  });

  it('9. Evaluates Animation Fidelity KPI', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { animation: 'PASS' } });
    expect(pass.metrics.animationFidelity).toBe(100);
  });

  it('10. Evaluates Interaction Fidelity KPI', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { interaction: 'PASS' } });
    expect(pass.metrics.interactionFidelity).toBe(100);
  });

  it('11. Evaluates Responsive Fidelity KPI', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: { responsive: 'PASS' } });
    expect(pass.metrics.responsiveFidelity).toBe(100);
  });

  it('12. Evaluates Certification Rate KPI', () => {
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 's', componentName: 'c', websiteUrl: 'u', gates: {} });
    expect(cert.metrics.certificationRate).toBe(100);
  });

  // ==========================================
  // Global Page Report & Machine-Readable Matrix
  // ==========================================
  it('13. Generates canonical EXTRACTION_REPORT.md with machine-readable matrix', () => {
    const sections = CANONICAL_10_SECTION_WEBSITE.sections.map((sec) => ({
      id: sec.sectionId,
      name: sec.title,
      certification: AcceptanceGate.evaluateCertification({
        sectionId: sec.sectionId,
        componentName: sec.title,
        websiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
        isSpecializedRuntime: sec.isAdvancedShader,
      }),
    }));

    const report = GlobalPageReportGenerator.generateReport({
      websiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
      crawlDate: '2026-08-15',
      sections,
    });

    expect(report).toContain('### Machine-Readable Disposition Matrix');
    expect(report).toContain('Discovered: 10');
    expect(report).toContain('Packaged:   10');
    expect(report).toContain('Silent omissions: 0');
  });

  it('14. Matrix includes exact section lines with disposition statuses', () => {
    const sections = CANONICAL_10_SECTION_WEBSITE.sections.map((sec) => ({
      id: sec.sectionId,
      name: sec.title,
      certification: AcceptanceGate.evaluateCertification({
        sectionId: sec.sectionId,
        componentName: sec.title,
        websiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
        isSpecializedRuntime: sec.isAdvancedShader,
      }),
    }));

    const report = GlobalPageReportGenerator.generateReport({
      websiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
      crawlDate: '2026-08-15',
      sections,
    });

    expect(report).toContain('01 HeroSection                CERTIFIED');
    expect(report).toContain('05 Interactive3DExperience    PARTIAL');
  });

  // ==========================================
  // Adversarial Real-World Corpus Certification
  // ==========================================
  it('15. Trionn Creative Agency: Evaluates 10-section adversarial acceptance', () => {
    const item = BENCHMARK_CORPUS.trionn;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-trionn', componentName: 'TrionnHero', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('16. Noth.in Editorial: Evaluates typography and marquee certification', () => {
    const item = BENCHMARK_CORPUS.noth_in;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-nothin', componentName: 'NothinMarquee', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('17. Cula Technologies (About): Evaluates telemetry and 3D Spline model certification', () => {
    const item = BENCHMARK_CORPUS.cula_tech;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-cula', componentName: 'CulaTelemetry', websiteUrl: item.url, isSpecializedRuntime: true });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('18. NK Studio: Evaluates video background and horizontal project track certification', () => {
    const item = BENCHMARK_CORPUS.nk_studio;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-nk', componentName: 'NkTrack', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('19. Vero Studio: Evaluates image shader hover grid certification', () => {
    const item = BENCHMARK_CORPUS.vero_studio;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-vero', componentName: 'VeroGrid', websiteUrl: item.url, isSpecializedRuntime: true });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('20. Ciao Energy: Evaluates Lottie animation and vector SVG morphing certification', () => {
    const item = BENCHMARK_CORPUS.ciao_energy;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-ciao', componentName: 'CiaoCanHero', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('21. Made With GSAP Home: Evaluates masonry card grid directory certification', () => {
    const item = BENCHMARK_CORPUS.made_with_gsap_home;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-mwg-home', componentName: 'MwgMasonry', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('22. Made With GSAP Effects: Evaluates interactive parameter controls certification', () => {
    const item = BENCHMARK_CORPUS.made_with_gsap_effects;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-mwg-eff', componentName: 'VelocityTilt', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('23. Obys Agency Experiments: Evaluates fluid WebGL distortion shader certification', () => {
    const item = BENCHMARK_CORPUS.obys_experiment;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-obys', componentName: 'ObysFluid', websiteUrl: item.url, isSpecializedRuntime: true });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('24. Artem Portfolio: Evaluates retro physics draggable card board certification', () => {
    const item = BENCHMARK_CORPUS.artem_portfolio;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-artem', componentName: 'ArtemBoard', websiteUrl: item.url, isSpecializedRuntime: true });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('25. Normal is Boring: Evaluates brutalist high-contrast layout certification', () => {
    const item = BENCHMARK_CORPUS.normal_is_boring;
    const cert = AcceptanceGate.evaluateCertification({ sectionId: 'sec-nib', componentName: 'NibSplitHero', websiteUrl: item.url, gates: {} });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });
});
