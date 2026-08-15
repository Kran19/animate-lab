import {
  IPCRequest,
  IPCResponse,
  IPC_METHODS,
  CURRENT_PROTOCOL_VERSION,
  EngineHealth,
  IPCErrorCode
} from './protocol';
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
} from '../../database/repositories/prismaRepositories';
import { PrismaClient } from '@prisma/client';
import { BrowserManager, defaultBrowserManager } from '../browser/browserManager';
import { BrowserContextManager } from '../browser/contextManager';
import { PageManager } from '../browser/pageManager';
import { ResourcePipeline } from '../resources/resourcePipeline';
import { ResourceDiscoverer } from '../resources/resourceDiscoverer';
import { TechnologyDetector } from '../analysis/technologyDetector';
import { AnimationAnalyzer } from '../analysis/animationAnalyzer';
import { ThreeDAnalyzer } from '../analysis/threeDAnalyzer';
import { SectionDetector } from '../extraction/sectionDetector';
import { ComponentCandidateClassifier } from '../extraction/componentCandidateClassifier';
import { ExportPipeline } from '../generation/exportPipeline';

export class RequestRouter {
  private prisma = new PrismaClient();
  private websiteRepo = new PrismaWebsiteRepository();
  private pageRepo = new PrismaPageRepository();
  private sectionRepo = new PrismaSectionRepository();
  private componentRepo = new PrismaComponentRepository();
  private animationRepo = new PrismaAnimationRepository();
  private threeDRepo = new PrismaThreeDRepository();
  private assetRepo = new PrismaAssetRepository();
  private technologyRepo = new PrismaTechnologyRepository();
  private resourceRepo = new PrismaResourceRepository();
  private jobRepo = new PrismaJobRepository();
  private storageRepo = new PrismaStorageRepository();

  private browserManager: BrowserManager;
  private contextManager: BrowserContextManager;
  private pageManager: PageManager;
  private resourcePipeline = new ResourcePipeline();

  private startTime = Date.now();
  private isShutdownRequested = false;

  constructor(customBrowserManager?: BrowserManager) {
    this.browserManager = customBrowserManager || defaultBrowserManager;
    this.contextManager = new BrowserContextManager(this.browserManager);
    this.pageManager = new PageManager(this.contextManager);
  }

  public setShutdownRequested(flag: boolean): void {
    this.isShutdownRequested = flag;
  }

  public async routeRequest(req: IPCRequest): Promise<IPCResponse> {
    if (!req || typeof req !== 'object') {
      return this.createErrorResponse('unknown', 'INVALID_REQUEST', 'Malformed IPC payload: request must be an object.');
    }

    const requestId = req.id || 'unknown';

    if (!req.id || typeof req.id !== 'string') {
      return this.createErrorResponse(requestId, 'INVALID_REQUEST', 'Missing or invalid "id" field in IPC request.');
    }

    if (!req.method || typeof req.method !== 'string') {
      return this.createErrorResponse(requestId, 'INVALID_REQUEST', 'Missing or invalid "method" field in IPC request.');
    }

    if (req.protocolVersion !== CURRENT_PROTOCOL_VERSION) {
      return this.createErrorResponse(
        requestId,
        'PROTOCOL_MISMATCH',
        `Protocol version mismatch. Expected ${CURRENT_PROTOCOL_VERSION}, got ${req.protocolVersion}`
      );
    }

    if (this.isShutdownRequested && req.method !== IPC_METHODS.SYSTEM_SHUTDOWN) {
      return this.createErrorResponse(requestId, 'SHUTTING_DOWN', 'Engine sidecar is shutting down.');
    }

    const securityError = this.validateParamsSecurity(req.params);
    if (securityError) {
      return this.createErrorResponse(requestId, 'VALIDATION_FAILED', securityError);
    }

    try {
      switch (req.method) {
        // SYSTEM
        case IPC_METHODS.SYSTEM_PING:
          return this.createSuccessResponse(requestId, { pong: true, timestamp: new Date().toISOString() });

        case IPC_METHODS.SYSTEM_HEALTH: {
          const health: EngineHealth = {
            engineStatus: this.isShutdownRequested ? 'SHUTTING_DOWN' : 'READY',
            databaseStatus: 'CONNECTED',
            storageStatus: 'AVAILABLE',
            browserStatus: this.browserManager?.isHealthy() ? 'CONNECTED' : 'DISCONNECTED',
            version: '1.0.0',
            uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
            memoryUsageMb: Math.round((process.memoryUsage?.().heapUsed || 0) / 1024 / 1024),
          };
          return this.createSuccessResponse(requestId, health);
        }

        // BROWSER LIFECYCLE
        case IPC_METHODS.BROWSER_HEALTH:
          return this.createSuccessResponse(requestId, {
            healthy: this.browserManager.isHealthy(),
            status: this.browserManager.isHealthy() ? 'CONNECTED' : 'DISCONNECTED',
          });

        case IPC_METHODS.BROWSER_START:
          await this.browserManager.launch();
          return this.createSuccessResponse(requestId, { started: true });

        case IPC_METHODS.BROWSER_STOP:
          await this.browserManager.close();
          return this.createSuccessResponse(requestId, { stopped: true });

        case IPC_METHODS.BROWSER_RESTART:
          await this.browserManager.restart();
          return this.createSuccessResponse(requestId, { restarted: true });

        // CAPTURE SESSION & PAGE
        case IPC_METHODS.CAPTURE_SESSION_CREATE: {
          const { sessionId, headers } = req.params || {};
          if (!sessionId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required param "sessionId".');
          }
          await this.contextManager.createContext(sessionId, headers);
          return this.createSuccessResponse(requestId, { sessionId, created: true });
        }

        case IPC_METHODS.CAPTURE_SESSION_CLOSE: {
          const { sessionId } = req.params || {};
          if (!sessionId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required param "sessionId".');
          }
          await this.contextManager.closeContext(sessionId);
          return this.createSuccessResponse(requestId, { sessionId, closed: true });
        }

        case IPC_METHODS.PAGE_NAVIGATE: {
          const { sessionId, url, options } = req.params || {};
          if (!sessionId || !url) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required params "sessionId" or "url".');
          }
          const navResult = await this.pageManager.navigateAndObserve(sessionId, url, options);
          return this.createSuccessResponse(requestId, navResult);
        }

        case IPC_METHODS.PAGE_SCREENSHOT: {
          const { sessionId, options } = req.params || {};
          if (!sessionId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required param "sessionId".');
          }
          const shotResult = await this.pageManager.takeScreenshot(sessionId, options);
          return this.createSuccessResponse(requestId, shotResult);
        }

        case IPC_METHODS.PAGE_SNAPSHOT: {
          const { sessionId } = req.params || {};
          if (!sessionId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required param "sessionId".');
          }
          const html = await this.pageManager.getHtmlSnapshot(sessionId);
          return this.createSuccessResponse(requestId, { html });
        }

        // RESOURCE ENGINE
        case IPC_METHODS.RESOURCE_DISCOVER: {
          const { htmlContent, baseUrl: reqBaseUrl, contextInfo } = req.params || {};
          if (!htmlContent || !reqBaseUrl) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required params "htmlContent" or "baseUrl".');
          }
          const discovered = ResourceDiscoverer.discoverFromHTML(
            htmlContent,
            reqBaseUrl,
            contextInfo || { pageId: 'ipc-page', websiteId: 'ipc-site', sessionId: 'ipc-session' }
          );
          return this.createSuccessResponse(requestId, { resources: discovered });
        }

        case IPC_METHODS.CAPTURE_RESOURCES_START: {
          const { websiteId, pageId, pageUrl, htmlContent, discoveredResources } = req.params || {};
          if (!websiteId || !pageId || !pageUrl) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required pipeline parameters.');
          }
          const summary = await this.resourcePipeline.runCapturePipeline({
            websiteId,
            pageId,
            pageUrl,
            htmlContent,
            discoveredResources,
          });
          return this.createSuccessResponse(requestId, summary);
        }

        // REPOSITORIES (PRISMA DELEGATION)
        case IPC_METHODS.WEBSITE_GET_ALL:
          return this.createSuccessResponse(requestId, await this.websiteRepo.getAll());

        case IPC_METHODS.WEBSITE_GET_BY_ID:
          return this.createSuccessResponse(requestId, await this.websiteRepo.getById(req.params.id));

        case IPC_METHODS.WEBSITE_CREATE:
          return this.createSuccessResponse(requestId, await this.websiteRepo.create(req.params));

        case IPC_METHODS.WEBSITE_UPDATE:
          return this.createSuccessResponse(requestId, await this.websiteRepo.update(req.params.id, req.params.data));

        case IPC_METHODS.WEBSITE_DELETE:
          await this.websiteRepo.delete(req.params.id);
          return this.createSuccessResponse(requestId, { deleted: true });

        case IPC_METHODS.PAGE_GET_ALL:
          return this.createSuccessResponse(requestId, await this.pageRepo.getAll());

        case IPC_METHODS.PAGE_GET_BY_WEBSITE_ID:
          return this.createSuccessResponse(requestId, await this.pageRepo.getByWebsiteId(req.params.websiteId));

        case IPC_METHODS.PAGE_GET_BY_ID:
          return this.createSuccessResponse(requestId, await this.pageRepo.getById(req.params.id));

        case IPC_METHODS.SECTION_GET_ALL:
          return this.createSuccessResponse(requestId, await this.sectionRepo.getAll());

        case IPC_METHODS.SECTION_GET_BY_PAGE_ID:
          return this.createSuccessResponse(requestId, await this.sectionRepo.getByPageId(req.params.pageId));

        case IPC_METHODS.SECTION_GET_BY_WEBSITE_ID:
          return this.createSuccessResponse(requestId, await this.sectionRepo.getByWebsiteId(req.params.websiteId));

        case IPC_METHODS.SECTION_GET_BY_ID:
          return this.createSuccessResponse(requestId, await this.sectionRepo.getById(req.params.id));

        case IPC_METHODS.COMPONENT_GET_ALL_CANDIDATES:
          return this.createSuccessResponse(requestId, await this.componentRepo.getAllCandidates());

        case IPC_METHODS.COMPONENT_GET_CANDIDATE_BY_ID:
          return this.createSuccessResponse(requestId, await this.componentRepo.getCandidateById(req.params.id));

        case IPC_METHODS.COMPONENT_GET_BY_WEBSITE_ID:
          return this.createSuccessResponse(requestId, await this.componentRepo.getByWebsiteId(req.params.websiteId));

        case IPC_METHODS.COMPONENT_GET_BY_PAGE_ID:
          return this.createSuccessResponse(requestId, await this.componentRepo.getByPageId(req.params.pageId));

        case IPC_METHODS.COMPONENT_GET_BY_SECTION_ID:
          return this.createSuccessResponse(requestId, await this.componentRepo.getBySectionId(req.params.sectionId));

        case IPC_METHODS.COMPONENT_GET_REUSABLE:
          return this.createSuccessResponse(requestId, await this.componentRepo.getReusable());

        case IPC_METHODS.ANIMATION_GET_ALL:
          return this.createSuccessResponse(requestId, await this.animationRepo.getAll());

        case IPC_METHODS.ANIMATION_GET_BY_ID:
          return this.createSuccessResponse(requestId, await this.animationRepo.getById(req.params.id));

        case IPC_METHODS.ANIMATION_GET_BY_COMPONENT_ID:
          return this.createSuccessResponse(requestId, await this.animationRepo.getByComponentId(req.params.componentId));

        case IPC_METHODS.ANIMATION_GET_BY_PAGE_ID:
          return this.createSuccessResponse(requestId, await this.animationRepo.getByPageId(req.params.pageId));

        case IPC_METHODS.THREED_GET_ALL:
          return this.createSuccessResponse(requestId, await this.threeDRepo.getAll());

        case IPC_METHODS.THREED_GET_BY_ID:
          return this.createSuccessResponse(requestId, await this.threeDRepo.getById(req.params.id));

        case IPC_METHODS.STORAGE_GET_STATS:
          return this.createSuccessResponse(requestId, await this.storageRepo.getStats());

        case IPC_METHODS.STORAGE_CLEANUP:
          return this.createSuccessResponse(requestId, await this.storageRepo.cleanupTempFiles());

        // PHASE 7 RUNTIME ANALYSIS ENDPOINTS
        case IPC_METHODS.TECHNOLOGY_DETECT: {
          const { htmlContent, scriptUrls, networkUrls, windowGlobals } = req.params || {};
          if (!htmlContent) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required parameter "htmlContent".');
          }
          const detector = new TechnologyDetector();
          const techs = detector.detectTechnologies({
            htmlContent,
            scriptUrls: scriptUrls || [],
            networkUrls: networkUrls || [],
            windowGlobals: windowGlobals || [],
            domAttributes: {},
          });
          return this.createSuccessResponse(requestId, { technologies: techs });
        }

        case IPC_METHODS.ANIMATION_ANALYZE: {
          const { cssRules, waapiAnimations, gsapState, interactionsObserved, continuousLoopsObserved } = req.params || {};
          const analyzer = new AnimationAnalyzer();
          const anims = analyzer.analyzeAnimations({
            cssRules: cssRules || [],
            waapiAnimations: waapiAnimations || [],
            gsapState,
            interactionsObserved: interactionsObserved || [],
            continuousLoopsObserved: continuousLoopsObserved || [],
          });
          return this.createSuccessResponse(requestId, { animations: anims });
        }

        case IPC_METHODS.ANIMATION_LIST: {
          const { pageId, websiteId } = req.params || {};
          if (pageId) {
            return this.createSuccessResponse(requestId, await this.animationRepo.getByPageId(pageId));
          }
          return this.createSuccessResponse(requestId, await this.animationRepo.getAll());
        }

        case IPC_METHODS.THREED_ANALYZE: {
          const { canvases, threeState, babylonState, phase6Resources } = req.params || {};
          const analyzer = new ThreeDAnalyzer();
          const threeD = analyzer.analyzeThreeD({
            canvases: canvases || [],
            threeState,
            babylonState,
            phase6Resources: phase6Resources || [],
          });
          return this.createSuccessResponse(requestId, { threeDExperience: threeD });
        }

        case IPC_METHODS.THREED_LIST: {
          const { websiteId } = req.params || {};
          if (websiteId) {
            return this.createSuccessResponse(requestId, await this.threeDRepo.getByWebsiteId(websiteId));
          }
          return this.createSuccessResponse(requestId, await this.threeDRepo.getAll());
        }

        case IPC_METHODS.ANALYSIS_STATUS: {
          return this.createSuccessResponse(requestId, {
            status: 'READY',
            analyzersAvailable: ['TechnologyDetector', 'AnimationAnalyzer', 'ThreeDAnalyzer'],
            supportedPresets: ['quick', 'standard', '3d-heavy', 'custom'],
          });
        }

        // PHASE 8 EXTRACTION ENDPOINTS
        case IPC_METHODS.SECTION_DETECT: {
          const { domNodes } = req.params || {};
          if (!domNodes || !Array.isArray(domNodes)) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required array parameter "domNodes".');
          }
          const detector = new SectionDetector();
          const sections = detector.detectSections(domNodes);
          return this.createSuccessResponse(requestId, { sections });
        }

        case IPC_METHODS.COMPONENT_IDENTIFY_CANDIDATES: {
          const { sectionCandidate, websiteId, pageId } = req.params || {};
          if (!sectionCandidate || !websiteId || !pageId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required parameters "sectionCandidate", "websiteId", or "pageId".');
          }
          const classifier = new ComponentCandidateClassifier();
          const candidate = classifier.classifyCandidate({
            sectionCandidate,
            websiteId,
            pageId,
          });
          return this.createSuccessResponse(requestId, { candidate });
        }

        case IPC_METHODS.COMPONENT_LIST_CANDIDATES: {
          const { websiteId, pageId } = req.params || {};
          if (pageId) {
            return this.createSuccessResponse(requestId, await this.componentRepo.getByPageId(pageId));
          }
          if (websiteId) {
            return this.createSuccessResponse(requestId, await this.componentRepo.getByWebsiteId(websiteId));
          }
          return this.createSuccessResponse(requestId, await this.componentRepo.getAllCandidates());
        }

        // PHASE 9 GENERATION & EXPORT ENDPOINTS
        case IPC_METHODS.COMPONENT_EXPORT: {
          const { candidateId, options } = req.params || {};
          if (!candidateId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required parameter "candidateId".');
          }
          const pipeline = new ExportPipeline(this.prisma);
          const result = await pipeline.executeExportPipeline(candidateId, options);
          return this.createSuccessResponse(requestId, result);
        }

        case IPC_METHODS.COMPONENT_GET_REUSABLE_BY_ID: {
          const { candidateId } = req.params || {};
          if (!candidateId) {
            return this.createErrorResponse(requestId, 'VALIDATION_FAILED', 'Missing required parameter "candidateId".');
          }
          const reusable = await this.prisma.reusableComponent.findUnique({
            where: { candidateId },
          });
          return this.createSuccessResponse(requestId, { reusable });
        }

        default:
          return this.createErrorResponse(requestId, `METHOD_NOT_FOUND`, `Unsupported IPC method: ${req.method}`);
      }
    } catch (err: any) {
      console.error(`[RequestRouter] Internal error processing ${req.method}:`, err);
      return this.createErrorResponse(requestId, 'INTERNAL_ERROR', err.message || 'An internal error occurred.');
    }
  }

  private validateParamsSecurity(params: any): string | null {
    if (!params || typeof params !== 'object') return null;

    const checkValue = (val: any): string | null => {
      if (typeof val === 'string') {
        if (val.includes('../') || val.includes('..\\')) {
          return `Path traversal sequence detected in parameter value: "${val}"`;
        }
      } else if (typeof val === 'object' && val !== null) {
        for (const k of Object.keys(val)) {
          const err = checkValue(val[k]);
          if (err) return err;
        }
      }
      return null;
    };

    return checkValue(params);
  }

  private createSuccessResponse<T>(id: string, result: T): IPCResponse<T> {
    return { id, success: true, result };
  }

  private createErrorResponse(id: string, code: IPCErrorCode, message: string, details?: any): IPCResponse {
    return {
      id,
      success: false,
      error: { code, message, details },
    };
  }
}
