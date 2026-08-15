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
} from '../domain/repositories';
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
} from '../domain/types';
import {
  MOCK_WEBSITES,
  MOCK_PAGES,
  MOCK_SECTIONS,
  MOCK_COMPONENT_CANDIDATES,
  MOCK_ANIMATIONS,
  MOCK_THREED_EXPERIENCES,
  MOCK_ASSETS,
  MOCK_TECHNOLOGIES,
  MOCK_RESOURCES,
  MOCK_JOBS,
  MOCK_DIAGNOSTIC_LOGS,
  MOCK_STORAGE_STATS
} from './mockData';

export class MockWebsiteRepository implements IWebsiteRepository {
  private websites = [...MOCK_WEBSITES];

  async getAll(): Promise<Website[]> {
    return Promise.resolve(this.websites);
  }

  async getById(id: string): Promise<Website | undefined> {
    return Promise.resolve(this.websites.find(w => w.id === id));
  }

  async create(url: string, name: string, settings: CaptureSettings, tags: string[] = []): Promise<Website> {
    const newSite: Website = {
      id: `web-${Date.now()}`,
      name: name || url.replace(/^https?:\/\//, '').split('/')[0],
      url,
      description: `Newly queued capture project for ${url}`,
      tags: tags.length ? tags : ['User Capture'],
      status: 'queued',
      faviconUrl: `${url}/favicon.ico`,
      previewScreenshot: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#1A1E2B"/><text x="300" y="200" fill="#9CA3AF" font-family="sans-serif" font-size="20" text-anchor="middle">Queued Capture</text></svg>`,
      captureSettings: settings,
      totalPages: 1,
      totalSections: 0,
      totalComponents: 0,
      totalAnimations: 0,
      total3D: 0,
      totalResources: 0,
      totalStorageBytes: 0,
      createdAt: new Date().toISOString(),
      lastAnalyzedAt: new Date().toISOString(),
      storagePath: `D:\\WebExperienceLab\\websites\\website-${Date.now()}`
    };
    this.websites.unshift(newSite);
    return Promise.resolve(newSite);
  }

  async update(website: Website): Promise<Website> {
    const idx = this.websites.findIndex(w => w.id === website.id);
    if (idx !== -1) {
      this.websites[idx] = website;
    }
    return Promise.resolve(website);
  }

  async delete(id: string): Promise<boolean> {
    this.websites = this.websites.filter(w => w.id !== id);
    return Promise.resolve(true);
  }
}

export class MockPageRepository implements IPageRepository {
  private pages = [...MOCK_PAGES];

  async getAll(): Promise<Page[]> {
    return Promise.resolve(this.pages);
  }

  async getByWebsiteId(websiteId: string): Promise<Page[]> {
    return Promise.resolve(this.pages.filter(p => p.websiteId === websiteId));
  }

  async getById(id: string): Promise<Page | undefined> {
    return Promise.resolve(this.pages.find(p => p.id === id));
  }
}

export class MockSectionRepository implements ISectionRepository {
  private sections = [...MOCK_SECTIONS];

  async getAll(): Promise<Section[]> {
    return Promise.resolve(this.sections);
  }

  async getByPageId(pageId: string): Promise<Section[]> {
    return Promise.resolve(this.sections.filter(s => s.pageId === pageId));
  }

  async getByWebsiteId(websiteId: string): Promise<Section[]> {
    return Promise.resolve(this.sections.filter(s => s.websiteId === websiteId));
  }

  async getById(id: string): Promise<Section | undefined> {
    return Promise.resolve(this.sections.find(s => s.id === id));
  }
}

export class MockComponentRepository implements IComponentRepository {
  private candidates = [...MOCK_COMPONENT_CANDIDATES];

  async getAllCandidates(): Promise<ComponentCandidate[]> {
    return Promise.resolve(this.candidates);
  }

  async getCandidateById(id: string): Promise<ComponentCandidate | undefined> {
    return Promise.resolve(this.candidates.find(c => c.id === id));
  }

  async getCandidatesByWebsiteId(websiteId: string): Promise<ComponentCandidate[]> {
    return Promise.resolve(this.candidates.filter(c => c.provenance.sourceWebsiteId === websiteId));
  }

  async getCandidatesByPageId(pageId: string): Promise<ComponentCandidate[]> {
    return Promise.resolve(this.candidates.filter(c => c.provenance.sourcePageId === pageId));
  }

  async getCandidatesBySectionId(sectionId: string): Promise<ComponentCandidate[]> {
    return Promise.resolve(this.candidates.filter(c => c.provenance.sourceSectionId === sectionId));
  }

  async getReusableComponent(candidateId: string): Promise<ReusableComponent | undefined> {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand || !cand.sourceCode.generatedReactTsx) return undefined;

    return Promise.resolve({
      id: `reusable-${candidateId}`,
      candidateId,
      title: cand.title,
      category: cand.category,
      reactCode: cand.sourceCode.generatedReactTsx,
      cssCode: cand.sourceCode.normalizedCss || '',
      propsDocumentation: [
        { name: 'title', type: 'string', description: 'Headline title text', required: false },
        { name: 'speed', type: 'number', description: 'Animation duration multiplier', required: false }
      ],
      exportFormat: 'react_tailwind',
      version: '1.0.0',
      exportedAt: cand.updatedAt
    });
  }
}

export class MockAnimationRepository implements IAnimationRepository {
  private animations = [...MOCK_ANIMATIONS];

  async getAll(): Promise<Animation[]> {
    return Promise.resolve(this.animations);
  }

  async getById(id: string): Promise<Animation | undefined> {
    return Promise.resolve(this.animations.find(a => a.id === id));
  }

  async getByComponentId(componentId: string): Promise<Animation[]> {
    return Promise.resolve(this.animations.filter(a => a.componentCandidateId === componentId));
  }

  async getByPageId(pageId: string): Promise<Animation[]> {
    return Promise.resolve(this.animations.filter(a => a.pageId === pageId));
  }
}

export class MockThreeDRepository implements IThreeDRepository {
  private threeDList = [...MOCK_THREED_EXPERIENCES];

  async getAll(): Promise<ThreeDExperience[]> {
    return Promise.resolve(this.threeDList);
  }

  async getById(id: string): Promise<ThreeDExperience | undefined> {
    return Promise.resolve(this.threeDList.find(t => t.id === id));
  }

  async getByWebsiteId(websiteId: string): Promise<ThreeDExperience[]> {
    return Promise.resolve(this.threeDList.filter(t => t.websiteId === websiteId));
  }

  async getByPageId(pageId: string): Promise<ThreeDExperience[]> {
    return Promise.resolve(this.threeDList.filter(t => t.pageId === pageId));
  }
}

export class MockAssetRepository implements IAssetRepository {
  private assets = [...MOCK_ASSETS];

  async getAll(): Promise<Asset[]> {
    return Promise.resolve(this.assets);
  }

  async getById(id: string): Promise<Asset | undefined> {
    return Promise.resolve(this.assets.find(a => a.id === id));
  }

  async getByWebsiteId(websiteId: string): Promise<Asset[]> {
    return Promise.resolve(this.assets.filter(a => a.websiteId === websiteId));
  }

  async getByComponentId(componentId: string): Promise<Asset[]> {
    return Promise.resolve(this.assets.filter(a => a.componentCandidateId === componentId));
  }
}

export class MockTechnologyRepository implements ITechnologyRepository {
  private techs = [...MOCK_TECHNOLOGIES];

  async getAll(): Promise<Technology[]> {
    return Promise.resolve(this.techs);
  }

  async getById(id: string): Promise<Technology | undefined> {
    return Promise.resolve(this.techs.find(t => t.id === id));
  }

  async getByWebsiteId(websiteId: string): Promise<Technology[]> {
    // Return techs that have evidence matching websiteId
    return Promise.resolve(this.techs.filter(t => t.evidence.some(e => e.websiteId === websiteId)));
  }
}

export class MockResourceRepository implements IResourceRepository {
  private resources = [...MOCK_RESOURCES];

  async getAll(): Promise<Resource[]> {
    return Promise.resolve(this.resources);
  }

  async getByWebsiteId(websiteId: string): Promise<Resource[]> {
    return Promise.resolve(this.resources.filter(r => r.websiteId === websiteId));
  }

  async getByPageId(pageId: string): Promise<Resource[]> {
    return Promise.resolve(this.resources.filter(r => r.pageId === pageId));
  }

  async getById(id: string): Promise<Resource | undefined> {
    return Promise.resolve(this.resources.find(r => r.id === id));
  }
}

export class MockJobRepository implements IJobRepository {
  private jobs = [...MOCK_JOBS];
  private logs = [...MOCK_DIAGNOSTIC_LOGS];

  async getAllJobs(): Promise<CaptureJob[]> {
    return Promise.resolve(this.jobs);
  }

  async getJobById(id: string): Promise<CaptureJob | undefined> {
    return Promise.resolve(this.jobs.find(j => j.id === id));
  }

  async getLogsByJobId(jobId: string): Promise<DiagnosticLog[]> {
    return Promise.resolve(this.logs.filter(l => l.jobId === jobId));
  }

  async pauseJob(id: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'paused';
      job.currentAction = 'Job paused by user';
    }
    return Promise.resolve(true);
  }

  async resumeJob(id: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'running';
      job.currentAction = 'Resuming crawl pipeline...';
    }
    return Promise.resolve(true);
  }

  async cancelJob(id: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'canceled';
      job.currentAction = 'Job canceled by user';
    }
    return Promise.resolve(true);
  }

  async retryJob(id: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'running';
      job.currentAction = 'Retrying failed pages...';
    }
    return Promise.resolve(true);
  }
}

export class MockStorageRepository implements IStorageRepository {
  async getStats(): Promise<StorageStats> {
    return Promise.resolve(MOCK_STORAGE_STATS);
  }
}
