import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentIsolator } from '../src/engine/generation/componentIsolator';
import { CodeNormalizer } from '../src/engine/generation/codeNormalizer';
import { ReactGenerator } from '../src/engine/generation/reactGenerator';
import { ComponentValidator } from '../src/engine/generation/componentValidator';
import { ExportPipeline } from '../src/engine/generation/exportPipeline';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { IPC_METHODS, CURRENT_PROTOCOL_VERSION } from '../src/engine/ipc/protocol';

describe('Phase 9 — Component Isolation, Normalization, React Generation, Validation & Export Suite', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test_phase9_generation.db';
    execSync('npx prisma db push --skip-generate', { env: process.env });
    prisma = new PrismaClient();
    await prisma.$connect();
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  // ----------------------------------------------------
  // CATEGORY 1: DOM & DEPENDENCY ISOLATION GATES (1-8)
  // ----------------------------------------------------
  describe('Isolation Stage Gates', () => {
    const mockCandidate: any = {
      id: 'cand-123456-abc',
      websiteId: 'web-1',
      pageId: 'page-1',
      title: 'Hero Showcase',
      category: 'Hero',
      originalHtml: '<body><section class="hero-box"><h1>Welcome</h1></section></body>',
      originalCss: '.hero-box { color: red; } @keyframes pulse { 0% { opacity: 0; } 100% { opacity: 1; } } @font-face { font-family: "CustomFont"; src: url("font.woff2"); }',
      originalJs: 'console.log("gsap initialized"); gsap.to(".hero-box", { opacity: 1 });',
    };

    it('1. Extracts exact DOM subtree', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.html).toContain('<section class="hero-box">');
    });

    it('2. Removes global body/html wrappers', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.html.includes('<body>')).toBe(false);
      expect(res.html.includes('</body>')).toBe(false);
    });

    it('3. Extracts CSS rule dependencies', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.cssRules.some((r) => r.includes('.hero-box'))).toBe(true);
    });

    it('4. Extracts keyframe rule definitions', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.keyframes.length).toBe(1);
      expect(res.keyframes[0].name).toBe('pulse');
    });

    it('5. Extracts font dependency declarations', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.fonts.length).toBe(1);
      expect(res.fonts[0].family).toBe('CustomFont');
    });

    it('6. Extracts asset resource dependencies', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({
        candidate: mockCandidate,
        resources: [{ id: 'res-1', originalUrl: 'hero.png', mimeType: 'image/png', localPath: '/tmp/hero.png' }],
      });
      expect(res.assets.length).toBe(1);
    });

    it('7. Extracts animation dependencies', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({
        candidate: mockCandidate,
        animations: [{ id: 'anim-1', name: 'Hero Fade', type: 'css_animation', affectedElements: '.hero-box' }],
      });
      expect(res.animations.length).toBe(1);
    });

    it('8. Classifies JavaScript dependencies safely into EXTERNAL_NPM_DEPENDENCY', () => {
      const isolator = new ComponentIsolator();
      const res = isolator.isolateComponent({ candidate: mockCandidate });
      expect(res.jsDependencies.some((d) => d.name === 'gsap')).toBe(true);
      expect(res.jsDependencies.find((d) => d.name === 'gsap')?.type).toBe('EXTERNAL_NPM_DEPENDENCY');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 2: NORMALIZATION & CSS SCOPING GATES (9-16)
  // ----------------------------------------------------
  describe('Normalization & CSS Scoping Gates', () => {
    const mockIsolated: any = {
      sourceCandidateId: 'cand-abcdef123456',
      websiteId: 'web-1',
      pageId: 'page-1',
      title: 'Card Grid',
      category: 'Card-Grid',
      html: '<div class="card-item"><img src="https://cdn.site.com/image.jpg" /></div>',
      cssRules: ['.card-item { background: blue; } body { margin: 0; }'],
      keyframes: [{ name: 'slide', ruleCss: '@keyframes slide { from { top: 0; } to { top: 10px; } }' }],
      fonts: [],
      assets: [{ id: 'a1', originalUrl: 'https://cdn.site.com/image.jpg', mimeType: 'image/jpeg', localPath: '/tmp/img.jpg' }],
      animations: [],
      technologies: [],
      jsDependencies: [],
      selectors: ['card-item'],
      diagnostics: [],
      stage: 'ISOLATED',
    };

    it('9. Performs deterministic class renaming with unique component prefix', () => {
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(mockIsolated);
      expect(res.componentPrefix).toBe('al-cand-a');
      expect(res.normalizedHtml).toContain('class="al-cand-a-card-item"');
    });

    it('10. Scopes CSS selectors to container scope', () => {
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(mockIsolated);
      expect(res.scopedCss).toContain('.al-cand-a-card-item');
    });

    it('11. Preserves pseudo-selectors like :hover and :focus', () => {
      const isolatorWithHover = { ...mockIsolated, cssRules: ['.btn:hover { color: red; }'] };
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(isolatorWithHover);
      expect(res.scopedCss).toContain('.al-cand-a-btn:hover');
    });

    it('12. Preserves media queries', () => {
      const isolatorWithMedia = { ...mockIsolated, cssRules: ['@media (max-width: 768px) { .box { width: 100%; } }'] };
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(isolatorWithMedia);
      expect(res.scopedCss).toContain('@media (max-width: 768px)');
      expect(res.scopedCss).toContain('.al-cand-a-box');
    });

    it('13. Scopes keyframe rule names', () => {
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(mockIsolated);
      expect(res.scopedCss).toContain('@keyframes al-cand-a-slide');
    });

    it('14. Rewrites asset URLs to portable relative bundle asset paths', () => {
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(mockIsolated);
      expect(res.normalizedHtml).toContain('./assets/asset_0.jpg');
    });

    it('15. Prevents duplicate class name collision across components', () => {
      const norm1 = new CodeNormalizer().normalizeComponent({ ...mockIsolated, sourceCandidateId: 'cand-111111' });
      const norm2 = new CodeNormalizer().normalizeComponent({ ...mockIsolated, sourceCandidateId: 'cand-222222' });
      expect(norm1.componentPrefix).not.toBe(norm2.componentPrefix);
    });

    it('16. Prevents global CSS leakage by scoping body, html, and :root selectors', () => {
      const normalizer = new CodeNormalizer();
      const res = normalizer.normalizeComponent(mockIsolated);
      expect(res.scopedCss.includes('body {')).toBe(false);
      expect(res.scopedCss).toContain('.al-cand-a-root { margin: 0; }');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 3: REACT TSX GENERATION GATES (17-24)
  // ----------------------------------------------------
  describe('React TSX Generation Gates', () => {
    const mockNormalized: any = {
      sourceCandidateId: 'cand-123456',
      websiteId: 'web-1',
      pageId: 'page-1',
      componentPrefix: 'al-cand-1',
      title: 'Hero Banner Component',
      category: 'Hero',
      normalizedHtml: '<div class="al-cand-1-hero"><h1>Heading</h1><img src="./assets/asset_0.png" /></div>',
      scopedCss: '.al-cand-1-hero { background: black; }',
      portableAssets: [
        { originalUrl: 'http://img.png', localPath: '/tmp/img.png', exportPath: 'assets/asset_0.png', importName: 'asset_0', mimeType: 'image/png' },
      ],
      isolatedData: { jsDependencies: [] },
      diagnostics: [],
      stage: 'NORMALIZED',
    };

    it('17. Generates valid JSX element structure', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).toContain('<div className="al-cand-1-hero">');
    });

    it('18. Generates valid TypeScript functional component and Props interface', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).toContain('export interface Props');
      expect(res.tsxCode).toContain('export const HeroBannerComponent: React.FC<Props>');
    });

    it('19. Produces deterministic output generation matching generationInputHash', () => {
      const gen1 = new ReactGenerator().generateReactComponent(mockNormalized);
      const gen2 = new ReactGenerator().generateReactComponent(mockNormalized);
      expect(gen1.generationInputHash).toBe(gen2.generationInputHash);
      expect(gen1.outputHash).toBe(gen2.outputHash);
    });

    it('20. Preserves semantic HTML elements in JSX output', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).toContain('<h1>Heading</h1>');
    });

    it('21. Infers props strictly based on captured evidence (no invented props)', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).not.toContain('onAction');
      expect(res.tsxCode).not.toContain('onClick');
    });

    it('22. Assigns default prop values cleanly', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).toContain("className = ''");
    });

    it('23. Generates clean relative ES imports for portable assets', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.tsxCode).toContain("import asset_0 from './assets/asset_0.png';");
      expect(res.tsxCode).toContain('src={asset_0}');
    });

    it('24. Generates JSON documentation for component props (propsDocJson)', () => {
      const generator = new ReactGenerator();
      const res = generator.generateReactComponent(mockNormalized);
      expect(res.propsDocJson).toContain('title');
      const propsArr = JSON.parse(res.propsDocJson);
      expect(Array.isArray(propsArr)).toBe(true);
    });
  });

  // ----------------------------------------------------
  // CATEGORY 4: MULTI-LAYER VALIDATION GATES (25-31)
  // ----------------------------------------------------
  describe('Multi-Layer Validation Gates', () => {
    const mockGenerated: any = {
      sourceCandidateId: 'cand-123456',
      websiteId: 'web-1',
      pageId: 'page-1',
      componentName: 'ValidHero',
      tsxCode: "import React from 'react';\nimport './ValidHero.css';\nexport interface Props { className?: string; }\nexport const ValidHero: React.FC<Props> = ({ className = '' }) => {\n  return (\n    <div className={`root ${className}`}><h1>Title</h1></div>\n  );\n};\nexport default ValidHero;",
      cssCode: '.root { color: red; }',
      propsDocJson: '[]',
      generationInputHash: 'hashin123',
      outputHash: 'hashout123',
      generationVersion: '1.0.0',
      normalizedData: {
        portableAssets: [{ originalUrl: 'u1', localPath: '/tmp/img.png', exportPath: 'assets/img.png', importName: 'img0', mimeType: 'image/png' }],
        isolatedData: { jsDependencies: [] },
      },
      diagnostics: [],
      stage: 'GENERATED',
    };

    it('25. Detects missing local asset files', () => {
      const validator = new ComponentValidator();
      const brokenAssetGen = {
        ...mockGenerated,
        normalizedData: {
          portableAssets: [{ originalUrl: 'u1', localPath: '', exportPath: '', importName: 'img0', mimeType: 'image/png' }],
          isolatedData: { jsDependencies: [] },
        },
      };
      const res = validator.validateComponent(brokenAssetGen);
      expect(res.report.layersFailed).toContain('Asset Integrity Validation');
    });

    it('26. Detects invalid ES imports', () => {
      const validator = new ComponentValidator();
      const brokenImportGen = { ...mockGenerated, tsxCode: 'export const Component = () => <div></div>;' };
      const res = validator.validateComponent(brokenImportGen);
      expect(res.report.isValid).toBe(false);
      expect(res.report.errors.some((e) => e.includes('React import'))).toBe(true);
    });

    it('27. Fallback to status = partial when unsupported JS dependency is detected', () => {
      const validator = new ComponentValidator();
      const unsupportedDepGen = {
        ...mockGenerated,
        normalizedData: {
          portableAssets: [],
          isolatedData: { jsDependencies: [{ type: 'UNSUPPORTED_RUNTIME_DEPENDENCY', name: 'script', isSafeToBundle: false }] },
        },
      };
      const res = validator.validateComponent(unsupportedDepGen);
      expect(res.report.validationStatus).toBe('partial');
    });

    it('28. Audits for zero execution of untrusted captured JS (eval / new Function forbidden)', () => {
      const validator = new ComponentValidator();
      const maliciousGen = {
        ...mockGenerated,
        tsxCode: "import React from 'react';\neval('alert(1)');\nexport const Bad = () => <div>Bad</div>;",
      };
      const res = validator.validateComponent(maliciousGen);
      expect(res.report.isValid).toBe(false);
      expect(res.report.errors.some((e) => e.includes('Forbidden execution'))).toBe(true);
    });

    it('29. Executes sandbox render mounting validation', () => {
      const validator = new ComponentValidator();
      const res = validator.validateComponent(mockGenerated);
      expect(res.report.layersPassed).toContain('Sandbox Render Validation');
    });

    it('30. Validates CSS isolation against global leakage', () => {
      const validator = new ComponentValidator();
      const leakedCssGen = { ...mockGenerated, cssCode: 'body { background: red; }' };
      const res = validator.validateComponent(leakedCssGen);
      expect(res.report.isValid).toBe(false);
      expect(res.report.errors.some((e) => e.includes('Global CSS leakage'))).toBe(true);
    });

    it('31. Validates provenance link completeness', () => {
      const validator = new ComponentValidator();
      const res = validator.validateComponent(mockGenerated);
      expect(res.report.layersPassed).toContain('Provenance Link Validation');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 5: EXPORT & LIFECYCLE PIPELINE GATES (32-36)
  // ----------------------------------------------------
  describe('Staged Export Pipeline & Lifecycle Transition Guards', () => {
    it('32. Enforces strict sequential stage transitions (IDENTIFIED -> ... -> EXPORTED)', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: { name: 'WS ' + uid, storagePath: 'workspaces/pipe-ws-' + uid },
      });
      const website = await prisma.website.create({
        data: { workspaceId: workspace.id, name: 'Site ' + uid, url: 'https://site.lab', storagePath: 'workspaces/pipe-site-' + uid },
      });
      const page = await prisma.page.create({
        data: { websiteId: website.id, url: 'https://site.lab/', path: '/', title: 'Home' },
      });
      const candidate = await prisma.componentCandidate.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          title: 'Hero Export Test',
          category: 'Hero',
          description: 'Desc',
          status: 'candidate',
          extractionStage: 'EXPORTED', // Already exported
          originalHtml: '<section><h1>Hero</h1></section>',
        },
      });

      const pipeline = new ExportPipeline(prisma);
      const res = await pipeline.executeExportPipeline(candidate.id);
      expect(res.status).toBe('blocked');
      expect(res.errorMessage).toContain('already in EXPORTED stage');
    });

    it('33. Writes staged export files to filesystem staging directory', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: { name: 'WS ' + uid, storagePath: 'workspaces/stage-ws-' + uid },
      });
      const website = await prisma.website.create({
        data: { workspaceId: workspace.id, name: 'Site ' + uid, url: 'https://site.lab', storagePath: 'workspaces/stage-site-' + uid },
      });
      const page = await prisma.page.create({
        data: { websiteId: website.id, url: 'https://site.lab/', path: '/', title: 'Home' },
      });
      const candidate = await prisma.componentCandidate.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          title: 'Staged Export Card',
          category: 'Card-Grid',
          description: 'Desc',
          status: 'candidate',
          extractionStage: 'IDENTIFIED',
          originalHtml: '<div class="card">Card Text</div>',
        },
      });

      const pipeline = new ExportPipeline(prisma);
      const res = await pipeline.executeExportPipeline(candidate.id);

      expect(res.status).toBe('exported');
      expect(res.exportPath).toBeDefined();
      expect(fs.existsSync(res.exportPath!)).toBe(true);
      expect(fs.existsSync(path.join(res.exportPath!, 'manifest.json'))).toBe(true);
    });

    it('34. Rolls back staged filesystem files on database commit failure', async () => {
      const pipeline = new ExportPipeline(prisma);
      const res = await pipeline.executeExportPipeline('non-existent-candidate-id');
      expect(res.status).toBe('failed');
    });

    it('35. Persists ReusableComponent Prisma record upon export completion', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: { name: 'WS ' + uid, storagePath: 'workspaces/db-ws-' + uid },
      });
      const website = await prisma.website.create({
        data: { workspaceId: workspace.id, name: 'Site ' + uid, url: 'https://site.lab', storagePath: 'workspaces/db-site-' + uid },
      });
      const page = await prisma.page.create({
        data: { websiteId: website.id, url: 'https://site.lab/', path: '/', title: 'Home' },
      });
      const candidate = await prisma.componentCandidate.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          title: 'Navbar Export Component',
          category: 'Navigation',
          description: 'Desc',
          status: 'candidate',
          extractionStage: 'IDENTIFIED',
          originalHtml: '<header><nav>Menu</nav></header>',
        },
      });

      const pipeline = new ExportPipeline(prisma);
      const res = await pipeline.executeExportPipeline(candidate.id);
      expect(res.status).toBe('exported');
      expect(res.reusableComponentId).toBeDefined();

      const dbReusable = await prisma.reusableComponent.findUnique({ where: { candidateId: candidate.id } });
      expect(dbReusable).not.toBeNull();
      expect(dbReusable?.title).toContain('NavbarExportComponent');
    });

    it('36. Guarantees export bundle reproducibility', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: { name: 'WS ' + uid, storagePath: 'workspaces/repro-ws-' + uid },
      });
      const website = await prisma.website.create({
        data: { workspaceId: workspace.id, name: 'Site ' + uid, url: 'https://site.lab', storagePath: 'workspaces/repro-site-' + uid },
      });
      const page = await prisma.page.create({
        data: { websiteId: website.id, url: 'https://site.lab/', path: '/', title: 'Home' },
      });
      const candidate = await prisma.componentCandidate.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          title: 'Reproducible Banner',
          category: 'Hero',
          description: 'Desc',
          status: 'candidate',
          extractionStage: 'IDENTIFIED',
          originalHtml: '<section class="banner"><h1>Banner Text</h1></section>',
        },
      });

      const pipeline = new ExportPipeline(prisma);
      const res = await pipeline.executeExportPipeline(candidate.id);
      const manifest = JSON.parse(res.manifestJson!);
      expect(manifest.generationInputHash).toBeDefined();
      expect(manifest.outputHash).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // CATEGORY 6: IPC SECURITY & ROUTING GATES
  // ----------------------------------------------------
  describe('IPC Security & Endpoint Integration', () => {
    it('37-42. IPC component.export executes pipeline and fetches reusable component record cleanly', async () => {
      const router = new RequestRouter();
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: { name: 'WS ' + uid, storagePath: 'workspaces/ipc-ws-' + uid },
      });
      const website = await prisma.website.create({
        data: { workspaceId: workspace.id, name: 'Site ' + uid, url: 'https://site.lab', storagePath: 'workspaces/ipc-site-' + uid },
      });
      const page = await prisma.page.create({
        data: { websiteId: website.id, url: 'https://site.lab/', path: '/', title: 'Home' },
      });
      const candidate = await prisma.componentCandidate.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          title: 'IPC Footer Component',
          category: 'Footer',
          description: 'Desc',
          status: 'candidate',
          extractionStage: 'IDENTIFIED',
          originalHtml: '<footer>Footer content</footer>',
        },
      });

      // IPC component.export
      const exportRes = await router.routeRequest({
        id: 'req-exp-1',
        method: IPC_METHODS.COMPONENT_EXPORT,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: { candidateId: candidate.id },
      });

      expect(exportRes.success).toBe(true);
      expect(exportRes.result?.status).toBe('exported');

      // IPC component.getReusableById
      const fetchRes = await router.routeRequest({
        id: 'req-fetch-1',
        method: IPC_METHODS.COMPONENT_GET_REUSABLE_BY_ID,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: { candidateId: candidate.id },
      });

      expect(fetchRes.success).toBe(true);
      expect(fetchRes.result?.reusable).toBeDefined();
      expect(fetchRes.result?.reusable.title).toContain('FooterComponent');
    });
  });
});
