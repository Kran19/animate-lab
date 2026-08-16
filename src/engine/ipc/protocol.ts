export const CURRENT_PROTOCOL_VERSION = 1;

export type IPCErrorCode =
  | 'INVALID_REQUEST'
  | 'METHOD_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'DATABASE_UNAVAILABLE'
  | 'DATABASE_QUERY_FAILED'
  | 'STORAGE_UNAVAILABLE'
  | 'STORAGE_OPERATION_FAILED'
  | 'INTERNAL_ERROR'
  | 'ENGINE_NOT_READY'
  | 'SHUTTING_DOWN'
  | 'PROTOCOL_MISMATCH'
  | 'TIMEOUT';

export interface IPCRequest<T = any> {
  id: string;
  method: string;
  params?: T;
  protocolVersion: number;
}

export interface IPCResponse<T = any> {
  id: string;
  success: boolean;
  result?: T;
  error?: {
    code: IPCErrorCode;
    message: string;
    details?: any;
  };
}

export interface IPCEvent<T = any> {
  event: string;
  payload: T;
  timestamp: string;
}

export interface EngineHealth {
  engineStatus: 'STARTING' | 'READY' | 'BUSY' | 'SHUTTING_DOWN' | 'STOPPED' | 'FAILED';
  databaseStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  storageStatus: 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';
  browserStatus: 'CONNECTED' | 'DISCONNECTED' | 'STOPPED';
  version: string;
  uptimeSeconds: number;
  memoryUsageMb: number;
}

export const IPC_METHODS = {
  SYSTEM_HEALTH: 'system.health',
  SYSTEM_PING: 'system.ping',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  
  BROWSER_HEALTH: 'browser.health',
  BROWSER_START: 'browser.start',
  BROWSER_STOP: 'browser.stop',
  BROWSER_RESTART: 'browser.restart',

  CAPTURE_SESSION_CREATE: 'capture.session.create',
  CAPTURE_SESSION_CLOSE: 'capture.session.close',

  PAGE_NAVIGATE: 'page.navigate',
  PAGE_SCREENSHOT: 'page.screenshot',
  PAGE_SNAPSHOT: 'page.snapshot',

  RESOURCE_DISCOVER: 'resource.discover',
  RESOURCE_CAPTURE: 'resource.capture',
  CAPTURE_RESOURCES_START: 'capture.resources.start',

  WEBSITE_GET_ALL: 'website.getAll',
  WEBSITE_GET_BY_ID: 'website.getById',
  WEBSITE_CREATE: 'website.create',
  WEBSITE_UPDATE: 'website.update',
  WEBSITE_DELETE: 'website.delete',

  PAGE_GET_ALL: 'page.getAll',
  PAGE_GET_BY_WEBSITE_ID: 'page.getByWebsiteId',
  PAGE_GET_BY_ID: 'page.getById',

  SECTION_GET_ALL: 'section.getAll',
  SECTION_GET_BY_PAGE_ID: 'section.getByPageId',
  SECTION_GET_BY_WEBSITE_ID: 'section.getByWebsiteId',
  SECTION_GET_BY_ID: 'section.getById',

  COMPONENT_GET_ALL_CANDIDATES: 'component.getAllCandidates',
  COMPONENT_GET_CANDIDATE_BY_ID: 'component.getCandidateById',
  COMPONENT_GET_BY_WEBSITE_ID: 'component.getByWebsiteId',
  COMPONENT_GET_BY_PAGE_ID: 'component.getByPageId',
  COMPONENT_GET_BY_SECTION_ID: 'component.getBySectionId',
  COMPONENT_GET_REUSABLE: 'component.getReusable',

  ANIMATION_GET_ALL: 'animation.getAll',
  ANIMATION_GET_BY_ID: 'animation.getById',
  ANIMATION_GET_BY_COMPONENT_ID: 'animation.getByComponentId',
  ANIMATION_GET_BY_PAGE_ID: 'animation.getByPageId',

  THREED_GET_ALL: 'threed.getAll',
  THREED_GET_BY_ID: 'threed.getById',
  THREED_GET_BY_WEBSITE_ID: 'threed.getByWebsiteId',
  THREED_GET_BY_PAGE_ID: 'threed.getByPageId',

  ASSET_GET_ALL: 'asset.getAll',
  ASSET_GET_BY_ID: 'asset.getById',
  ASSET_GET_BY_WEBSITE_ID: 'asset.getByWebsiteId',
  ASSET_GET_BY_COMPONENT_ID: 'asset.getByComponentId',

  TECHNOLOGY_GET_ALL: 'technology.getAll',
  TECHNOLOGY_GET_BY_ID: 'technology.getById',
  TECHNOLOGY_GET_BY_WEBSITE_ID: 'technology.getByWebsiteId',

  RESOURCE_GET_ALL: 'resource.getAll',
  RESOURCE_GET_BY_WEBSITE_ID: 'resource.getByWebsiteId',
  RESOURCE_GET_BY_PAGE_ID: 'resource.getByPageId',
  RESOURCE_GET_BY_ID: 'resource.getById',

  JOB_GET_ALL: 'job.getAll',
  JOB_GET_BY_ID: 'job.getById',
  JOB_GET_LOGS: 'job.getLogs',
  JOB_START: 'job.start',
  JOB_PAUSE: 'job.pause',
  JOB_RESUME: 'job.resume',
  JOB_CANCEL: 'job.cancel',
  JOB_GET_STATUS: 'job.getStatus',
  JOB_RETRY: 'job.retry',

  STORAGE_GET_STATS: 'storage.getStats',

  TECHNOLOGY_DETECT: 'technology.detect',
  ANIMATION_ANALYZE: 'animation.analyze',
  ANIMATION_LIST: 'animation.list',
  THREED_ANALYZE: 'threed.analyze',
  THREED_LIST: 'threed.list',
  ANALYSIS_STATUS: 'analysis.status',

  SECTION_DETECT: 'section.detect',
  COMPONENT_IDENTIFY_CANDIDATES: 'component.identifyCandidates',
  COMPONENT_LIST_CANDIDATES: 'component.listCandidates',

  COMPONENT_ISOLATE: 'component.isolate',
  COMPONENT_NORMALIZE: 'component.normalize',
  COMPONENT_GENERATE: 'component.generate',
  COMPONENT_VALIDATE: 'component.validate',
  COMPONENT_EXPORT: 'component.export',
  COMPONENT_GET_REUSABLE_BY_ID: 'component.getReusableById',
} as const;
