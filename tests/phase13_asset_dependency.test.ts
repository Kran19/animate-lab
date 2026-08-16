import { describe, it, expect } from 'vitest';
import { AssetOwnershipAnalyzer } from '../src/engine/extraction/assetOwnershipAnalyzer';
import { DependencyManifestGenerator } from '../src/engine/extraction/dependencyManifestGenerator';
import { AnimationOwnershipAnalyzer } from '../src/engine/extraction/animationOwnershipAnalyzer';

describe('Phase 13 — Asset Ownership, Deduplication & Dependency Manifest Suite (18 Tests)', () => {
  // ==========================================
  // Asset Ownership & Deduplication
  // ==========================================
  it('1. Distributes assets to owning sections based on HTML and CSS references', () => {
    const rawAssets = [
      { id: 'hero-bg', originalUrl: 'https://site.com/hero.webp', localPath: 'mock/hero.webp', mimeType: 'image/webp', sizeBytes: 50000 },
      { id: 'logo-svg', originalUrl: 'https://site.com/logo.svg', localPath: 'mock/logo.svg', mimeType: 'image/svg+xml', sizeBytes: 2400 },
    ];

    const sections = [
      { sectionId: 'sec-hero', domSelector: '.hero', htmlContent: '<img src="https://site.com/hero.webp" />', cssContent: '' },
      { sectionId: 'sec-footer', domSelector: '.footer', htmlContent: '<img src="https://site.com/logo.svg" />', cssContent: '' },
    ];

    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, sections);
    expect(inventory.length).toBe(2);

    const heroAsset = inventory.find((a) => a.assetId === 'hero-bg');
    expect(heroAsset?.owningSectionId).toBe('sec-hero');
    expect(heroAsset?.ownershipScope).toBe('SECTION_LOCAL');

    const footerAsset = inventory.find((a) => a.assetId === 'logo-svg');
    expect(footerAsset?.owningSectionId).toBe('sec-footer');
  });

  it('2. Classifies assets used in multiple sections as SECTION_SHARED', () => {
    const rawAssets = [
      { id: 'shared-font', originalUrl: 'https://site.com/font.woff2', localPath: 'mock/font.woff2', mimeType: 'font/woff2' },
    ];

    const sections = [
      { sectionId: 'sec-1', domSelector: '.sec-1', htmlContent: '', cssContent: 'font-family: url(https://site.com/font.woff2)' },
      { sectionId: 'sec-2', domSelector: '.sec-2', htmlContent: '', cssContent: 'font-family: url(https://site.com/font.woff2)' },
    ];

    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, sections);
    expect(inventory[0].ownershipScope).toBe('SECTION_SHARED');
  });

  it('3. Classifies unreferenced page-wide assets as GLOBAL', () => {
    const rawAssets = [
      { id: 'favicon', originalUrl: 'https://site.com/favicon.ico', localPath: 'mock/fav.ico', mimeType: 'image/x-icon' },
    ];
    const sections = [
      { sectionId: 'sec-1', domSelector: '.sec-1', htmlContent: '<div />', cssContent: '' },
    ];

    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, sections);
    expect(inventory[0].ownershipScope).toBe('GLOBAL');
  });

  it('4. Attaches content-addressable SHA-256 hash to every asset item', () => {
    const rawAssets = [
      { id: 'img-1', originalUrl: 'https://site.com/img.png', localPath: 'mock/img.png', mimeType: 'image/png', contentHash: 'sha256-abcdef123456' },
    ];
    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, []);
    expect(inventory[0].contentHash).toBe('sha256-abcdef123456');
  });

  it('5. Rewrites export path to portable relative directory structure', () => {
    const rawAssets = [
      { id: 'texture', originalUrl: 'https://site.com/assets/textures/noise.webp', localPath: 'mock/noise.webp', mimeType: 'image/webp' },
    ];
    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, []);
    expect(inventory[0].exportPath).toBe('assets/noise.webp');
  });

  it('6. Identifies Lottie and animated video media assets', () => {
    const rawAssets = [
      { id: 'lottie-1', originalUrl: 'https://site.com/anim.json', localPath: 'mock/anim.json', mimeType: 'application/json' },
    ];
    const inventory = AssetOwnershipAnalyzer.distributeAssets(rawAssets, []);
    expect(inventory[0].isAnimated).toBe(true);
  });

  // ==========================================
  // Dependency Manifest Generation
  // ==========================================
  it('7. Generates core React and ReactDOM npm dependencies by default', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: [],
      animations: [],
    });

    expect(manifest.npm['react']).toBeDefined();
    expect(manifest.npm['react-dom']).toBeDefined();
  });

  it('8. Injects GSAP dependency and unmount cleanup requirement when GSAP is detected', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: ['GSAP'],
      animations: [{ technology: 'GSAP' }],
    });

    expect(manifest.npm['gsap']).toBe('^3.12.5');
    expect(manifest.cleanupRequirements.some((c) => c.includes('Kill GSAP'))).toBe(true);
  });

  it('9. Injects ScrollTrigger observers (IntersectionObserver, ResizeObserver)', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: ['ScrollTrigger'],
      animations: [{ technology: 'ScrollTrigger' }],
    });

    expect(manifest.browserApis).toContain('IntersectionObserver');
    expect(manifest.browserApis).toContain('ResizeObserver');
  });

  it('10. Injects Three.js npm package and WebGL2 runtime assumptions', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: ['Three.js', 'WebGL'],
      animations: [{ technology: 'THREE_JS' }],
    });

    expect(manifest.npm['three']).toBeDefined();
    expect(manifest.runtime).toContain('WebGL2');
    expect(manifest.initializationRequirements.some((i) => i.includes('WebGLRenderer'))).toBe(true);
  });

  it('11. Injects Lottie-web npm dependency for JSON animations', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: ['Lottie'],
      animations: [{ technology: 'LOTTIE' }],
    });

    expect(manifest.npm['lottie-web']).toBe('^5.12.0');
    expect(manifest.cleanupRequirements.some((c) => c.includes('animationInstance.destroy()'))).toBe(true);
  });

  it('12. Includes font family dependencies in manifest', () => {
    const manifest = DependencyManifestGenerator.generateManifest({
      technologies: [],
      animations: [],
      fonts: [{ family: 'ClashDisplay-Bold' }],
    });

    expect(manifest.fonts).toContain('ClashDisplay-Bold');
  });

  // ==========================================
  // Animation Mapping & Ownership
  // ==========================================
  it('13. Maps GSAP timeline animation to owning hero section', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a1', name: 'heroReveal', type: 'GSAP', affectedElements: '.hero-title', durationMs: 1200 }],
      [{ sectionId: 'sec-hero', domSelector: '.hero', domNodeSelectors: ['.hero-title'] }]
    );

    expect(mapped[0].ownerSectionId).toBe('sec-hero');
    expect(mapped[0].technology).toBe('GSAP');
    expect(mapped[0].status).toBe('SUPPORTED');
  });

  it('14. Maps CSS Keyframe infinite marquee animation', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a2', name: 'marqueeLoop', type: 'CSS_KEYFRAMES', affectedElements: '.track', durationMs: 20000, trigger: 'continuous' }],
      [{ sectionId: 'sec-marquee', domSelector: '.marquee', domNodeSelectors: ['.track'] }]
    );

    expect(mapped[0].ownerSectionId).toBe('sec-marquee');
    expect(mapped[0].trigger).toBe('continuous');
  });

  it('15. Classifies Three.js WebGL animation as PARTIAL with diagnostic note', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a3', name: 'globeRender', type: 'THREE_JS', affectedElements: '#canvas', durationMs: 16 }],
      [{ sectionId: 'sec-globe', domSelector: '.globe', domNodeSelectors: ['#canvas'] }]
    );

    expect(mapped[0].status).toBe('PARTIAL');
    expect(mapped[0].notes).toContain('Advanced rendering runtime');
  });

  it('16. Maps CSS Transition hover trigger to CTA button', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a4', name: 'buttonHover', type: 'CSS_TRANSITION', affectedElements: '.btn', durationMs: 300, trigger: 'hover' }],
      [{ sectionId: 'sec-cta', domSelector: '.cta', domNodeSelectors: ['.btn'] }]
    );

    expect(mapped[0].trigger).toBe('hover');
    expect(mapped[0].durationMs).toBe(300);
  });

  it('17. Maps WAAPI animation timeline properties accurately', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a5', name: 'waapiFade', type: 'WAAPI', affectedElements: '.card', durationMs: 600 }],
      [{ sectionId: 'sec-card', domSelector: '.card-container', domNodeSelectors: ['.card'] }]
    );

    expect(mapped[0].technology).toBe('WAAPI');
  });

  it('18. Preserves unhandled animations by assigning to first matching section boundary', () => {
    const mapped = AnimationOwnershipAnalyzer.mapAnimationsToSections(
      [{ id: 'a6', name: 'orphanAnim', type: 'GSAP', affectedElements: '.unknown-node' }],
      [{ sectionId: 'sec-fallback', domSelector: '.main', domNodeSelectors: ['.main'] }]
    );

    expect(mapped[0].ownerSectionId).toBe('sec-fallback');
  });
});
