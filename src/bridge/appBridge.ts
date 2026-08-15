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
  MockWebsiteRepository,
  MockPageRepository,
  MockSectionRepository,
  MockComponentRepository,
  MockAnimationRepository,
  MockThreeDRepository,
  MockAssetRepository,
  MockTechnologyRepository,
  MockResourceRepository,
  MockJobRepository,
  MockStorageRepository
} from '../mock/mockRepositories';
import {
  PrismaWebsiteRepository,
  PrismaPageRepository,
  PrismaSectionRepository,
  PrismaComponentRepository,
  PrismaAnimationRepository,
  PrismaThreeDRepository,
  PrismaAssetRepository,
  PrismaTechnologyRepository,
  PrismaResourceRepository,
  PrismaJobRepository,
  PrismaStorageRepository
} from '../database/repositories/prismaRepositories';

export interface AppServices {
  websites: IWebsiteRepository;
  pages: IPageRepository;
  sections: ISectionRepository;
  components: IComponentRepository;
  animations: IAnimationRepository;
  threeD: IThreeDRepository;
  assets: IAssetRepository;
  technologies: ITechnologyRepository;
  resources: IResourceRepository;
  jobs: IJobRepository;
  storage: IStorageRepository;
  isTauriAvailable: boolean;
  isDatabaseActive: boolean;
  isDemoMode: boolean;
  databaseError?: string;
}

class AppBridge {
  private services: AppServices;

  constructor() {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    const isNodeEnv = typeof process !== 'undefined' && process.versions && !!process.versions.node;
    const isExplicitDemoMode = typeof window !== 'undefined' && (window as any).__ANIMATE_LAB_DEMO_MODE__ === true;

    // Explicit Demo Mode (e.g. static web preview build)
    if (isExplicitDemoMode || (!isNodeEnv && !isTauri)) {
      this.services = {
        websites: new MockWebsiteRepository(),
        pages: new MockPageRepository(),
        sections: new MockSectionRepository(),
        components: new MockComponentRepository(),
        animations: new MockAnimationRepository(),
        threeD: new MockThreeDRepository(),
        assets: new MockAssetRepository(),
        technologies: new MockTechnologyRepository(),
        resources: new MockResourceRepository(),
        jobs: new MockJobRepository(),
        storage: new MockStorageRepository(),
        isTauriAvailable: isTauri,
        isDatabaseActive: false,
        isDemoMode: true,
      };
      return;
    }

    // Database Mode: Instantiate real SQLite / Prisma Repositories
    try {
      this.services = {
        websites: new PrismaWebsiteRepository(),
        pages: new PrismaPageRepository(),
        sections: new PrismaSectionRepository(),
        components: new PrismaComponentRepository(),
        animations: new PrismaAnimationRepository(),
        threeD: new PrismaThreeDRepository(),
        assets: new PrismaAssetRepository(),
        technologies: new PrismaTechnologyRepository(),
        resources: new PrismaResourceRepository(),
        jobs: new PrismaJobRepository(),
        storage: new PrismaStorageRepository(),
        isTauriAvailable: isTauri,
        isDatabaseActive: true,
        isDemoMode: false,
      };
    } catch (err: any) {
      // Database failure in Database Mode triggers an explicit error state.
      // NO SILENT FALLBACK TO MOCK DATA!
      const errorMessage = `DatabaseInitializationFailedError: ${err?.message || 'Failed to initialize SQLite database connection'}`;
      console.error(errorMessage);

      this.services = {
        websites: new ErrorWebsiteRepository(errorMessage),
        pages: new ErrorPageRepository(errorMessage),
        sections: new ErrorSectionRepository(errorMessage),
        components: new ErrorComponentRepository(errorMessage),
        animations: new ErrorAnimationRepository(errorMessage),
        threeD: new ErrorThreeDRepository(errorMessage),
        assets: new ErrorAssetRepository(errorMessage),
        technologies: new ErrorTechnologyRepository(errorMessage),
        resources: new ErrorResourceRepository(errorMessage),
        jobs: new ErrorJobRepository(errorMessage),
        storage: new ErrorStorageRepository(errorMessage),
        isTauriAvailable: isTauri,
        isDatabaseActive: false,
        isDemoMode: false,
        databaseError: errorMessage,
      };
    }
  }

  public getServices(): AppServices {
    return this.services;
  }
}

// Error Repositories throw explicit errors on invocation instead of silently returning mock data
class ErrorWebsiteRepository implements IWebsiteRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
  async create() { throw new Error(this.error); }
  async update() { throw new Error(this.error); }
  async delete() { throw new Error(this.error); }
}

class ErrorPageRepository implements IPageRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
}

class ErrorSectionRepository implements ISectionRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getByPageId() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
}

class ErrorComponentRepository implements IComponentRepository {
  constructor(private error: string) {}
  async getAllCandidates() { throw new Error(this.error); }
  async getCandidateById() { throw new Error(this.error); }
  async getCandidatesByWebsiteId() { throw new Error(this.error); }
  async getCandidatesByPageId() { throw new Error(this.error); }
  async getCandidatesBySectionId() { throw new Error(this.error); }
  async getReusableComponent() { throw new Error(this.error); }
}

class ErrorAnimationRepository implements IAnimationRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
  async getByComponentId() { throw new Error(this.error); }
  async getByPageId() { throw new Error(this.error); }
}

class ErrorThreeDRepository implements IThreeDRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
  async getByPageId() { throw new Error(this.error); }
}

class ErrorAssetRepository implements IAssetRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
  async getByComponentId() { throw new Error(this.error); }
}

class ErrorTechnologyRepository implements ITechnologyRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
}

class ErrorResourceRepository implements IResourceRepository {
  constructor(private error: string) {}
  async getAll() { throw new Error(this.error); }
  async getByWebsiteId() { throw new Error(this.error); }
  async getByPageId() { throw new Error(this.error); }
  async getById() { throw new Error(this.error); }
}

class ErrorJobRepository implements IJobRepository {
  constructor(private error: string) {}
  async getAllJobs() { throw new Error(this.error); }
  async getJobById() { throw new Error(this.error); }
  async getLogsByJobId() { throw new Error(this.error); }
  async pauseJob() { throw new Error(this.error); }
  async resumeJob() { throw new Error(this.error); }
  async cancelJob() { throw new Error(this.error); }
  async retryJob() { throw new Error(this.error); }
}

class ErrorStorageRepository implements IStorageRepository {
  constructor(private error: string) {}
  async getStats() { throw new Error(this.error); }
}

export const appBridge = new AppBridge();
export const services = appBridge.getServices();
