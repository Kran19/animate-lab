import {
  IPCRequest,
  IPCResponse,
  IPCEvent,
  CURRENT_PROTOCOL_VERSION,
  IPC_METHODS
} from '../engine/ipc/protocol';
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

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: any;
}

export type IPCEventListener = (event: IPCEvent) => void;

export interface IPCTransport {
  send(message: string): void;
  onMessage(callback: (message: string) => void): void;
}

export class IPCClient {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private eventListeners: Set<IPCEventListener> = new Set();
  private requestCounter = 0;
  private isReady = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private transport: IPCTransport | null = null;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  public setTransport(transport: IPCTransport): void {
    this.transport = transport;
    this.transport.onMessage((msgStr) => this.handleIncomingMessage(msgStr));
  }

  public markReady(): void {
    this.isReady = true;
    this.resolveReady();
  }

  public async waitUntilReady(timeoutMs = 5000): Promise<void> {
    if (this.isReady) return;

    let timeoutTimer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error('EngineReadyTimeout: Sidecar engine failed to send READY handshake.')), timeoutMs);
    });

    try {
      await Promise.race([this.readyPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  public addEventListener(listener: IPCEventListener): void {
    this.eventListeners.add(listener);
  }

  public removeEventListener(listener: IPCEventListener): void {
    this.eventListeners.delete(listener);
  }

  public async sendRequest<T = any>(method: string, params?: any, timeoutMs = 10000): Promise<T> {
    await this.waitUntilReady();

    const id = `req-${++this.requestCounter}-${Date.now()}`;
    const request: IPCRequest = {
      id,
      method,
      params,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`IPCTimeoutError: IPC request "${method}" (${id}) timed out after ${timeoutMs}ms.`));
        }
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      if (this.transport) {
        this.transport.send(JSON.stringify(request));
      } else {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(new Error('IPCTransportError: No active IPC transport configured.'));
      }
    });
  }

  public handleIncomingMessage(msgStr: string): void {
    const trimmed = msgStr.trim();
    if (!trimmed) return;

    try {
      const data = JSON.parse(trimmed);

      // 1. Engine Event Message
      if (data.event && typeof data.event === 'string') {
        const ipcEvent = data as IPCEvent;
        if (ipcEvent.event === 'engine.ready') {
          this.markReady();
        }
        for (const listener of this.eventListeners) {
          try {
            listener(ipcEvent);
          } catch (e) {}
        }
        return;
      }

      // 2. Response Message
      if (data.id && this.pendingRequests.has(data.id)) {
        const response = data as IPCResponse;
        const pending = this.pendingRequests.get(data.id)!;
        this.pendingRequests.delete(data.id);
        clearTimeout(pending.timer);

        if (response.success) {
          pending.resolve(response.result);
        } else {
          const errMessage = response.error?.message || 'IPC request failed';
          const errCode = response.error?.code || 'INTERNAL_ERROR';
          const err = new Error(`[${errCode}] ${errMessage}`);
          (err as any).code = errCode;
          (err as any).details = response.error?.details;
          pending.reject(err);
        }
      }
    } catch (err) {
      console.error('IPCClient failed to parse incoming message:', err);
    }
  }
}

// ------------------------------------------------------
// TYPED IPC REPOSITORIES CONSUMING IPC CLIENT
// ------------------------------------------------------

export class IPCWebsiteRepository implements IWebsiteRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Website[]> {
    return this.client.sendRequest(IPC_METHODS.WEBSITE_GET_ALL);
  }
  getById(id: string): Promise<Website | undefined> {
    return this.client.sendRequest(IPC_METHODS.WEBSITE_GET_BY_ID, { id });
  }
  create(url: string, name: string, settings: CaptureSettings, tags: string[] = []): Promise<Website> {
    return this.client.sendRequest(IPC_METHODS.WEBSITE_CREATE, { url, name, settings, tags });
  }
  update(website: Website): Promise<Website> {
    return this.client.sendRequest(IPC_METHODS.WEBSITE_UPDATE, website);
  }
  delete(id: string): Promise<boolean> {
    return this.client.sendRequest(IPC_METHODS.WEBSITE_DELETE, { id });
  }
}

export class IPCPageRepository implements IPageRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Page[]> {
    return this.client.sendRequest(IPC_METHODS.PAGE_GET_ALL);
  }
  getByWebsiteId(websiteId: string): Promise<Page[]> {
    return this.client.sendRequest(IPC_METHODS.PAGE_GET_BY_WEBSITE_ID, { websiteId });
  }
  getById(id: string): Promise<Page | undefined> {
    return this.client.sendRequest(IPC_METHODS.PAGE_GET_BY_ID, { id });
  }
}

export class IPCSectionRepository implements ISectionRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Section[]> {
    return this.client.sendRequest(IPC_METHODS.SECTION_GET_ALL);
  }
  getByPageId(pageId: string): Promise<Section[]> {
    return this.client.sendRequest(IPC_METHODS.SECTION_GET_BY_PAGE_ID, { pageId });
  }
  getByWebsiteId(websiteId: string): Promise<Section[]> {
    return this.client.sendRequest(IPC_METHODS.SECTION_GET_BY_WEBSITE_ID, { websiteId });
  }
  getById(id: string): Promise<Section | undefined> {
    return this.client.sendRequest(IPC_METHODS.SECTION_GET_BY_ID, { id });
  }
}

export class IPCComponentRepository implements IComponentRepository {
  constructor(private client: IPCClient) {}
  getAllCandidates(): Promise<ComponentCandidate[]> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_ALL_CANDIDATES);
  }
  getCandidateById(id: string): Promise<ComponentCandidate | undefined> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_CANDIDATE_BY_ID, { id });
  }
  getCandidatesByWebsiteId(websiteId: string): Promise<ComponentCandidate[]> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_BY_WEBSITE_ID, { websiteId });
  }
  getCandidatesByPageId(pageId: string): Promise<ComponentCandidate[]> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_BY_PAGE_ID, { pageId });
  }
  getCandidatesBySectionId(sectionId: string): Promise<ComponentCandidate[]> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_BY_SECTION_ID, { sectionId });
  }
  getReusableComponent(candidateId: string): Promise<ReusableComponent | undefined> {
    return this.client.sendRequest(IPC_METHODS.COMPONENT_GET_REUSABLE, { candidateId });
  }
}

export class IPCAnimationRepository implements IAnimationRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Animation[]> {
    return this.client.sendRequest(IPC_METHODS.ANIMATION_GET_ALL);
  }
  getById(id: string): Promise<Animation | undefined> {
    return this.client.sendRequest(IPC_METHODS.ANIMATION_GET_BY_ID, { id });
  }
  getByComponentId(componentId: string): Promise<Animation[]> {
    return this.client.sendRequest(IPC_METHODS.ANIMATION_GET_BY_COMPONENT_ID, { componentId });
  }
  getByPageId(pageId: string): Promise<Animation[]> {
    return this.client.sendRequest(IPC_METHODS.ANIMATION_GET_BY_PAGE_ID, { pageId });
  }
}

export class IPCThreeDRepository implements IThreeDRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<ThreeDExperience[]> {
    return this.client.sendRequest(IPC_METHODS.THREED_GET_ALL);
  }
  getById(id: string): Promise<ThreeDExperience | undefined> {
    return this.client.sendRequest(IPC_METHODS.THREED_GET_BY_ID, { id });
  }
  getByWebsiteId(websiteId: string): Promise<ThreeDExperience[]> {
    return this.client.sendRequest(IPC_METHODS.THREED_GET_BY_WEBSITE_ID, { websiteId });
  }
  getByPageId(pageId: string): Promise<ThreeDExperience[]> {
    return this.client.sendRequest(IPC_METHODS.THREED_GET_BY_PAGE_ID, { pageId });
  }
}

export class IPCAssetRepository implements IAssetRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Asset[]> {
    return this.client.sendRequest(IPC_METHODS.ASSET_GET_ALL);
  }
  getById(id: string): Promise<Asset | undefined> {
    return this.client.sendRequest(IPC_METHODS.ASSET_GET_BY_ID, { id });
  }
  getByWebsiteId(websiteId: string): Promise<Asset[]> {
    return this.client.sendRequest(IPC_METHODS.ASSET_GET_BY_WEBSITE_ID, { websiteId });
  }
  getByComponentId(componentId: string): Promise<Asset[]> {
    return this.client.sendRequest(IPC_METHODS.ASSET_GET_BY_COMPONENT_ID, { componentId });
  }
}

export class IPCTechnologyRepository implements ITechnologyRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Technology[]> {
    return this.client.sendRequest(IPC_METHODS.TECHNOLOGY_GET_ALL);
  }
  getById(id: string): Promise<Technology | undefined> {
    return this.client.sendRequest(IPC_METHODS.TECHNOLOGY_GET_BY_ID, { id });
  }
  getByWebsiteId(websiteId: string): Promise<Technology[]> {
    return this.client.sendRequest(IPC_METHODS.TECHNOLOGY_GET_BY_WEBSITE_ID, { websiteId });
  }
}

export class IPCResourceRepository implements IResourceRepository {
  constructor(private client: IPCClient) {}
  getAll(): Promise<Resource[]> {
    return this.client.sendRequest(IPC_METHODS.RESOURCE_GET_ALL);
  }
  getByWebsiteId(websiteId: string): Promise<Resource[]> {
    return this.client.sendRequest(IPC_METHODS.RESOURCE_GET_BY_WEBSITE_ID, { websiteId });
  }
  getByPageId(pageId: string): Promise<Resource[]> {
    return this.client.sendRequest(IPC_METHODS.RESOURCE_GET_BY_PAGE_ID, { pageId });
  }
  getById(id: string): Promise<Resource | undefined> {
    return this.client.sendRequest(IPC_METHODS.RESOURCE_GET_BY_ID, { id });
  }
}

export class IPCJobRepository implements IJobRepository {
  constructor(private client: IPCClient) {}
  getAllJobs(): Promise<CaptureJob[]> {
    return this.client.sendRequest(IPC_METHODS.JOB_GET_ALL);
  }
  getJobById(id: string): Promise<CaptureJob | undefined> {
    return this.client.sendRequest(IPC_METHODS.JOB_GET_BY_ID, { id });
  }
  getLogsByJobId(jobId: string): Promise<DiagnosticLog[]> {
    return this.client.sendRequest(IPC_METHODS.JOB_GET_LOGS, { jobId });
  }
  pauseJob(id: string): Promise<boolean> {
    return this.client.sendRequest(IPC_METHODS.JOB_PAUSE, { id });
  }
  resumeJob(id: string): Promise<boolean> {
    return this.client.sendRequest(IPC_METHODS.JOB_RESUME, { id });
  }
  cancelJob(id: string): Promise<boolean> {
    return this.client.sendRequest(IPC_METHODS.JOB_CANCEL, { id });
  }
  retryJob(id: string): Promise<boolean> {
    return this.client.sendRequest(IPC_METHODS.JOB_RETRY, { id });
  }
}

export class IPCStorageRepository implements IStorageRepository {
  constructor(private client: IPCClient) {}
  getStats(): Promise<StorageStats> {
    return this.client.sendRequest(IPC_METHODS.STORAGE_GET_STATS);
  }
}
