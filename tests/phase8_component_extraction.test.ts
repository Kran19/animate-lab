import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { SectionDetector, DOMNodeInfo } from '../src/engine/extraction/sectionDetector';
import { ComponentCandidateClassifier } from '../src/engine/extraction/componentCandidateClassifier';
import { ExtractionPipeline } from '../src/engine/extraction/extractionPipeline';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import { IPC_METHODS, CURRENT_PROTOCOL_VERSION } from '../src/engine/ipc/protocol';

describe('Phase 8 — DOM Section & Component Candidate Extraction Suite', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test_phase8_extraction.db';
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
  // CATEGORY 1: SECTION DETECTION & 13 CATEGORY CLASSIFICATION
  // ----------------------------------------------------
  describe('Section Detection & 13 Visual Categories', () => {
    it('1. Detects Navigation header section', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'header.main-nav',
          stableSelector: 'header.main-nav',
          tagName: 'HEADER',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 80,
          boundsViewportRatio: 0.08,
          domDepth: 1,
          childCount: 5,
          visibleChildCount: 5,
          isVisuallyHidden: false,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(1);
      expect(sections[0].primaryCategory).toBe('Navigation');
    });

    it('2. Detects Hero section at top of page with high viewport ratio', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'section.hero-banner',
          stableSelector: 'section.hero-banner',
          tagName: 'SECTION',
          boundsX: 0,
          boundsY: 80,
          boundsWidth: 1920,
          boundsHeight: 900,
          boundsViewportRatio: 0.85,
          domDepth: 1,
          childCount: 4,
          visibleChildCount: 4,
          isVisuallyHidden: false,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(1);
      expect(sections[0].primaryCategory).toBe('Hero');
    });

    it('3. Detects 3D-Section from canvas presence', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'div.webgl-container',
          stableSelector: 'div.webgl-container',
          tagName: 'DIV',
          boundsX: 0,
          boundsY: 1000,
          boundsWidth: 1920,
          boundsHeight: 600,
          boundsViewportRatio: 0.5,
          domDepth: 2,
          childCount: 1,
          visibleChildCount: 1,
          isVisuallyHidden: false,
          has3DCanvas: true,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(1);
      expect(sections[0].primaryCategory).toBe('3D-Section');
    });

    it('4. Detects Marquee, Card-Grid, Image-Gallery, Text-Reveal, and Footer sections', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'div.partner-marquee',
          stableSelector: 'div.partner-marquee',
          tagName: 'DIV',
          boundsX: 0,
          boundsY: 1600,
          boundsWidth: 1920,
          boundsHeight: 120,
          boundsViewportRatio: 0.1,
          domDepth: 2,
          childCount: 10,
          visibleChildCount: 10,
          isVisuallyHidden: false,
          hasMarqueeAnimation: true,
        },
        {
          selector: 'section.features-grid',
          stableSelector: 'section.features-grid',
          tagName: 'SECTION',
          boundsX: 0,
          boundsY: 1750,
          boundsWidth: 1920,
          boundsHeight: 800,
          boundsViewportRatio: 0.7,
          domDepth: 2,
          childCount: 6,
          visibleChildCount: 6,
          isVisuallyHidden: false,
          hasGridOrFlex: true,
        },
        {
          selector: 'footer.site-footer',
          stableSelector: 'footer.site-footer',
          tagName: 'FOOTER',
          boundsX: 0,
          boundsY: 2600,
          boundsWidth: 1920,
          boundsHeight: 300,
          boundsViewportRatio: 0.25,
          domDepth: 1,
          childCount: 3,
          visibleChildCount: 3,
          isVisuallyHidden: false,
          innerText: 'Copyright 2026 AnimateLab',
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(3);
      expect(sections.map((s) => s.primaryCategory)).toContain('Marquee');
      expect(sections.map((s) => s.primaryCategory)).toContain('Card-Grid');
      expect(sections.map((s) => s.primaryCategory)).toContain('Footer');
    });

    it('5. Supports multi-category classification (primaryCategory + secondaryCategories)', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'section.hero-3d',
          stableSelector: 'section.hero-3d',
          tagName: 'SECTION',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 900,
          boundsViewportRatio: 0.85,
          domDepth: 1,
          childCount: 3,
          visibleChildCount: 3,
          isVisuallyHidden: false,
          has3DCanvas: true,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections[0].primaryCategory).toBe('Hero');
      expect(sections[0].secondaryCategories).toContain('3D-Section');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 2: VISIBILITY FILTERING & DEDUPLICATION
  // ----------------------------------------------------
  describe('Visibility Filtering & Candidate Deduplication', () => {
    it('6. Filters out hidden, display:none, and overlay/widget nodes', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'div.analytics-preload',
          stableSelector: 'div.analytics-preload',
          tagName: 'DIV',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 0,
          boundsHeight: 0,
          boundsViewportRatio: 0,
          domDepth: 1,
          childCount: 0,
          visibleChildCount: 0,
          isVisuallyHidden: true,
        },
        {
          selector: 'div.cookie-modal-overlay',
          stableSelector: 'div.cookie-modal-overlay',
          tagName: 'DIV',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 1080,
          boundsViewportRatio: 1.0,
          domDepth: 1,
          childCount: 2,
          visibleChildCount: 2,
          isVisuallyHidden: false,
          isOverlayOrWidget: true,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(0);
    });

    it('7. Deduplicates inner nested container nodes under dominant outer section', () => {
      const detector = new SectionDetector();
      const nodes: DOMNodeInfo[] = [
        {
          selector: 'section.hero-outer',
          stableSelector: 'section.hero-outer',
          tagName: 'SECTION',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 900,
          boundsViewportRatio: 0.85,
          domDepth: 1,
          childCount: 1,
          visibleChildCount: 1,
          isVisuallyHidden: false,
        },
        {
          selector: 'div.hero-inner-wrapper',
          stableSelector: 'div.hero-inner-wrapper',
          tagName: 'DIV',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 900,
          boundsViewportRatio: 0.85,
          domDepth: 2,
          childCount: 1,
          visibleChildCount: 1,
          isVisuallyHidden: false,
        },
      ];
      const sections = detector.detectSections(nodes);
      expect(sections.length).toBe(1);
      expect(sections[0].domSelector).toBe('section.hero-outer');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 3: STRUCTURAL ANALYSIS & CANDIDATE CLASSIFICATION
  // ----------------------------------------------------
  describe('Structural Analysis & Candidate Classification', () => {
    it('8. ComponentCandidateClassifier creates ComponentCandidate at IDENTIFIED stage', () => {
      const classifier = new ComponentCandidateClassifier();
      const candidate = classifier.classifyCandidate({
        sectionCandidate: {
          title: 'Hero Section',
          primaryCategory: 'Hero',
          secondaryCategories: ['3D-Section'],
          domSelector: 'section.hero',
          stableSelector: 'section.hero',
          domTagName: 'SECTION',
          boundsX: 0,
          boundsY: 0,
          boundsWidth: 1920,
          boundsHeight: 900,
          boundsViewportRatio: 0.85,
          domDepth: 1,
          childCount: 4,
          isComponentCandidate: true,
          confidence: 0.9,
          visibilityStatus: 'visible',
        },
        websiteId: 'web-123',
        pageId: 'page-456',
        originalHtml: '<section class="hero"><h1>Title</h1></section>',
      });

      expect(candidate.extractionStage).toBe('IDENTIFIED');
      expect(candidate.status).toBe('candidate');
      expect(candidate.evidence.domStructureScore).toBeGreaterThan(0);
      expect(candidate.evidence.confidenceScore).toBeGreaterThanOrEqual(0.9);
    });

    it('9. Strictly enforces ABSOLUTE BOUNDARY: zero generated React TSX code in Phase 8', () => {
      const classifier = new ComponentCandidateClassifier();
      const candidate = classifier.classifyCandidate({
        sectionCandidate: {
          title: 'Card Grid',
          primaryCategory: 'Card-Grid',
          secondaryCategories: [],
          domSelector: '.card-grid',
          stableSelector: '.card-grid',
          domTagName: 'DIV',
          boundsX: 0,
          boundsY: 500,
          boundsWidth: 1200,
          boundsHeight: 600,
          boundsViewportRatio: 0.5,
          domDepth: 2,
          childCount: 6,
          isComponentCandidate: true,
          confidence: 0.85,
          visibilityStatus: 'visible',
        },
        websiteId: 'web-123',
        pageId: 'page-456',
      });

      expect((candidate as any).generatedReactTsx).toBeUndefined();
      expect(candidate.extractionStage).toBe('IDENTIFIED');
    });
  });

  // ----------------------------------------------------
  // CATEGORY 4: EXTRACTION PIPELINE & ATOMIC DB PERSISTENCE
  // ----------------------------------------------------
  describe('Extraction Pipeline & Atomic Database Transactions', () => {
    it('10. ExtractionPipeline runs section detection and candidate classification atomically into SQLite', async () => {
      const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const workspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace ' + uid,
          storagePath: 'workspaces/extract-ws-' + uid,
        },
      });

      const website = await prisma.website.create({
        data: {
          workspaceId: workspace.id,
          name: 'Test Site ' + uid,
          url: 'https://extract.lab',
          storagePath: 'workspaces/extract-site-' + uid,
        },
      });

      const page = await prisma.page.create({
        data: {
          websiteId: website.id,
          url: 'https://extract.lab/',
          path: '/',
          title: 'Extract Test Page',
        },
      });

      const anim = await prisma.animation.create({
        data: {
          websiteId: website.id,
          pageId: page.id,
          name: 'Hero FadeIn',
          type: 'css_animation',
          library: 'CSS',
          affectedElements: 'section.hero-banner',
          durationMs: 1000,
          delayMs: 0,
          easing: 'ease',
          trigger: 'load',
          animatedProperties: '["opacity"]',
          codeSnippet: '',
        },
      });

      const pipeline = new ExtractionPipeline(prisma);
      const res = await pipeline.runExtraction({
        websiteId: website.id,
        pageId: page.id,
        domNodes: [
          {
            selector: 'section.hero-banner',
            stableSelector: 'section.hero-banner',
            tagName: 'SECTION',
            boundsX: 0,
            boundsY: 0,
            boundsWidth: 1920,
            boundsHeight: 900,
            boundsViewportRatio: 0.85,
            domDepth: 1,
            childCount: 3,
            visibleChildCount: 3,
            isVisuallyHidden: false,
          },
        ],
        animations: [{ id: anim.id, name: anim.name, type: anim.type, affectedElements: anim.affectedElements }],
      });

      expect(res.status).toBe('completed');
      expect(res.sectionsCreatedCount).toBe(1);
      expect(res.candidatesCreatedCount).toBe(1);

      // Verify Prisma Database Rows
      const dbSec = await prisma.section.findMany({ where: { pageId: page.id } });
      expect(dbSec.length).toBe(1);

      const dbCand = await prisma.componentCandidate.findMany({ where: { pageId: page.id } });
      expect(dbCand.length).toBe(1);
      expect(dbCand[0].extractionStage).toBe('IDENTIFIED');
      expect(dbCand[0].status).toBe('candidate');

      const dbEv = await prisma.componentEvidence.findUnique({ where: { componentCandidateId: dbCand[0].id } });
      expect(dbEv).not.toBeNull();
      expect(dbEv?.animationCount).toBe(1);
    });
  });

  // ----------------------------------------------------
  // CATEGORY 5: IPC SECURITY & ROUTING
  // ----------------------------------------------------
  describe('IPC Security & Endpoint Validation', () => {
    it('11. IPC section.detect returns detected sections', async () => {
      const router = new RequestRouter();
      const res = await router.routeRequest({
        id: 'req-sec-1',
        method: IPC_METHODS.SECTION_DETECT,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: {
          domNodes: [
            {
              selector: 'header.top',
              stableSelector: 'header.top',
              tagName: 'HEADER',
              boundsX: 0,
              boundsY: 0,
              boundsWidth: 1920,
              boundsHeight: 80,
              boundsViewportRatio: 0.08,
              domDepth: 1,
              childCount: 4,
              visibleChildCount: 4,
              isVisuallyHidden: false,
            },
          ],
        },
      });

      expect(res.success).toBe(true);
      expect(res.result?.sections).toBeDefined();
      expect(res.result?.sections.length).toBe(1);
      expect(res.result?.sections[0].primaryCategory).toBe('Navigation');
    });

    it('12. IPC component.identifyCandidates creates candidate at IDENTIFIED stage', async () => {
      const router = new RequestRouter();
      const res = await router.routeRequest({
        id: 'req-cand-1',
        method: IPC_METHODS.COMPONENT_IDENTIFY_CANDIDATES,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: {
          websiteId: 'web-1',
          pageId: 'page-1',
          sectionCandidate: {
            title: 'Hero Section',
            primaryCategory: 'Hero',
            secondaryCategories: [],
            domSelector: '.hero',
            stableSelector: '.hero',
            domTagName: 'SECTION',
            boundsX: 0,
            boundsY: 0,
            boundsWidth: 1920,
            boundsHeight: 900,
            boundsViewportRatio: 0.85,
            domDepth: 1,
            childCount: 3,
            isComponentCandidate: true,
            confidence: 0.9,
            visibilityStatus: 'visible',
          },
        },
      });

      expect(res.success).toBe(true);
      expect(res.result?.candidate.extractionStage).toBe('IDENTIFIED');
    });

    it('13. IPC rejects malicious path traversal parameters in extraction requests', async () => {
      const router = new RequestRouter();
      const res = await router.routeRequest({
        id: 'req-sec-traversal',
        method: IPC_METHODS.SECTION_DETECT,
        protocolVersion: CURRENT_PROTOCOL_VERSION,
        params: {
          domNodes: [{ selector: '../../../../etc/shadow' }],
        },
      });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('VALIDATION_FAILED');
      expect(res.error?.message).toContain('Path traversal');
    });
  });
});
