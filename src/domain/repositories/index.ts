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
} from '../types';

export interface IWebsiteRepository {
  getAll(): Promise<Website[]>;
  getById(id: string): Promise<Website | undefined>;
  create(url: string, name: string, settings: CaptureSettings, tags?: string[]): Promise<Website>;
  update(website: Website): Promise<Website>;
  delete(id: string): Promise<boolean>;
}

export interface IPageRepository {
  getAll(): Promise<Page[]>;
  getByWebsiteId(websiteId: string): Promise<Page[]>;
  getById(id: string): Promise<Page | undefined>;
}

export interface ISectionRepository {
  getAll(): Promise<Section[]>;
  getByPageId(pageId: string): Promise<Section[]>;
  getByWebsiteId(websiteId: string): Promise<Section[]>;
  getById(id: string): Promise<Section | undefined>;
}

export interface IComponentRepository {
  getAllCandidates(): Promise<ComponentCandidate[]>;
  getCandidateById(id: string): Promise<ComponentCandidate | undefined>;
  getCandidatesByWebsiteId(websiteId: string): Promise<ComponentCandidate[]>;
  getCandidatesByPageId(pageId: string): Promise<ComponentCandidate[]>;
  getCandidatesBySectionId(sectionId: string): Promise<ComponentCandidate[]>;
  getReusableComponent(candidateId: string): Promise<ReusableComponent | undefined>;
  exportComponent?(candidateId: string, options?: any): Promise<any>;
  getReusableById?(candidateId: string): Promise<ReusableComponent | undefined>;
}

export interface IAnimationRepository {
  getAll(): Promise<Animation[]>;
  getById(id: string): Promise<Animation | undefined>;
  getByComponentId(componentId: string): Promise<Animation[]>;
  getByPageId(pageId: string): Promise<Animation[]>;
}

export interface IThreeDRepository {
  getAll(): Promise<ThreeDExperience[]>;
  getById(id: string): Promise<ThreeDExperience | undefined>;
  getByWebsiteId(websiteId: string): Promise<ThreeDExperience[]>;
  getByPageId(pageId: string): Promise<ThreeDExperience[]>;
}

export interface IAssetRepository {
  getAll(): Promise<Asset[]>;
  getById(id: string): Promise<Asset | undefined>;
  getByWebsiteId(websiteId: string): Promise<Asset[]>;
  getByComponentId(componentId: string): Promise<Asset[]>;
}

export interface ITechnologyRepository {
  getAll(): Promise<Technology[]>;
  getById(id: string): Promise<Technology | undefined>;
  getByWebsiteId(websiteId: string): Promise<Technology[]>;
}

export interface IResourceRepository {
  getAll(): Promise<Resource[]>;
  getByWebsiteId(websiteId: string): Promise<Resource[]>;
  getByPageId(pageId: string): Promise<Resource[]>;
  getById(id: string): Promise<Resource | undefined>;
}

export interface IJobRepository {
  getAllJobs(): Promise<CaptureJob[]>;
  getJobById(id: string): Promise<CaptureJob | undefined>;
  getLogsByJobId(jobId: string): Promise<DiagnosticLog[]>;
  startJob?(websiteId: string, settings?: CaptureSettings): Promise<CaptureJob>;
  pauseJob(id: string): Promise<boolean | CaptureJob>;
  resumeJob(id: string): Promise<boolean | CaptureJob>;
  cancelJob(id: string): Promise<boolean | CaptureJob>;
  retryJob(id: string): Promise<boolean>;
  getJobStatus?(jobId: string): Promise<{ job: CaptureJob; stats: any }>;
}

export interface IStorageRepository {
  getStats(): Promise<StorageStats>;
}

