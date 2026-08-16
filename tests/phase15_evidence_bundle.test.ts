import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EvidenceBundleBuilder } from '../src/engine/package/evidenceBundleBuilder';
import { AssetDependencyGraph } from '../src/engine/resources/assetDependencyGraph';
import fs from 'fs';
import path from 'path';

describe('Phase 15 — Forensic Evidence Bundle & Asset Graph Suite (25 Tests)', () => {
  const testPkgDir = path.join(process.cwd(), 'workspaces', 'test_p15_bundle_pkg');

  beforeAll(() => {
    if (fs.existsSync(testPkgDir)) fs.rmSync(testPkgDir, { recursive: true, force: true });
    fs.mkdirSync(testPkgDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testPkgDir)) fs.rmSync(testPkgDir, { recursive: true, force: true });
  });

  // ==========================================
  // Evidence Bundle Generation & Verification
  // ==========================================
  it('1. Generates complete evidence/ directory structure inside package', () => {
    const res = EvidenceBundleBuilder.buildEvidenceBundle({
      packageDirectory: testPkgDir,
      domHtml: '<header class="hero"><h1>Title</h1></header>',
      computedStyles: { '.hero': { display: 'flex', minHeight: '100vh' } },
      geometry: { x: 0, y: 0, width: 1440, height: 900 },
      typography: [{ fontFamily: 'Inter', fontWeight: 700 }],
      animations: [{ name: 'heroReveal', mechanism: 'GSAP', durationMs: 1000 }],
      interactions: [{ trigger: 'hover', target: '.cta-btn' }],
      resources: [{ url: 'https://site.com/hero.webp', mimeType: 'image/webp' }],
      network: [{ url: 'https://site.com/hero.webp', status: 200, sizeBytes: 54000 }],
    });

    expect(fs.existsSync(res.evidenceDir)).toBe(true);
    expect(res.filesCreated.length).toBeGreaterThanOrEqual(9);
  });

  it('2. Verifies evidence/dom.html contains original extracted DOM snapshot', () => {
    const dom = fs.readFileSync(path.join(testPkgDir, 'evidence', 'dom.html'), 'utf-8');
    expect(dom).toContain('<header class="hero"><h1>Title</h1></header>');
  });

  it('3. Verifies evidence/computed-styles.json is valid and contains CSS rules', () => {
    const styles = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'computed-styles.json'), 'utf-8'));
    expect(styles['.hero'].display).toBe('flex');
  });

  it('4. Verifies evidence/geometry.json records bounding box bounds', () => {
    const geo = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'geometry.json'), 'utf-8'));
    expect(geo.width).toBe(1440);
    expect(geo.height).toBe(900);
  });

  it('5. Verifies evidence/typography.json contains font requirements', () => {
    const typo = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'typography.json'), 'utf-8'));
    expect(typo[0].fontFamily).toBe('Inter');
  });

  it('6. Verifies evidence/animations.json records timeline mechanisms', () => {
    const anim = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'animations.json'), 'utf-8'));
    expect(anim[0].mechanism).toBe('GSAP');
  });

  it('7. Verifies evidence/interactions.json records observable triggers', () => {
    const inter = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'interactions.json'), 'utf-8'));
    expect(inter[0].trigger).toBe('hover');
  });

  it('8. Verifies evidence/resources.json records network resource URLs', () => {
    const res = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'resources.json'), 'utf-8'));
    expect(res[0].mimeType).toBe('image/webp');
  });

  it('9. Verifies evidence/network.json records request statuses and byte sizes', () => {
    const net = JSON.parse(fs.readFileSync(path.join(testPkgDir, 'evidence', 'network.json'), 'utf-8'));
    expect(net[0].status).toBe(200);
    expect(net[0].sizeBytes).toBe(54000);
  });

  it('10. Verifies evidence/screenshots/ includes desktop 0% scroll checkpoint', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'desktop-0.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('11. Verifies evidence/screenshots/ includes desktop 25% scroll checkpoint', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'desktop-25.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('12. Verifies evidence/screenshots/ includes desktop 50% scroll checkpoint', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'desktop-50.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('13. Verifies evidence/screenshots/ includes desktop 75% scroll checkpoint', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'desktop-75.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('14. Verifies evidence/screenshots/ includes desktop 100% scroll checkpoint', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'desktop-100.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('15. Verifies evidence/screenshots/ includes tablet viewport screenshot', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'tablet.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  it('16. Verifies evidence/screenshots/ includes mobile viewport screenshot', () => {
    const scPath = path.join(testPkgDir, 'evidence', 'screenshots', 'mobile.png');
    expect(fs.existsSync(scPath)).toBe(true);
  });

  // ==========================================
  // Asset Dependency Graph Modeling
  // ==========================================
  it('17. Adds and retrieves section-local asset nodes from graph', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({
      id: 'asset-hero-img',
      originalUrl: 'https://site.com/hero.jpg',
      exportPath: 'assets/hero.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 82000,
      contentHash: 'sha256-hero',
      scope: 'SECTION_LOCAL',
      owningSectionId: 'sec-01',
      isRequired: true,
    });

    const assets = graph.getAssetsForSection('sec-01');
    expect(assets.length).toBe(1);
    expect(assets[0].id).toBe('asset-hero-img');
  });

  it('18. Includes shared assets across different sections', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({
      id: 'shared-logo',
      originalUrl: 'https://site.com/logo.svg',
      exportPath: 'assets/logo.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 1500,
      contentHash: 'sha256-logo',
      scope: 'SECTION_SHARED',
      owningSectionId: 'sec-01',
      isRequired: true,
    });

    const assetsForSec2 = graph.getAssetsForSection('sec-02');
    expect(assetsForSec2.length).toBe(1);
    expect(assetsForSec2[0].id).toBe('shared-logo');
  });

  it('19. Computes 100% asset completeness ratio when all required assets are present', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({
      id: 'img1',
      originalUrl: 'u1',
      exportPath: 'p1',
      mimeType: 'image/png',
      sizeBytes: 5000,
      contentHash: 'h1',
      scope: 'SECTION_LOCAL',
      owningSectionId: 'sec-01',
      isRequired: true,
    });

    const res = graph.computeAssetCompleteness('sec-01');
    expect(res.completenessRatio).toBe(100);
    expect(res.totalAvailable).toBe(1);
  });

  it('20. Detects asset completeness degradation when a required asset has 0 byte payload', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({
      id: 'img-broken',
      originalUrl: 'u2',
      exportPath: 'p2',
      mimeType: 'image/png',
      sizeBytes: 0,
      contentHash: 'h2',
      scope: 'SECTION_LOCAL',
      owningSectionId: 'sec-01',
      isRequired: true,
    });

    const res = graph.computeAssetCompleteness('sec-01');
    expect(res.completenessRatio).toBe(0);
  });

  it('21. Returns all assets in graph via getAllAssets', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({ id: 'a1', originalUrl: 'u1', exportPath: 'p1', mimeType: 'm', sizeBytes: 100, contentHash: 'h1', scope: 'SECTION_LOCAL', owningSectionId: 's1', isRequired: true });
    graph.addAsset({ id: 'a2', originalUrl: 'u2', exportPath: 'p2', mimeType: 'm', sizeBytes: 200, contentHash: 'h2', scope: 'SECTION_LOCAL', owningSectionId: 's2', isRequired: true });

    expect(graph.getAllAssets().length).toBe(2);
  });

  it('22. Handles section with zero assets returning 100% completeness', () => {
    const graph = new AssetDependencyGraph();
    const res = graph.computeAssetCompleteness('sec-empty');
    expect(res.completenessRatio).toBe(100);
  });

  it('23. Evidence bundle builder is idempotent on repeated execution', () => {
    const res1 = EvidenceBundleBuilder.buildEvidenceBundle({
      packageDirectory: testPkgDir,
      domHtml: '<div />',
      computedStyles: {},
      geometry: {},
      typography: [],
      animations: [],
      interactions: [],
      resources: [],
      network: [],
    });

    const res2 = EvidenceBundleBuilder.buildEvidenceBundle({
      packageDirectory: testPkgDir,
      domHtml: '<div />',
      computedStyles: {},
      geometry: {},
      typography: [],
      animations: [],
      interactions: [],
      resources: [],
      network: [],
    });

    expect(res1.filesCreated.length).toBe(res2.filesCreated.length);
  });

  it('24. Verifies global asset scope is shared to all section queries', () => {
    const graph = new AssetDependencyGraph();
    graph.addAsset({
      id: 'global-font',
      originalUrl: 'https://site.com/font.woff2',
      exportPath: 'assets/font.woff2',
      mimeType: 'font/woff2',
      sizeBytes: 32000,
      contentHash: 'sha256-font',
      scope: 'GLOBAL',
      owningSectionId: 'global',
      isRequired: true,
    });

    expect(graph.getAssetsForSection('sec-99').length).toBe(1);
  });

  it('25. Verifies all 9 evidence bundle files exist on disk simultaneously', () => {
    const expectedFiles = [
      'evidence/dom.html',
      'evidence/computed-styles.json',
      'evidence/geometry.json',
      'evidence/typography.json',
      'evidence/animations.json',
      'evidence/interactions.json',
      'evidence/resources.json',
      'evidence/network.json',
      'evidence/screenshots/desktop-0.png',
    ];

    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(testPkgDir, file))).toBe(true);
    }
  });
});
