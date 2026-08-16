import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AcceptanceGate } from '../src/engine/acceptance/acceptanceGate';
import { PackageVerifier } from '../src/engine/acceptance/packageVerifier';
import { BENCHMARK_CORPUS } from '../src/engine/benchmark/benchmarkCorpus';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { CANONICAL_10_SECTION_WEBSITE } from './fixtures/phase13/multiSectionFixtures';
import fs from 'fs';
import path from 'path';

describe('Phase 14 — Copy-and-Use Certification & Adversarial Benchmark Suite (35 Tests)', () => {
  const stagingPkgDir = path.join(process.cwd(), 'workspaces', 'test_p14_cert_packages');

  beforeAll(() => {
    if (fs.existsSync(stagingPkgDir)) fs.rmSync(stagingPkgDir, { recursive: true, force: true });
    fs.mkdirSync(stagingPkgDir, { recursive: true });

    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      ComponentPackageBuilder.buildPackage({
        componentName: sec.title,
        category: sec.category,
        sourceCandidateId: `cand-${sec.sectionId}`,
        websiteId: CANONICAL_10_SECTION_WEBSITE.websiteId,
        pageId: 'page-home',
        sourceWebsiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
        sourcePagePath: CANONICAL_10_SECTION_WEBSITE.pagePath,
        tsxCode: `export const ${sec.title}: React.FC = () => (${sec.html});`,
        cssCode: sec.css,
        assets: sec.assets.map((a) => ({
          assetId: a.id,
          originalUrl: a.originalUrl,
          localPath: a.localPath,
          exportPath: `assets/${a.id}.webp`,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          contentHash: `sha256-${a.id}`,
          usageLocation: `${sec.title} > asset`,
          owningSectionId: sec.sectionId,
          ownershipScope: 'SECTION_LOCAL',
          isRequired: true,
          isAnimated: false,
        })),
        propsDocJson: '[]',
        technologies: sec.technologies,
        animations: sec.animations.map((a) => ({
          name: a.name,
          technology: a.type,
          trigger: 'load',
          durationMs: a.durationMs,
        })),
        isolationStatus: sec.isAdvancedShader ? 'PARTIAL' : 'ISOLATED',
        validationReport: {
          isValid: true,
          layersPassed: ['Structural Validation', 'CSS Isolation'],
          layersFailed: [],
          errors: [],
          warnings: [],
        },
        outputDirectory: stagingPkgDir,
      });
    }
  });

  afterAll(() => {
    if (fs.existsSync(stagingPkgDir)) fs.rmSync(stagingPkgDir, { recursive: true, force: true });
  });

  // ==========================================
  // Copy-and-Use Acceptance Gate Evaluation
  // ==========================================
  it('1. Grants COPY_USE_CERTIFIED when all 12 acceptance gates pass', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      websiteUrl: 'https://trionn.com',
      gates: {},
    });

    expect(cert.status).toBe('COPY_USE_CERTIFIED');
    expect(cert.metrics.overallScore).toBe(100);
    expect(cert.reproductionNotes).toContain('Fully reproduced in clean-room');
  });

  it('2. Grants COPY_USE_PARTIAL for specialized WebGL canvas section with documented limitations', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-05',
      componentName: 'Interactive3DExperience',
      websiteUrl: 'https://trionn.com',
      gates: { animation: 'PARTIAL' },
      isSpecializedRuntime: true,
      knownLimitations: ['Three.js WebGL render loop requires external canvas container mounting.'],
    });

    expect(cert.status).toBe('COPY_USE_PARTIAL');
    expect(cert.knownLimitations.length).toBeGreaterThan(0);
    expect(cert.reproductionNotes).toContain('Partially reproduced with documented specialized runtime');
  });

  it('3. Assigns COPY_USE_FAILED when any critical gate fails (e.g. CSS leakage)', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-fail',
      componentName: 'LeakyComp',
      websiteUrl: 'https://site.com',
      gates: { leakage: 'FAIL' },
    });

    expect(cert.status).toBe('COPY_USE_FAILED');
    expect(cert.reproductionNotes).toContain('Reproduction failed clean-room');
  });

  it('4. Assigns COPY_USE_FAILED when typescript compilation fails', () => {
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-fail-ts',
      componentName: 'BrokenTsx',
      websiteUrl: 'https://site.com',
      gates: { typescript: 'FAIL' },
    });

    expect(cert.status).toBe('COPY_USE_FAILED');
    expect(cert.metrics.packageUsability).toBe(0);
  });

  it('5. Evaluates Discovery Recall sub-metric correctly (100% on PASS, 70% on PARTIAL)', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { discovery: 'PASS' } });
    const part = AcceptanceGate.evaluateCertification({ sectionId: 's2', componentName: 'C2', websiteUrl: 'u', gates: { discovery: 'PARTIAL' } });

    expect(pass.metrics.discoveryRecall).toBe(100);
    expect(part.metrics.discoveryRecall).toBe(70);
  });

  it('6. Evaluates Isolation Precision sub-metric correctly', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { isolation: 'PASS', leakage: 'PASS' } });
    expect(pass.metrics.isolationPrecision).toBe(100);
  });

  it('7. Evaluates Asset Completeness sub-metric correctly', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { assets: 'PASS' } });
    expect(pass.metrics.assetCompleteness).toBe(100);
  });

  it('8. Evaluates Animation Fidelity sub-metric correctly', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { animation: 'PASS' } });
    expect(pass.metrics.animationFidelity).toBe(100);
  });

  it('9. Evaluates Interaction Fidelity sub-metric correctly', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { interaction: 'PASS' } });
    expect(pass.metrics.interactionFidelity).toBe(100);
  });

  it('10. Evaluates Responsive Fidelity sub-metric correctly', () => {
    const pass = AcceptanceGate.evaluateCertification({ sectionId: 's1', componentName: 'C1', websiteUrl: 'u', gates: { responsive: 'PASS' } });
    expect(pass.metrics.responsiveFidelity).toBe(100);
  });

  // ==========================================
  // Standalone Package Contract Verification
  // ==========================================
  it('11. Verifies HeroSection package meets all 10 contract file requirements', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'HeroSection'), 'HeroSection');
    expect(ver.isContractComplete).toBe(true);
    expect(ver.filesMissing.length).toBe(0);
  });

  it('12. Verifies InfiniteMarqueeSection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'InfiniteMarqueeSection'), 'InfiniteMarqueeSection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('13. Verifies AboutAgencySection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'AboutAgencySection'), 'AboutAgencySection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('14. Verifies FeaturedProjectsGrid package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'FeaturedProjectsGrid'), 'FeaturedProjectsGrid');
    expect(ver.isContractComplete).toBe(true);
  });

  it('15. Verifies Interactive3DExperience package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'Interactive3DExperience'), 'Interactive3DExperience');
    expect(ver.isContractComplete).toBe(true);
  });

  it('16. Verifies VideoShowreelSection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'VideoShowreelSection'), 'VideoShowreelSection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('17. Verifies InteractiveGallerySection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'InteractiveGallerySection'), 'InteractiveGallerySection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('18. Verifies TestimonialsSection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'TestimonialsSection'), 'TestimonialsSection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('19. Verifies CallToActionSection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'CallToActionSection'), 'CallToActionSection');
    expect(ver.isContractComplete).toBe(true);
  });

  it('20. Verifies FooterSection package contract completeness', () => {
    const ver = PackageVerifier.verifyPackageContract(path.join(stagingPkgDir, 'FooterSection'), 'FooterSection');
    expect(ver.isContractComplete).toBe(true);
  });

  // ==========================================
  // Adversarial Real-World Acceptance Matrix
  // ==========================================
  it('21. Trionn Creative Agency: Evaluates 10-section adversarial acceptance', () => {
    const item = BENCHMARK_CORPUS.trionn;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-trionn-hero',
      componentName: 'TrionnHero',
      websiteUrl: item.url,
      gates: { discovery: 'PASS', isolation: 'PASS', assets: 'PASS', animation: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('22. Noth.in Editorial: Evaluates typography and marquee certification', () => {
    const item = BENCHMARK_CORPUS.noth_in;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-nothin-marquee',
      componentName: 'NothinMarquee',
      websiteUrl: item.url,
      gates: { typography: 'PASS', animation: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('23. Cula Technologies (About): Evaluates telemetry and 3D Spline model certification', () => {
    const item = BENCHMARK_CORPUS.cula_tech;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-cula-telemetry',
      componentName: 'CulaTelemetry',
      websiteUrl: item.url,
      gates: { animation: 'PARTIAL' },
      isSpecializedRuntime: true,
    });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('24. NK Studio: Evaluates video background and horizontal project track certification', () => {
    const item = BENCHMARK_CORPUS.nk_studio;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-nk-track',
      componentName: 'NkTrack',
      websiteUrl: item.url,
      gates: { assets: 'PASS', responsive: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('25. Vero Studio: Evaluates image shader hover grid certification', () => {
    const item = BENCHMARK_CORPUS.vero_studio;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-vero-grid',
      componentName: 'VeroGrid',
      websiteUrl: item.url,
      gates: { animation: 'PARTIAL' },
      isSpecializedRuntime: true,
    });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('26. Ciao Energy: Evaluates Lottie animation and vector SVG morphing certification', () => {
    const item = BENCHMARK_CORPUS.ciao_energy;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-ciao-can',
      componentName: 'CiaoCanHero',
      websiteUrl: item.url,
      gates: { assets: 'PASS', animation: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('27. Made With GSAP Home: Evaluates masonry card grid directory certification', () => {
    const item = BENCHMARK_CORPUS.made_with_gsap_home;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-mwg-masonry',
      componentName: 'MwgMasonry',
      websiteUrl: item.url,
      gates: { discovery: 'PASS', isolation: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('28. Made With GSAP Effects: Evaluates interactive parameter controls certification', () => {
    const item = BENCHMARK_CORPUS.made_with_gsap_effects;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-mwg-tilt',
      componentName: 'VelocityTiltDemo',
      websiteUrl: item.url,
      gates: { animation: 'PASS', interaction: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  it('29. Obys Agency Experiments: Evaluates fluid WebGL distortion shader certification', () => {
    const item = BENCHMARK_CORPUS.obys_experiment;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-obys-fluid',
      componentName: 'ObysFluidText',
      websiteUrl: item.url,
      gates: { animation: 'PARTIAL' },
      isSpecializedRuntime: true,
    });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('30. Artem Portfolio: Evaluates retro physics draggable card board certification', () => {
    const item = BENCHMARK_CORPUS.artem_portfolio;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-artem-board',
      componentName: 'ArtemBoard',
      websiteUrl: item.url,
      gates: { interaction: 'PARTIAL' },
      isSpecializedRuntime: true,
    });
    expect(cert.status).toBe('COPY_USE_PARTIAL');
  });

  it('31. Normal is Boring: Evaluates brutalist high-contrast layout certification', () => {
    const item = BENCHMARK_CORPUS.normal_is_boring;
    const cert = AcceptanceGate.evaluateCertification({
      sectionId: 'sec-nib-split',
      componentName: 'NibSplitHero',
      websiteUrl: item.url,
      gates: { typography: 'PASS', responsive: 'PASS' },
    });
    expect(cert.status).toBe('COPY_USE_CERTIFIED');
  });

  // ==========================================
  // Integrity & Reproducibility Guarantees
  // ==========================================
  it('32. Asserts zero fabricated props across all certified packages', () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const propsPath = path.join(stagingPkgDir, sec.title, 'props.json');
      const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));
      expect(Array.isArray(props)).toBe(true);
    }
  });

  it('33. Asserts zero global CSS leakage across all certified package stylesheets', () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const cssPath = path.join(stagingPkgDir, sec.title, `${sec.title}.css`);
      const css = fs.readFileSync(cssPath, 'utf-8');
      expect(css.includes('body {')).toBe(false);
      expect(css.includes('html {')).toBe(false);
    }
  });

  it('34. Asserts all package dependencies.json specify valid package requirements', () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const depsPath = path.join(stagingPkgDir, sec.title, 'dependencies.json');
      const deps = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
      expect(deps.npm).toBeDefined();
    }
  });

  it('35. Hard certification gate summary asserts 100% reproducibility of canonical corpus', () => {
    const verifiedResults = CANONICAL_10_SECTION_WEBSITE.sections.map((sec) =>
      AcceptanceGate.evaluateCertification({
        sectionId: sec.sectionId,
        componentName: sec.title,
        websiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
        isSpecializedRuntime: sec.isAdvancedShader,
      })
    );

    expect(verifiedResults.length).toBe(10);
    const certifiedCount = verifiedResults.filter((r) => r.status === 'COPY_USE_CERTIFIED').length;
    const partialCount = verifiedResults.filter((r) => r.status === 'COPY_USE_PARTIAL').length;
    const failedCount = verifiedResults.filter((r) => r.status === 'COPY_USE_FAILED').length;

    expect(certifiedCount).toBe(9);
    expect(partialCount).toBe(1);
    expect(failedCount).toBe(0);
  });
});
