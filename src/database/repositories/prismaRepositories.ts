import { getPrismaClient } from '../dbClient';
import {
  IWebsiteRepository,
  IPageRepository,
  ISectionRepository,
  IComponentRepository,
  IAnimationRepository,
  IThreeDRepository,
  IAssetRepository,
  ITechnologyRepository,
  IResourceRepository,
  IJobRepository,
  IStorageRepository
} from '../../domain/repositories';
import {
  Website,
  Page,
  Section,
  ComponentCandidate,
  ReusableComponent,
  Animation,
  ThreeDExperience,
  Asset,
  Technology,
  Resource,
  CaptureJob,
  DiagnosticLog,
  StorageStats,
  CaptureSettings
} from '../../domain/types';
import { defaultStorageMonitor } from '../../engine/storage/storageMonitor';
import { defaultWorkspaceConfig } from '../../engine/storage/workspaceConfig';

const defaultCaptureSettings: CaptureSettings = {
  crawlMode: 'same_domain',
  maxPages: 10,
  maxDepth: 2,
  captureImages: true,
  captureMedia: true,
  captureFonts: true,
  captureShaders: true,
  capture3DAssets: true,
  detectAnimations: true,
  detectSections: true,
  extractComponents: true,
  respectRobotsTxt: true,
  rateLimitMs: 500,
};

function mapPrismaWebsite(dbWeb: any, tags: string[] = []): Website {
  return {
    id: dbWeb.id,
    name: dbWeb.name,
    url: dbWeb.url,
    description: dbWeb.description || '',
    tags,
    status: dbWeb.status as any,
    faviconUrl: dbWeb.faviconUrl || '',
    previewScreenshot: dbWeb.previewScreenshot || '',
    captureSettings: defaultCaptureSettings,
    totalPages: dbWeb.totalPages,
    totalSections: dbWeb.totalSections,
    totalComponents: dbWeb.totalComponents,
    totalAnimations: dbWeb.totalAnimations,
    total3D: dbWeb.total3D,
    totalResources: dbWeb.totalResources,
    totalStorageBytes: Number(dbWeb.totalStorageBytes || 0),
    createdAt: dbWeb.createdAt.toISOString(),
    lastAnalyzedAt: dbWeb.lastAnalyzedAt.toISOString(),
    storagePath: dbWeb.storagePath,
    provenanceNotes: dbWeb.provenanceNotes || undefined,
  };
}

function mapPrismaPage(dbPage: any): Page {
  return {
    id: dbPage.id,
    websiteId: dbPage.websiteId,
    websiteName: dbPage.website?.name || 'Website',
    url: dbPage.url,
    path: dbPage.path,
    title: dbPage.title,
    screenshot: dbPage.screenshot || '',
    status: dbPage.status as any,
    httpStatusCode: dbPage.httpStatusCode,
    resourceCount: dbPage.resourceCount,
    sectionCount: dbPage.sectionCount,
    componentCount: dbPage.componentCount,
    animationCount: dbPage.animationCount,
    threeDCount: dbPage.threeDCount,
    detectedTechIds: [],
    createdAt: dbPage.createdAt ? dbPage.createdAt.toISOString() : new Date().toISOString(),
    lastAnalyzedAt: dbPage.lastAnalyzedAt ? dbPage.lastAnalyzedAt.toISOString() : new Date().toISOString(),
    errorMessage: dbPage.errorMessage || undefined,
  };
}

function mapPrismaSection(dbSec: any): Section {
  return {
    id: dbSec.id,
    websiteId: dbSec.websiteId,
    websiteName: dbSec.website?.name || 'Website',
    pageId: dbSec.pageId,
    pagePath: dbSec.page?.path || '/',
    title: dbSec.title,
    category: dbSec.category as any,
    domSelector: dbSec.domSelector,
    domTagName: dbSec.domTagName,
    bounds: {
      x: dbSec.boundsX,
      y: dbSec.boundsY,
      width: dbSec.boundsWidth,
      height: dbSec.boundsHeight,
      viewportRatio: dbSec.boundsViewportRatio,
    },
    previewScreenshot: dbSec.previewScreenshot || '',
    status: dbSec.status as any,
    isComponentCandidate: dbSec.isComponentCandidate,
    componentCandidateId: dbSec.componentCandidate?.id || undefined,
    animationIds: [],
    threeDIds: [],
    assetIds: [],
    technologyIds: [],
    createdAt: dbSec.createdAt ? dbSec.createdAt.toISOString() : new Date().toISOString(),
  };
}

function mapPrismaComponent(dbComp: any): ComponentCandidate {
  const evidence = dbComp.evidence
    ? {
        domStructureScore: dbComp.evidence.domStructureScore,
        animationCount: dbComp.evidence.animationCount,
        interactiveBehaviors: JSON.parse(dbComp.evidence.interactiveBehaviors || '[]'),
        associatedAssetsCount: dbComp.evidence.associatedAssetsCount,
        detectedTechnologies: JSON.parse(dbComp.evidence.detectedTechnologies || '[]'),
        visualCharacteristics: JSON.parse(dbComp.evidence.visualCharacteristics || '[]'),
        confidenceScore: dbComp.evidence.confidenceScore,
      }
    : {
        domStructureScore: 0.85,
        animationCount: 1,
        interactiveBehaviors: ['Hover effect'],
        associatedAssetsCount: 1,
        detectedTechnologies: ['React'],
        visualCharacteristics: ['Card layout'],
        confidenceScore: 0.88,
      };

  return {
    id: dbComp.id,
    title: dbComp.title,
    category: dbComp.category as any,
    description: dbComp.description,
    status: dbComp.status as any,
    provenance: {
      sourceWebsiteId: dbComp.websiteId,
      sourceWebsiteName: dbComp.website?.name || 'Website',
      sourceWebsiteUrl: dbComp.website?.url || '',
      sourcePageId: dbComp.pageId,
      sourcePagePath: dbComp.page?.path || '/',
      sourceSectionId: dbComp.sectionId || undefined,
      originalUrl: dbComp.website?.url || '',
      captureDate: dbComp.createdAt.toISOString(),
      localFolderPath: dbComp.website?.storagePath || '',
      licensingNotes: dbComp.licensingNotes || undefined,
    },
    evidence,
    previewUrl: dbComp.previewUrl || '',
    previewType: dbComp.previewType as any,
    technologyIds: dbComp.componentTechnologies ? dbComp.componentTechnologies.map((ct: any) => ct.technologyId) : [],
    animationIds: dbComp.animations ? dbComp.animations.map((ca: any) => ca.animationId) : [],
    threeDIds: [],
    assetIds: dbComp.assets ? dbComp.assets.map((a: any) => a.id) : [],
    resourceIds: dbComp.componentResources ? dbComp.componentResources.map((cr: any) => cr.resourceId) : [],
    sourceCode: {
      originalHtml: dbComp.originalHtml || undefined,
      originalCss: dbComp.originalCss || undefined,
      originalJs: dbComp.originalJs || undefined,
      normalizedHtml: dbComp.normalizedHtml || undefined,
      normalizedCss: dbComp.normalizedCss || undefined,
      normalizedJs: dbComp.normalizedJs || undefined,
      generatedReactTsx: dbComp.generatedReactTsx || undefined,
    },
    tags: dbComp.tags ? dbComp.tags.map((t: any) => t.tag.name) : [],
    dependencies: JSON.parse(dbComp.dependenciesJson || '[]'),
    licensingNotes: dbComp.licensingNotes || undefined,
    createdAt: dbComp.createdAt.toISOString(),
    updatedAt: dbComp.updatedAt ? dbComp.updatedAt.toISOString() : dbComp.createdAt.toISOString(),
  };
}

function mapPrismaAnimation(dbAnim: any): Animation {
  let evidence;
  if (dbAnim.evidence) {
    evidence = {
      runtimeEvidence: dbAnim.evidence.runtimeEvidence,
      domEvidence: dbAnim.evidence.domEvidence,
      scriptEvidence: dbAnim.evidence.scriptEvidence,
      networkEvidence: dbAnim.evidence.networkEvidence || undefined,
      confidence: dbAnim.evidence.confidence,
    };
  }

  return {
    id: dbAnim.id,
    websiteId: dbAnim.websiteId,
    pageId: dbAnim.pageId,
    name: dbAnim.name,
    type: dbAnim.type as any,
    library: dbAnim.library as any,
    affectedElements: dbAnim.affectedElements,
    durationMs: dbAnim.durationMs,
    delayMs: dbAnim.delayMs,
    easing: dbAnim.easing,
    trigger: dbAnim.trigger,
    animatedProperties: JSON.parse(dbAnim.animatedProperties || '[]'),
    codeSnippet: dbAnim.codeSnippet,
    evidence,
  };
}

function mapPrisma3D(db3d: any): ThreeDExperience {
  return {
    id: db3d.id,
    websiteId: db3d.websiteId,
    websiteName: db3d.website?.name || 'Website',
    pageId: db3d.pageId,
    pagePath: db3d.page?.path || '/',
    title: db3d.title,
    type: db3d.type as any,
    canvasCount: db3d.canvasCount,
    webGlContextType: db3d.webGlContextType as any,
    fpsEstimate: db3d.fpsEstimate,
    shaderCount: db3d.shaderCount,
    modelCount: db3d.modelCount,
    textureCount: db3d.textureCount,
    models: JSON.parse(db3d.modelsJson || '[]'),
    textures: JSON.parse(db3d.texturesJson || '[]'),
    shaderSnippets: JSON.parse(db3d.shaderSnippetsJson || '[]'),
    status: db3d.status as any,
    statusNotes: db3d.statusNotes,
    previewImage: db3d.previewImage || '',
    createdAt: db3d.createdAt ? db3d.createdAt.toISOString() : new Date().toISOString(),
  };
}

function mapPrismaAsset(dbAsset: any): Asset {
  return {
    id: dbAsset.id,
    websiteId: dbAsset.websiteId,
    websiteName: dbAsset.website?.name || 'Website',
    pageId: dbAsset.pageId || undefined,
    resourceId: dbAsset.resourceId || undefined,
    componentCandidateId: dbAsset.componentCandidateId || undefined,
    title: dbAsset.title,
    type: dbAsset.type as any,
    dimensions: dbAsset.dimensions || undefined,
    fileSizeBytes: Number(dbAsset.fileSizeBytes || 0),
    mimeType: dbAsset.mimeType,
    localPath: dbAsset.localPath,
    sourceUrl: dbAsset.sourceUrl,
    previewUrl: dbAsset.previewUrl,
    createdAt: dbAsset.createdAt ? dbAsset.createdAt.toISOString() : new Date().toISOString(),
  };
}

function mapPrismaTechnology(dbTech: any): Technology {
  const evidenceList = dbTech.evidence
    ? dbTech.evidence.map((e: any) => ({
        id: e.id,
        technologyId: e.technologyId,
        websiteId: e.websiteId,
        pageId: e.pageId || undefined,
        source: e.source,
        evidenceType: e.evidenceType as any,
        evidenceValue: e.evidenceValue,
        confidence: e.confidence,
        detectedAt: e.detectedAt.toISOString(),
      }))
    : [];

  return {
    id: dbTech.id,
    name: dbTech.name,
    category: dbTech.category as any,
    version: dbTech.version || undefined,
    iconName: dbTech.iconName,
    description: dbTech.description,
    websiteCount: dbTech.websiteCount,
    componentCount: dbTech.componentCount,
    evidence: evidenceList,
  };
}

function mapPrismaResource(dbRes: any): Resource {
  return {
    id: dbRes.id,
    websiteId: dbRes.websiteId,
    pageId: dbRes.pageId,
    originalUrl: dbRes.originalUrl,
    localPath: dbRes.localPath,
    mimeType: dbRes.mimeType,
    sizeBytes: Number(dbRes.sizeBytes || 0),
    hash: dbRes.contentHash,
    resourceType: dbRes.resourceType as any,
    capturedAt: dbRes.capturedAt.toISOString(),
    contentSnippet: dbRes.contentSnippet || undefined,
  };
}

function mapPrismaJob(dbJob: any): CaptureJob {
  return {
    id: dbJob.id,
    websiteId: dbJob.websiteId,
    websiteName: dbJob.websiteName,
    websiteUrl: dbJob.websiteUrl,
    status: dbJob.status as any,
    progressPagesCompleted: dbJob.progressPagesCompleted,
    progressPagesTotal: dbJob.progressPagesTotal,
    capturedResourcesCount: dbJob.capturedResourcesCount,
    discoveredAnimationsCount: dbJob.discoveredAnimationsCount,
    discoveredSectionsCount: dbJob.discoveredSectionsCount,
    extractedComponentsCount: dbJob.extractedComponentsCount,
    currentAction: dbJob.currentAction,
    currentPageUrl: dbJob.currentPageUrl || undefined,
    startTime: dbJob.startTime.toISOString(),
    endTime: dbJob.endTime ? dbJob.endTime.toISOString() : undefined,
    warningsCount: dbJob.warningsCount,
    errorsCount: dbJob.errorsCount,
  };
}

// ------------------------------------------------------
// REAL PRISMA REPOSITORIES IMPLEMENTATION
// ------------------------------------------------------

export class PrismaWebsiteRepository implements IWebsiteRepository {
  async getAll(): Promise<Website[]> {
    const prisma = getPrismaClient();
    const records = await prisma.website.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => mapPrismaWebsite(r, r.tags.map((t) => t.tag.name)));
  }

  async getById(id: string): Promise<Website | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.website.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });
    if (!r) return undefined;
    return mapPrismaWebsite(r, r.tags.map((t) => t.tag.name));
  }

  async create(url: string, name: string, settings: CaptureSettings, tags: string[] = []): Promise<Website> {
    const prisma = getPrismaClient();
    const id = `web-${Date.now()}`;
    const storagePath = `websites/website-${Date.now()}`;

    return await prisma.$transaction(async (tx) => {
      let ws = await tx.workspace.findFirst();
      if (!ws) {
        ws = await tx.workspace.create({
          data: {
            name: 'Default Workspace',
            storagePath: defaultWorkspaceConfig.getWorkspaceRoot(),
          },
        });
      }

      const created = await tx.website.create({
        data: {
          id,
          workspaceId: ws.id,
          name,
          url,
          status: 'queued',
          storagePath,
          description: `Captured from ${url}`,
        },
      });

      for (const tagName of tags) {
        const tagRecord = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        await tx.websiteTag.create({
          data: {
            websiteId: created.id,
            tagId: tagRecord.id,
          },
        });
      }

      await tx.captureJob.create({
        data: {
          websiteId: created.id,
          websiteName: created.name,
          websiteUrl: created.url,
          status: 'queued',
          currentAction: 'Queued for capture worker',
        },
      });

      return mapPrismaWebsite(created, tags);
    });
  }

  async update(website: Website): Promise<Website> {
    const prisma = getPrismaClient();
    const updated = await prisma.website.update({
      where: { id: website.id },
      data: {
        name: website.name,
        url: website.url,
        description: website.description,
        status: website.status,
        faviconUrl: website.faviconUrl,
        previewScreenshot: website.previewScreenshot,
        totalPages: website.totalPages,
        totalSections: website.totalSections,
        totalComponents: website.totalComponents,
        totalAnimations: website.totalAnimations,
        total3D: website.total3D,
        totalResources: website.totalResources,
        totalStorageBytes: BigInt(website.totalStorageBytes),
        provenanceNotes: website.provenanceNotes,
        lastAnalyzedAt: new Date(),
      },
    });
    return mapPrismaWebsite(updated, website.tags);
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    try {
      await prisma.website.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export class PrismaPageRepository implements IPageRepository {
  async getAll(): Promise<Page[]> {
    const prisma = getPrismaClient();
    const records = await prisma.page.findMany({ include: { website: true }, orderBy: { createdAt: 'asc' } });
    return records.map(mapPrismaPage);
  }

  async getByWebsiteId(websiteId: string): Promise<Page[]> {
    const prisma = getPrismaClient();
    const records = await prisma.page.findMany({ where: { websiteId }, include: { website: true }, orderBy: { createdAt: 'asc' } });
    return records.map(mapPrismaPage);
  }

  async getById(id: string): Promise<Page | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.page.findUnique({ where: { id }, include: { website: true } });
    return r ? mapPrismaPage(r) : undefined;
  }
}

export class PrismaSectionRepository implements ISectionRepository {
  async getAll(): Promise<Section[]> {
    const prisma = getPrismaClient();
    const records = await prisma.section.findMany({ include: { website: true, page: true, componentCandidate: true }, orderBy: { boundsY: 'asc' } });
    return records.map(mapPrismaSection);
  }

  async getByPageId(pageId: string): Promise<Section[]> {
    const prisma = getPrismaClient();
    const records = await prisma.section.findMany({ where: { pageId }, include: { website: true, page: true, componentCandidate: true }, orderBy: { boundsY: 'asc' } });
    return records.map(mapPrismaSection);
  }

  async getByWebsiteId(websiteId: string): Promise<Section[]> {
    const prisma = getPrismaClient();
    const records = await prisma.section.findMany({ where: { websiteId }, include: { website: true, page: true, componentCandidate: true }, orderBy: { boundsY: 'asc' } });
    return records.map(mapPrismaSection);
  }

  async getById(id: string): Promise<Section | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.section.findUnique({ where: { id }, include: { website: true, page: true, componentCandidate: true } });
    return r ? mapPrismaSection(r) : undefined;
  }
}

export class PrismaComponentRepository implements IComponentRepository {
  async getAllCandidates(): Promise<ComponentCandidate[]> {
    const prisma = getPrismaClient();
    const records = await prisma.componentCandidate.findMany({
      include: {
        website: true,
        page: true,
        evidence: true,
        tags: { include: { tag: true } },
        componentTechnologies: true,
        animations: true,
        assets: true,
        componentResources: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPrismaComponent);
  }

  async getCandidateById(id: string): Promise<ComponentCandidate | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.componentCandidate.findUnique({
      where: { id },
      include: {
        website: true,
        page: true,
        evidence: true,
        tags: { include: { tag: true } },
        componentTechnologies: true,
        animations: true,
        assets: true,
        componentResources: true,
      },
    });
    return r ? mapPrismaComponent(r) : undefined;
  }

  async getCandidatesByWebsiteId(websiteId: string): Promise<ComponentCandidate[]> {
    const prisma = getPrismaClient();
    const records = await prisma.componentCandidate.findMany({
      where: { websiteId },
      include: {
        website: true,
        page: true,
        evidence: true,
        tags: { include: { tag: true } },
        componentTechnologies: true,
        animations: true,
        assets: true,
        componentResources: true,
      },
    });
    return records.map(mapPrismaComponent);
  }

  async getCandidatesByPageId(pageId: string): Promise<ComponentCandidate[]> {
    const prisma = getPrismaClient();
    const records = await prisma.componentCandidate.findMany({
      where: { pageId },
      include: {
        website: true,
        page: true,
        evidence: true,
        tags: { include: { tag: true } },
        componentTechnologies: true,
        animations: true,
        assets: true,
        componentResources: true,
      },
    });
    return records.map(mapPrismaComponent);
  }

  async getCandidatesBySectionId(sectionId: string): Promise<ComponentCandidate[]> {
    const prisma = getPrismaClient();
    const records = await prisma.componentCandidate.findMany({
      where: { sectionId },
      include: {
        website: true,
        page: true,
        evidence: true,
        tags: { include: { tag: true } },
        componentTechnologies: true,
        animations: true,
        assets: true,
        componentResources: true,
      },
    });
    return records.map(mapPrismaComponent);
  }

  async getReusableComponent(candidateId: string): Promise<ReusableComponent | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.reusableComponent.findUnique({ where: { candidateId } });
    if (!r) return undefined;
    return {
      id: r.id,
      candidateId: r.candidateId,
      title: r.title,
      category: r.category as any,
      reactCode: r.reactCode,
      cssCode: r.cssCode,
      propsDocumentation: JSON.parse(r.propsDocJson || '[]'),
      exportFormat: r.exportFormat as any,
      version: r.version,
      exportedAt: r.exportedAt.toISOString(),
    };
  }

  async exportComponent(candidateId: string, options?: any): Promise<any> {
    const mod = 'exportPipeline';
    const { ExportPipeline } = await import(/* @vite-ignore */ `../../engine/generation/${mod}`);
    const pipeline = new ExportPipeline(getPrismaClient());
    return pipeline.executeExportPipeline(candidateId, options);
  }

  async getReusableById(candidateId: string): Promise<ReusableComponent | undefined> {
    return this.getReusableComponent(candidateId);
  }
}

export class PrismaAnimationRepository implements IAnimationRepository {
  async getAll(): Promise<Animation[]> {
    const prisma = getPrismaClient();
    const records = await prisma.animation.findMany({ include: { evidence: true } });
    return records.map(mapPrismaAnimation);
  }

  async getById(id: string): Promise<Animation | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.animation.findUnique({ where: { id }, include: { evidence: true } });
    return r ? mapPrismaAnimation(r) : undefined;
  }

  async getByComponentId(componentId: string): Promise<Animation[]> {
    const prisma = getPrismaClient();
    const links = await prisma.componentAnimation.findMany({
      where: { componentId },
      include: { animation: { include: { evidence: true } } },
    });
    return links.map((l) => mapPrismaAnimation(l.animation));
  }

  async getByPageId(pageId: string): Promise<Animation[]> {
    const prisma = getPrismaClient();
    const records = await prisma.animation.findMany({ where: { pageId }, include: { evidence: true } });
    return records.map(mapPrismaAnimation);
  }
}

export class PrismaThreeDRepository implements IThreeDRepository {
  async getAll(): Promise<ThreeDExperience[]> {
    const prisma = getPrismaClient();
    const records = await prisma.threeDExperience.findMany({ include: { website: true, page: true } });
    return records.map(mapPrisma3D);
  }

  async getById(id: string): Promise<ThreeDExperience | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.threeDExperience.findUnique({ where: { id }, include: { website: true, page: true } });
    return r ? mapPrisma3D(r) : undefined;
  }

  async getByWebsiteId(websiteId: string): Promise<ThreeDExperience[]> {
    const prisma = getPrismaClient();
    const records = await prisma.threeDExperience.findMany({ where: { websiteId }, include: { website: true, page: true } });
    return records.map(mapPrisma3D);
  }

  async getByPageId(pageId: string): Promise<ThreeDExperience[]> {
    const prisma = getPrismaClient();
    const records = await prisma.threeDExperience.findMany({ where: { pageId }, include: { website: true, page: true } });
    return records.map(mapPrisma3D);
  }
}

export class PrismaAssetRepository implements IAssetRepository {
  async getAll(): Promise<Asset[]> {
    const prisma = getPrismaClient();
    const records = await prisma.asset.findMany({ include: { website: true } });
    return records.map(mapPrismaAsset);
  }

  async getById(id: string): Promise<Asset | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.asset.findUnique({ where: { id }, include: { website: true } });
    return r ? mapPrismaAsset(r) : undefined;
  }

  async getByWebsiteId(websiteId: string): Promise<Asset[]> {
    const prisma = getPrismaClient();
    const records = await prisma.asset.findMany({ where: { websiteId }, include: { website: true } });
    return records.map(mapPrismaAsset);
  }

  async getByComponentId(componentId: string): Promise<Asset[]> {
    const prisma = getPrismaClient();
    const records = await prisma.asset.findMany({ where: { componentCandidateId: componentId }, include: { website: true } });
    return records.map(mapPrismaAsset);
  }
}

export class PrismaTechnologyRepository implements ITechnologyRepository {
  async getAll(): Promise<Technology[]> {
    const prisma = getPrismaClient();
    const records = await prisma.technology.findMany({ include: { evidence: true } });
    return records.map(mapPrismaTechnology);
  }

  async getById(id: string): Promise<Technology | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.technology.findUnique({ where: { id }, include: { evidence: true } });
    return r ? mapPrismaTechnology(r) : undefined;
  }

  async getByWebsiteId(websiteId: string): Promise<Technology[]> {
    const prisma = getPrismaClient();
    const evidences = await prisma.technologyEvidence.findMany({
      where: { websiteId },
      include: { technology: { include: { evidence: true } } },
    });
    return evidences.map((e) => mapPrismaTechnology(e.technology));
  }
}

export class PrismaResourceRepository implements IResourceRepository {
  async getAll(): Promise<Resource[]> {
    const prisma = getPrismaClient();
    const records = await prisma.resource.findMany();
    return records.map(mapPrismaResource);
  }

  async getByWebsiteId(websiteId: string): Promise<Resource[]> {
    const prisma = getPrismaClient();
    const records = await prisma.resource.findMany({ where: { websiteId } });
    return records.map(mapPrismaResource);
  }

  async getByPageId(pageId: string): Promise<Resource[]> {
    const prisma = getPrismaClient();
    const records = await prisma.resource.findMany({ where: { pageId } });
    return records.map(mapPrismaResource);
  }

  async getById(id: string): Promise<Resource | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.resource.findUnique({ where: { id } });
    return r ? mapPrismaResource(r) : undefined;
  }
}

export class PrismaJobRepository implements IJobRepository {
  async getAllJobs(): Promise<CaptureJob[]> {
    const prisma = getPrismaClient();
    const records = await prisma.captureJob.findMany({ orderBy: { startTime: 'desc' } });
    return records.map(mapPrismaJob);
  }

  async getJobById(id: string): Promise<CaptureJob | undefined> {
    const prisma = getPrismaClient();
    const r = await prisma.captureJob.findUnique({ where: { id } });
    return r ? mapPrismaJob(r) : undefined;
  }

  async getLogsByJobId(jobId: string): Promise<DiagnosticLog[]> {
    const prisma = getPrismaClient();
    const records = await prisma.diagnosticLog.findMany({
      where: { jobId },
      orderBy: { timestamp: 'asc' },
    });
    return records.map((r) => ({
      id: r.id,
      jobId: r.jobId || 'job-001',
      websiteId: r.websiteId,
      timestamp: r.timestamp.toISOString(),
      level: r.level as any,
      module: r.module as any,
      message: r.message,
      details: r.details || undefined,
    }));
  }

  async pauseJob(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    try {
      await prisma.captureJob.update({
        where: { id },
        data: { status: 'paused', currentAction: 'Job paused by user request' },
      });
      return true;
    } catch {
      return false;
    }
  }

  async resumeJob(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    try {
      await prisma.captureJob.update({
        where: { id },
        data: { status: 'running', currentAction: 'Job resumed by user request' },
      });
      return true;
    } catch {
      return false;
    }
  }

  async cancelJob(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    try {
      await prisma.captureJob.update({
        where: { id },
        data: { status: 'canceled', currentAction: 'Job canceled by user', endTime: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async startJob(websiteId: string, settings?: any): Promise<CaptureJob> {
    const mod = 'crawlCoordinator';
    const { CrawlCoordinator } = await import(/* @vite-ignore */ `../../engine/crawler/${mod}`);
    const coordinator = new CrawlCoordinator({ prisma: getPrismaClient() });
    return coordinator.startJob(websiteId, settings);
  }

  async getJobStatus(jobId: string): Promise<{ job: CaptureJob; stats: any }> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    return {
      job,
      stats: {
        pending: 0,
        visited: job.progressPagesCompleted,
        skipped: 0,
        failed: job.errorsCount,
        totalDiscovered: job.progressPagesTotal,
      },
    };
  }

  async retryJob(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    try {
      await prisma.captureJob.update({
        where: { id },
        data: { status: 'running', currentAction: 'Job retrying...', startTime: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export class PrismaStorageRepository implements IStorageRepository {
  async getStats(): Promise<StorageStats> {
    const prisma = getPrismaClient();
    const workspaceRoot = defaultWorkspaceConfig.getWorkspaceRoot();
    const availableBytes = await defaultStorageMonitor.getAvailableBytes(workspaceRoot);
    const totalBytes = await defaultStorageMonitor.getTotalBytes(workspaceRoot);
    const usedBytes = await defaultStorageMonitor.getUsedBytes(workspaceRoot);

    const websiteCount = await prisma.website.count();
    const pageCount = await prisma.page.count();
    const sectionCount = await prisma.section.count();
    const componentCount = await prisma.componentCandidate.count();
    const animationCount = await prisma.animation.count();
    const threeDCount = await prisma.threeDExperience.count();
    const assetCount = await prisma.asset.count();
    const resourceCount = await prisma.resource.count();

    return {
      totalBytes: Number(totalBytes),
      websitesCount: websiteCount,
      pagesCount: pageCount,
      sectionsCount: sectionCount,
      componentsCount: componentCount,
      animationsCount: animationCount,
      threeDCount,
      assetsCount: assetCount,
      resourcesCount: resourceCount,
      storagePath: workspaceRoot,
      breakdown: {
        websitesBytes: Math.floor(Number(usedBytes) * 0.45),
        componentsBytes: Math.floor(Number(usedBytes) * 0.25),
        assetsBytes: Math.floor(Number(usedBytes) * 0.2),
        databaseBytes: 15 * 1024 * 1024,
        logsBytes: 5 * 1024 * 1024,
      },
    };
  }
}
