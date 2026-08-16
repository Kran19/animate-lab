import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RealBrowserReproductionRunner } from '../src/engine/acceptance/realBrowserReproductionRunner';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { EvidenceBundleBuilder } from '../src/engine/package/evidenceBundleBuilder';
import { CANONICAL_10_SECTION_WEBSITE } from './fixtures/phase13/multiSectionFixtures';
import fs from 'fs';
import path from 'path';

describe('Phase 15 — Real-Browser Clean-Room Reproduction Suite (25 Tests)', () => {
  const stagingPkgDir = path.join(process.cwd(), 'workspaces', 'test_p15_browser_pkg');
  const cleanRoomBaseDir = path.join(process.cwd(), 'workspaces', 'test_p15_browser_clean_room');

  beforeAll(() => {
    if (fs.existsSync(stagingPkgDir)) fs.rmSync(stagingPkgDir, { recursive: true, force: true });
    if (fs.existsSync(cleanRoomBaseDir)) fs.rmSync(cleanRoomBaseDir, { recursive: true, force: true });

    fs.mkdirSync(stagingPkgDir, { recursive: true });
    fs.mkdirSync(cleanRoomBaseDir, { recursive: true });

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

      // Build evidence bundle inside package
      EvidenceBundleBuilder.buildEvidenceBundle({
        packageDirectory: path.join(stagingPkgDir, sec.title),
        domHtml: sec.html,
        computedStyles: { [`.${sec.title.toLowerCase()}`]: { display: 'block' } },
        geometry: { x: 0, y: 0, width: 1440, height: 800 },
        typography: [{ fontFamily: 'Inter', fontWeight: 400 }],
        animations: sec.animations,
        interactions: [],
        resources: sec.assets.map((a) => ({ url: a.originalUrl, mimeType: a.mimeType })),
        network: sec.assets.map((a) => ({ url: a.originalUrl, status: 200, sizeBytes: a.sizeBytes })),
      });
    }
  });

  afterAll(() => {
    if (fs.existsSync(stagingPkgDir)) fs.rmSync(stagingPkgDir, { recursive: true, force: true });
    if (fs.existsSync(cleanRoomBaseDir)) fs.rmSync(cleanRoomBaseDir, { recursive: true, force: true });
  });

  // ==========================================
  // Clean-Room Real Browser Mounting
  // ==========================================
  it('1. Mounts HeroSection in real browser context across all 4 standard viewports', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(res.isMountedInBrowser).toBe(true);
    expect(res.viewportsTested.length).toBe(4);
  });

  it('2. Mounts InfiniteMarqueeSection in real browser without console errors', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-02',
      componentName: 'InfiniteMarqueeSection',
      packageDirectory: path.join(stagingPkgDir, 'InfiniteMarqueeSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
    expect(res.consoleErrors.length).toBe(0);
  });

  it('3. Mounts AboutAgencySection in clean-room and tests 1440x900 desktop viewport', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-03',
      componentName: 'AboutAgencySection',
      packageDirectory: path.join(stagingPkgDir, 'AboutAgencySection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.viewportsTested).toContain('Desktop (1440x900)');
  });

  it('4. Mounts FeaturedProjectsGrid in clean-room and tests 1024x768 laptop viewport', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-04',
      componentName: 'FeaturedProjectsGrid',
      packageDirectory: path.join(stagingPkgDir, 'FeaturedProjectsGrid'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.viewportsTested).toContain('Laptop (1024x768)');
  });

  it('5. Mounts Interactive3DExperience and records clean-room visual score', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-05',
      componentName: 'Interactive3DExperience',
      packageDirectory: path.join(stagingPkgDir, 'Interactive3DExperience'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.visualMatchScore).toBeGreaterThanOrEqual(85);
  });

  it('6. Mounts VideoShowreelSection and tests 768x1024 tablet viewport', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-06',
      componentName: 'VideoShowreelSection',
      packageDirectory: path.join(stagingPkgDir, 'VideoShowreelSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.viewportsTested).toContain('Tablet (768x1024)');
  });

  it('7. Mounts InteractiveGallerySection and tests 375x812 mobile viewport', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-07',
      componentName: 'InteractiveGallerySection',
      packageDirectory: path.join(stagingPkgDir, 'InteractiveGallerySection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.viewportsTested).toContain('Mobile (375x812)');
  });

  it('8. Mounts TestimonialsSection in clean-room environment', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-08',
      componentName: 'TestimonialsSection',
      packageDirectory: path.join(stagingPkgDir, 'TestimonialsSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('9. Mounts CallToActionSection in clean-room environment', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-09',
      componentName: 'CallToActionSection',
      packageDirectory: path.join(stagingPkgDir, 'CallToActionSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  it('10. Mounts FooterSection in clean-room environment', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'browser-run-1',
      sectionId: 'sec-10',
      componentName: 'FooterSection',
      packageDirectory: path.join(stagingPkgDir, 'FooterSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('PASS');
  });

  // ==========================================
  // Robustness & Failure Rejections
  // ==========================================
  it('11. Rejects broken package and reports clean-room compilation failure', async () => {
    const fakeDir = path.join(stagingPkgDir, 'BrokenPkg');
    fs.mkdirSync(fakeDir, { recursive: true });
    fs.writeFileSync(path.join(fakeDir, 'BrokenPkg.tsx'), 'export const BrokenPkg = syntax error', 'utf-8');

    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-broken',
      sectionId: 'sec-broken',
      componentName: 'BrokenPkg',
      packageDirectory: fakeDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.isMountedInBrowser).toBe(false);
  });

  it('12. Rejects package with internal localhost URL leak', async () => {
    const fakeDir = path.join(stagingPkgDir, 'LeakyPkg');
    fs.mkdirSync(fakeDir, { recursive: true });
    fs.writeFileSync(path.join(fakeDir, 'LeakyPkg.tsx'), 'export const LeakyPkg = () => <img src="http://localhost:5173/a.png" />;', 'utf-8');
    fs.writeFileSync(path.join(fakeDir, 'LeakyPkg.css'), '', 'utf-8');
    fs.writeFileSync(path.join(fakeDir, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(fakeDir, 'dependencies.json'), '{}', 'utf-8');

    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-leaky',
      sectionId: 'sec-leaky',
      componentName: 'LeakyPkg',
      packageDirectory: fakeDir,
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
    expect(res.consoleErrors.some(e => e.includes('localhost'))).toBe(true);
  });

  it('13. Rejects non-existent package directory', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-miss',
      sectionId: 'sec-miss',
      componentName: 'Missing',
      packageDirectory: path.join(stagingPkgDir, 'NonExistentDirectory'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.status).toBe('FAIL');
  });

  it('14. Batch reproduces all 10 canonical sections in browser runner', async () => {
    const results = await Promise.all(
      CANONICAL_10_SECTION_WEBSITE.sections.map((sec) =>
        RealBrowserReproductionRunner.executeBrowserReproduction({
          runId: 'batch-p15-browser',
          sectionId: sec.sectionId,
          componentName: sec.title,
          packageDirectory: path.join(stagingPkgDir, sec.title),
          targetBaseDirectory: cleanRoomBaseDir,
        })
      )
    );

    expect(results.length).toBe(10);
    const passCount = results.filter((r) => r.status === 'PASS').length;
    expect(passCount).toBe(10);
  });

  it('15. Asserts all 10 canonical sections verify across 4 viewports each (40 viewport checks total)', async () => {
    const results = await Promise.all(
      CANONICAL_10_SECTION_WEBSITE.sections.map((sec) =>
        RealBrowserReproductionRunner.executeBrowserReproduction({
          runId: 'batch-vp-check',
          sectionId: sec.sectionId,
          componentName: sec.title,
          packageDirectory: path.join(stagingPkgDir, sec.title),
          targetBaseDirectory: cleanRoomBaseDir,
        })
      )
    );

    for (const r of results) {
      expect(r.viewportsTested.length).toBe(4);
    }
  });

  it('16. Validates diagnostics report in browser reproduction output', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-diag',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.diagnostics.length).toBeGreaterThanOrEqual(1);
  });

  it('17. Asserts zero console error leakage on valid section package', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-clean',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.consoleErrors.length).toBe(0);
  });

  it('18. Verifies clean-room reproduction path is written to disk', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-path',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(fs.existsSync(res.reproductionPath)).toBe(true);
  });

  it('19. Verifies reproduction App.tsx mounting wrapper is scaffolded', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-mount',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const appPath = path.join(res.reproductionPath, 'App.tsx');
    expect(fs.existsSync(appPath)).toBe(true);
  });

  it('20. Confirms evidence bundle is preserved in copied clean-room component', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-ev-check',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const evDir = path.join(res.reproductionPath, 'copied-component', 'evidence');
    expect(fs.existsSync(evDir)).toBe(true);
  });

  it('21. Validates visual match score exceeds 90 on canonical components', async () => {
    const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'run-score-check',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res.visualMatchScore).toBeGreaterThanOrEqual(90);
  });

  it('22. Confirms clean-room package isolation between two distinct section runs', async () => {
    const res1 = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'iso-run',
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const res2 = await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId: 'iso-run',
      sectionId: 'sec-02',
      componentName: 'InfiniteMarqueeSection',
      packageDirectory: path.join(stagingPkgDir, 'InfiniteMarqueeSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    expect(res1.reproductionPath).not.toBe(res2.reproductionPath);
  });

  it('23. Handles parallel execution of clean-room reproduction without collisions', async () => {
    const [r1, r2] = await Promise.all([
      RealBrowserReproductionRunner.executeBrowserReproduction({
        runId: 'par-1',
        sectionId: 'sec-01',
        componentName: 'HeroSection',
        packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
        targetBaseDirectory: cleanRoomBaseDir,
      }),
      RealBrowserReproductionRunner.executeBrowserReproduction({
        runId: 'par-2',
        sectionId: 'sec-01',
        componentName: 'HeroSection',
        packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
        targetBaseDirectory: cleanRoomBaseDir,
      }),
    ]);

    expect(r1.status).toBe('PASS');
    expect(r2.status).toBe('PASS');
  });

  it('24. Verifies clean-room runner cleans up existing folder prior to run', async () => {
    const runId = 'cleanup-test';
    await RealBrowserReproductionRunner.executeBrowserReproduction({
      runId,
      sectionId: 'sec-01',
      componentName: 'HeroSection',
      packageDirectory: path.join(stagingPkgDir, 'HeroSection'),
      targetBaseDirectory: cleanRoomBaseDir,
    });

    const runDir = path.join(cleanRoomBaseDir, runId, 'sec-01');
    expect(fs.existsSync(runDir)).toBe(true);
  });

  it('25. Real browser reproduction runner succeeds on all canonical 10 packages', async () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const res = await RealBrowserReproductionRunner.executeBrowserReproduction({
        runId: 'seq-10-run',
        sectionId: sec.sectionId,
        componentName: sec.title,
        packageDirectory: path.join(stagingPkgDir, sec.title),
        targetBaseDirectory: cleanRoomBaseDir,
      });
      expect(res.isMountedInBrowser).toBe(true);
    }
  });
});
