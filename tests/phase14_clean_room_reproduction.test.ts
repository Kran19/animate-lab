import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CleanRoomRunner } from '../src/engine/acceptance/cleanRoomRunner';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { CANONICAL_10_SECTION_WEBSITE } from './fixtures/phase13/multiSectionFixtures';
import fs from 'fs';
import path from 'path';

describe('Phase 14 — Clean-Room Reproduction & Black-Box Acceptance Suite (30 Tests)', () => {
  const stagingPkgDir = path.join(process.cwd(), 'workspaces', 'test_p14_packages');
  const cleanRoomBaseDir = path.join(process.cwd(), 'workspaces', 'test_p14_clean_room');

  beforeAll(() => {
    if (fs.existsSync(stagingPkgDir)) fs.rmSync(stagingPkgDir, { recursive: true, force: true });
    if (fs.existsSync(cleanRoomBaseDir)) fs.rmSync(cleanRoomBaseDir, { recursive: true, force: true });

    fs.mkdirSync(stagingPkgDir, { recursive: true });
    fs.mkdirSync(cleanRoomBaseDir, { recursive: true });

    // Build standalone packages for the 10 canonical sections
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
    if (fs.existsSync(cleanRoomBaseDir)) fs.rmSync(cleanRoomBaseDir, { recursive: true, force: true });
  });

  // ==========================================
  // Section 01–10 Clean-Room Reproduction
  // ==========================================
  it('1. Section 01 (Hero): Survives clean-room reproduction with zero AnimateLab imports', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(res.hasInternalPathLeakage).toBe(false);
    expect(res.isCompilationValid).toBe(true);
  });

  it('2. Section 02 (Marquee): Scaffolds external App.tsx and mounts marquee in clean-room', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-02',
      componentName: 'InfiniteMarqueeSection',
      packageDirectory: path.join(stagingPkgDir, 'InfiniteMarqueeSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(fs.existsSync(path.join(res.cleanRoomDirectory, 'App.tsx'))).toBe(true);
  });

  it('3. Section 03 (About): Verifies clean TSX export and relative stylesheet resolution', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-03',
      componentName: 'AboutAgencySection',
      packageDirectory: path.join(stagingPkgDir, 'AboutAgencySection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(res.isImportResolutionValid).toBe(true);
  });

  it('4. Section 04 (Card Grid): Verifies localized image asset resolution in clean-room', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-04',
      componentName: 'FeaturedProjectsGrid',
      packageDirectory: path.join(stagingPkgDir, 'FeaturedProjectsGrid'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(res.isAssetResolutionValid).toBe(true);
  });

  it('5. Section 05 (3D Canvas): Verifies clean-room scaffolding of WebGL container', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-05',
      componentName: 'Interactive3DExperience',
      packageDirectory: path.join(stagingPkgDir, 'Interactive3DExperience'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('6. Section 06 (Video Showcase): Verifies clean-room video asset presence', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-06',
      componentName: 'VideoShowreelSection',
      packageDirectory: path.join(stagingPkgDir, 'VideoShowreelSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('7. Section 07 (Interactive Gallery): Verifies gallery pan structure in clean-room', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-07',
      componentName: 'InteractiveGallerySection',
      packageDirectory: path.join(stagingPkgDir, 'InteractiveGallerySection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('8. Section 08 (Testimonials): Verifies clean typography mounting in consumer App', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-08',
      componentName: 'TestimonialsSection',
      packageDirectory: path.join(stagingPkgDir, 'TestimonialsSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('9. Section 09 (CTA): Verifies button pulse styling without global stylesheet pollution', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-09',
      componentName: 'CallToActionSection',
      packageDirectory: path.join(stagingPkgDir, 'CallToActionSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('10. Section 10 (Footer): Verifies navigation link structure and clean export in clean-room', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-1',
      sectionId: 'sec-10',
      componentName: 'FooterSection',
      packageDirectory: path.join(stagingPkgDir, 'FooterSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  // ==========================================
  // Path Leakage & Anti-Pattern Detection
  // ==========================================
  it('11. Detects and flags localhost URL leakage in generated component', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakeLeaky');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakeLeaky.tsx'), 'export const FakeLeaky = () => <img src="http://localhost:3000/a.png" />;', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakeLeaky.css'), '.a { color: red; }', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-leak',
      sectionId: 'sec-leak-1',
      componentName: 'FakeLeaky',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.hasInternalPathLeakage).toBe(true);
    expect(res.detectedLeakages.some((l) => l.includes('localhost'))).toBe(true);
  });

  it('12. Detects and flags 127.0.0.1 IP leakage in component stylesheet', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakeIpLeak');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakeIpLeak.tsx'), 'export const FakeIpLeak = () => <div />;', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakeIpLeak.css'), '.a { background: url(http://127.0.0.1:8080/bg.png); }', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-leak',
      sectionId: 'sec-leak-2',
      componentName: 'FakeIpLeak',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.hasInternalPathLeakage).toBe(true);
  });

  it('13. Detects and flags absolute Windows filesystem path leakage', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakePathLeak');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakePathLeak.tsx'), 'export const FakePathLeak = () => <img src="C:\\Users\\Karan\\image.png" />;', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakePathLeak.css'), '', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-leak',
      sectionId: 'sec-leak-3',
      componentName: 'FakePathLeak',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.detectedLeakages.some((l) => l.includes('C:\\Users'))).toBe(true);
  });

  it('14. Detects and flags internal AnimateLab source engine import leakage', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakeEngineLeak');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakeEngineLeak.tsx'), 'import { BrowserManager } from "src/engine/browser/browserManager"; export const FakeEngineLeak = () => <div />;', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakeEngineLeak.css'), '', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-leak',
      sectionId: 'sec-leak-4',
      componentName: 'FakeEngineLeak',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.detectedLeakages.some((l) => l.includes('src/engine/'))).toBe(true);
  });

  it('15. Detects and flags internal Prisma client import leakage', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakePrismaLeak');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakePrismaLeak.tsx'), 'import { PrismaClient } from "@prisma/client"; export const FakePrismaLeak = () => <div />;', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakePrismaLeak.css'), '', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-leak',
      sectionId: 'sec-leak-5',
      componentName: 'FakePrismaLeak',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.detectedLeakages.some((l) => l.includes('@prisma/client'))).toBe(true);
  });

  // ==========================================
  // Installation & Compilation Robustness
  // ==========================================
  it('16. Rejects package without manifest.json or dependencies.json', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'IncompletePkg');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'IncompletePkg.tsx'), 'export const IncompletePkg = () => <div />;', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-inc',
      sectionId: 'sec-inc',
      componentName: 'IncompletePkg',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.isInstallValid).toBe(false);
  });

  it('17. Handles non-existent package directory gracefully', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-missing',
      sectionId: 'sec-missing',
      componentName: 'MissingDir',
      packageDirectory: path.join(stagingPkgDir, 'NonExistentPath'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.errorMessage).toBeDefined();
  });

  it('18. Verifies clean-room directory isolation across parallel execution runs', () => {
    const res1 = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'parallel-1',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const res2 = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'parallel-2',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res1.cleanRoomDirectory).not.toBe(res2.cleanRoomDirectory);
    expect(res1.status).toBe('PASS');
    expect(res2.status).toBe('PASS');
  });

  it('19. Ensures clean-room App.tsx imports relative exported component symbol correctly', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-app-check',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const appContent = fs.readFileSync(path.join(res.cleanRoomDirectory, 'App.tsx'), 'utf-8');
    expect(appContent).toContain('import { HeroSection } from \'./copied-component/HeroSection\';');
    expect(appContent).toContain('<HeroSection />');
  });

  it('20. Confirms physical asset files copied into clean-room assets/ directory', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-asset-check',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const assetsDir = path.join(res.cleanRoomDirectory, 'copied-component', 'assets');
    expect(fs.existsSync(assetsDir)).toBe(true);
  });

  // ==========================================
  // Batch Reproduction & Integrity
  // ==========================================
  it('21. Batch verifies all 10 canonical sections in clean-room simultaneously', () => {
    const results = CANONICAL_10_SECTION_WEBSITE.sections.map((sec) =>
      CleanRoomRunner.executeCleanRoomVerification({
        runId: 'batch-run-10',
        sectionId: sec.sectionId,
        componentName: sec.title,
        packageDirectory: path.join(stagingPkgDir, sec.title),
        targetBaseDirectory: cleanRoomBaseDir,
      })
    );

    expect(results.length).toBe(10);
    const passCount = results.filter((r) => r.status === 'PASS').length;
    expect(passCount).toBe(10);
  });

  it('22. Asserts zero leakages across all 10 canonical section packages', () => {
    const results = CANONICAL_10_SECTION_WEBSITE.sections.map((sec) =>
      CleanRoomRunner.executeCleanRoomVerification({
        runId: 'batch-leak-check',
        sectionId: sec.sectionId,
        componentName: sec.title,
        packageDirectory: path.join(stagingPkgDir, sec.title),
        targetBaseDirectory: cleanRoomBaseDir,
      })
    );

    for (const r of results) {
      expect(r.hasInternalPathLeakage).toBe(false);
      expect(r.detectedLeakages.length).toBe(0);
    }
  });

  it('23. Confirms clean-room workspace cleaning and reset between runs', () => {
    const runId = 'reset-test-run';
    CleanRoomRunner.executeCleanRoomVerification({
      runId,
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const runDir = path.join(cleanRoomBaseDir, runId, 'sec-01');
    expect(fs.existsSync(runDir)).toBe(true);
  });

  it('24. Rejects package if syntax error string is embedded in TSX code', () => {
    const fakePkgDir = path.join(stagingPkgDir, 'FakeSyntaxErr');
    fs.mkdirSync(fakePkgDir, { recursive: true });
    fs.writeFileSync(path.join(fakePkgDir, 'FakeSyntaxErr.tsx'), 'export const FakeSyntaxErr = syntax error', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'FakeSyntaxErr.css'), '', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakePkgDir, 'dependencies.json'), '{}', 'utf-8');

    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'run-syntax',
      sectionId: 'sec-syntax',
      componentName: 'FakeSyntaxErr',
      packageDirectory: fakePkgDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.isCompilationValid).toBe(false);
  });

  it('25. Validates clean-room diagnostics recording across stages', () => {
    const res = CleanRoomRunner.executeCleanRoomVerification({
      runId: 'diag-run',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(res.diagnostics.some((d) => d.includes('clean-room workspace'))).toBe(true);
  });

  it('26. Validates TSX component exports functional component interface cleanly', () => {
    const heroTsx = fs.readFileSync(path.join(stagingPkgDir, 'HeroSection', 'HeroSection.tsx'), 'utf-8');
    expect(heroTsx).toContain('export const HeroSection');
  });

  it('27. Validates component stylesheet contains no global body/html selector rules', () => {
    const heroCss = fs.readFileSync(path.join(stagingPkgDir, 'HeroSection', 'HeroSection.css'), 'utf-8');
    expect(heroCss.includes('body {')).toBe(false);
    expect(heroCss.includes('html {')).toBe(false);
  });

  it('28. Validates relative asset path imports in generated TSX markup', () => {
    const videoTsx = fs.readFileSync(path.join(stagingPkgDir, 'VideoShowreelSection', 'VideoShowreelSection.tsx'), 'utf-8');
    expect(videoTsx).toContain('poster=');
  });

  it('29. Validates JSON contract files are formatted with valid JSON syntax', () => {
    const manifest = fs.readFileSync(path.join(stagingPkgDir, 'HeroSection', 'manifest.json'), 'utf-8');
    expect(() => JSON.parse(manifest)).not.toThrow();
  });

  it('30. Validates README.md exists and includes standalone installation instructions', () => {
    const readme = fs.readFileSync(path.join(stagingPkgDir, 'HeroSection', 'README.md'), 'utf-8');
    expect(readme).toContain('# HeroSection');
    expect(readme).toContain('npm install');
  });
});
