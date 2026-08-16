import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { services } from '../bridge/appBridge';
import {
  Website,
  Page,
  Section,
  ComponentCandidate,
  Animation,
  ThreeDExperience,
  Asset,
  Technology,
  Resource,
  CaptureJob,
  StorageStats,
  DiagnosticLog,
  CaptureSettings
} from '../domain/types';
import { IPCEvent } from '../engine/ipc/protocol';

export type ScreenId =
  | 'dashboard'
  | 'websites'
  | 'website_detail'
  | 'pages'
  | 'page_detail'
  | 'sections'
  | 'components'
  | 'component_detail'
  | 'animations'
  | 'threed'
  | 'assets'
  | 'technologies'
  | 'jobs'
  | 'source_inspector'
  | 'storage'
  | 'settings';

export interface RouteState {
  screen: ScreenId;
  websiteId?: string;
  pageId?: string;
  sectionId?: string;
  componentId?: string;
  animationId?: string;
  threeDId?: string;
  assetId?: string;
  jobId?: string;
}

export interface AppContextType {
  route: RouteState;
  navigate: (screen: ScreenId, params?: Partial<Omit<RouteState, 'screen'>>) => void;
  isCommandCenterOpen: boolean;
  setCommandCenterOpen: (open: boolean) => void;
  isCaptureWizardOpen: boolean;
  setCaptureWizardOpen: (open: boolean) => void;

  // Persisted Repository State
  websites: Website[];
  pages: Page[];
  sections: Section[];
  components: ComponentCandidate[];
  animations: Animation[];
  threeD: ThreeDExperience[];
  assets: Asset[];
  technologies: Technology[];
  resources: Resource[];
  jobs: CaptureJob[];
  storageStats?: StorageStats;
  loading: boolean;
  refreshData: () => Promise<void>;

  // Real-Time Event Stream & Mission Control State (Push-based, Zero Polling)
  events: IPCEvent[];
  diagnosticLogs: DiagnosticLog[];
  activeJob?: CaptureJob;
  activeJobStats?: {
    pending: number;
    visited: number;
    skipped: number;
    failed: number;
    totalDiscovered: number;
  };
  isAutoScrollLogs: boolean;
  setAutoScrollLogs: (auto: boolean) => void;
  clearEvents: () => void;
  clearDiagnosticLogs: () => void;

  // Job & Component Orchestration Actions
  startCaptureJob: (websiteId: string, settings?: CaptureSettings) => Promise<CaptureJob>;
  pauseCaptureJob: (jobId: string) => Promise<void>;
  resumeCaptureJob: (jobId: string) => Promise<void>;
  cancelCaptureJob: (jobId: string) => Promise<void>;
  exportComponentPackage: (candidateId: string, options?: any) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MAX_EVENT_HISTORY = 200;
const MAX_LOG_HISTORY = 300;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>({ screen: 'dashboard' });
  const [isCommandCenterOpen, setCommandCenterOpen] = useState(false);
  const [isCaptureWizardOpen, setCaptureWizardOpen] = useState(false);

  // Persisted Data Domains
  const [websites, setWebsites] = useState<Website[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [components, setComponents] = useState<ComponentCandidate[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [threeD, setThreeD] = useState<ThreeDExperience[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [jobs, setJobs] = useState<CaptureJob[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Real-Time Event & Mission Control State
  const [events, setEvents] = useState<IPCEvent[]>([]);
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>([]);
  const [activeJob, setActiveJob] = useState<CaptureJob | undefined>(undefined);
  const [activeJobStats, setActiveJobStats] = useState<any>(undefined);
  const [isAutoScrollLogs, setAutoScrollLogs] = useState(true);

  const activeJobRef = useRef<CaptureJob | undefined>(undefined);
  activeJobRef.current = activeJob;

  const navigate = useCallback((screen: ScreenId, params: Partial<Omit<RouteState, 'screen'>> = {}) => {
    setRoute({ screen, ...params });
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, p, s, c, a, t3d, ass, tech, res, j, st] = await Promise.all([
        services.websites.getAll(),
        services.pages.getAll(),
        services.sections.getAll(),
        services.components.getAllCandidates(),
        services.animations.getAll(),
        services.threeD.getAll(),
        services.assets.getAll(),
        services.technologies.getAll(),
        services.resources.getAll(),
        services.jobs.getAllJobs(),
        services.storage.getStats(),
      ]);

      setWebsites(w);
      setPages(p);
      setSections(s);
      setComponents(c);
      setAnimations(a);
      setThreeD(t3d);
      setAssets(ass);
      setTechnologies(tech);
      setResources(res);
      setJobs(j);
      setStorageStats(st);

      // If active job in progress, keep synced
      if (activeJobRef.current) {
        const found = j.find((job) => job.id === activeJobRef.current?.id);
        if (found) {
          setActiveJob(found);
        }
      } else {
        const running = j.find((job) => job.status === 'running' || job.status === 'paused');
        if (running) setActiveJob(running);
      }
    } catch (err) {
      console.error('Failed to load repository data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-Time Push Event Listener (Zero Polling)
  useEffect(() => {
    refreshData();

    if (!services.subscribeToEvents) return;

    const unsubscribe = services.subscribeToEvents((event: IPCEvent) => {
      // 1. Append Event to stream (bounded memory buffer)
      setEvents((prev) => [event, ...prev.slice(0, MAX_EVENT_HISTORY - 1)]);

      // 2. Handle specific push events
      const { payload } = event;
      switch (event.event) {
        case 'job.started': {
          if (payload?.jobId) {
            setActiveJob((prev) => ({
              id: payload.jobId,
              websiteId: payload.websiteId,
              websiteName: 'Crawl Target',
              websiteUrl: payload.url || '',
              status: 'running',
              progressPagesCompleted: 0,
              progressPagesTotal: payload.settings?.maxPages || 10,
              capturedResourcesCount: 0,
              discoveredAnimationsCount: 0,
              discoveredSectionsCount: 0,
              extractedComponentsCount: 0,
              currentAction: 'Crawl job initialized...',
              startTime: new Date().toISOString(),
              warningsCount: 0,
              errorsCount: 0,
              ...prev,
            }));
          }
          break;
        }

        case 'job.progress': {
          if (payload?.stats) {
            setActiveJobStats(payload.stats);
            setActiveJob((prev) => (prev ? {
              ...prev,
              progressPagesCompleted: payload.stats.visited,
              progressPagesTotal: payload.stats.totalDiscovered,
              errorsCount: payload.stats.failed,
            } : prev));
          }
          break;
        }

        case 'page.discovered': {
          setActiveJob((prev) => (prev ? {
            ...prev,
            currentAction: `Discovered link: ${payload?.url || ''}`,
          } : prev));
          break;
        }

        case 'page.captured': {
          setActiveJob((prev) => (prev ? {
            ...prev,
            currentAction: `Captured page: ${payload?.title || payload?.url || ''}`,
            extractedComponentsCount: (prev.extractedComponentsCount || 0) + (payload?.candidatesExtracted || 0),
          } : prev));
          break;
        }

        case 'job.paused': {
          setActiveJob((prev) => (prev ? { ...prev, status: 'paused', currentAction: 'Job paused.' } : prev));
          break;
        }

        case 'job.completed': {
          setActiveJob((prev) => (prev ? {
            ...prev,
            status: payload?.status || 'completed',
            currentAction: `Crawl finished (${payload?.status || 'completed'}).`,
            endTime: new Date().toISOString(),
          } : prev));
          refreshData();
          break;
        }

        case 'job.cancelled': {
          setActiveJob((prev) => (prev ? {
            ...prev,
            status: 'canceled',
            currentAction: 'Job cancelled by user.',
            endTime: new Date().toISOString(),
          } : prev));
          refreshData();
          break;
        }

        case 'job.failed': {
          setActiveJob((prev) => (prev ? {
            ...prev,
            status: 'failed',
            currentAction: `Job failed: ${payload?.error || 'Unknown error'}`,
            endTime: new Date().toISOString(),
          } : prev));
          refreshData();
          break;
        }

        case 'diagnostic.log': {
          if (payload) {
            setDiagnosticLogs((prev) => [payload as DiagnosticLog, ...prev.slice(0, MAX_LOG_HISTORY - 1)]);
          }
          break;
        }

        default:
          break;
      }
    });

    // Window event listener for in-browser extraction simulation
    const handleBrowserJobProgress = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setActiveJob((prev) => (prev ? {
          ...prev,
          websiteName: detail.websiteName || prev.websiteName,
          websiteUrl: detail.websiteUrl || prev.websiteUrl,
          status: detail.status || prev.status,
          progressPagesCompleted: detail.stats.visited,
          progressPagesTotal: detail.stats.totalDiscovered,
          currentAction: detail.action,
          discoveredSectionsCount: detail.discoveredSections || prev.discoveredSectionsCount,
          extractedComponentsCount: detail.extractedComponents || prev.extractedComponentsCount,
        } : prev));

        setActiveJobStats(detail.stats);

        // Append to Event Ticker
        const newEvent: IPCEvent = {
          event: 'job.progress',
          payload: { action: detail.action, stats: detail.stats },
          timestamp: new Date().toISOString(),
        };
        setEvents((prev) => [newEvent, ...prev.slice(0, MAX_EVENT_HISTORY - 1)]);

        // Append to Streaming Diagnostic Terminal
        const newLog: DiagnosticLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          level: 'info',
          module: 'CrawlerOrchestrator',
          message: detail.action,
          details: { progress: detail.stats.visited, total: detail.stats.totalDiscovered },
        };
        setDiagnosticLogs((prev) => [newLog, ...prev.slice(0, MAX_LOG_HISTORY - 1)]);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('animatelab:job_progress', handleBrowserJobProgress);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('animatelab:job_progress', handleBrowserJobProgress);
      }
    };
  }, [refreshData]);

  // Keyboard shortcut for command center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandCenterOpen((prev) => !prev);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const clearDiagnosticLogs = useCallback(() => {
    setDiagnosticLogs([]);
  }, []);

  // Job Orchestration Actions
  const startCaptureJob = useCallback(async (websiteId: string, settings?: CaptureSettings): Promise<CaptureJob> => {
    if (services.jobs.startJob) {
      const job = await services.jobs.startJob(websiteId, settings);
      setActiveJob(job);
      if (services.emitEvent) {
        services.emitEvent('job.started', { jobId: job.id, websiteId, settings });
      }
      return job;
    }
    throw new Error('startJob is not supported in the active repository mode.');
  }, []);

  const pauseCaptureJob = useCallback(async (jobId: string) => {
    await services.jobs.pauseJob(jobId);
    setActiveJob((prev) => (prev?.id === jobId ? { ...prev, status: 'paused' } : prev));
    if (services.emitEvent) {
      services.emitEvent('job.paused', { jobId });
    }
  }, []);

  const resumeCaptureJob = useCallback(async (jobId: string) => {
    await services.jobs.resumeJob(jobId);
    setActiveJob((prev) => (prev?.id === jobId ? { ...prev, status: 'running' } : prev));
    if (services.emitEvent) {
      services.emitEvent('job.started', { jobId });
    }
  }, []);

  const cancelCaptureJob = useCallback(async (jobId: string) => {
    await services.jobs.cancelJob(jobId);
    setActiveJob((prev) => (prev?.id === jobId ? { ...prev, status: 'canceled' } : prev));
    if (services.emitEvent) {
      services.emitEvent('job.cancelled', { jobId });
    }
  }, []);

  const exportComponentPackage = useCallback(async (candidateId: string, options?: any) => {
    if (services.components.exportComponent) {
      return await services.components.exportComponent(candidateId, options);
    }
    throw new Error('exportComponent is not supported in the active repository mode.');
  }, []);

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        isCommandCenterOpen,
        setCommandCenterOpen,
        isCaptureWizardOpen,
        setCaptureWizardOpen,
        websites,
        pages,
        sections,
        components,
        animations,
        threeD,
        assets,
        technologies,
        resources,
        jobs,
        storageStats,
        loading,
        refreshData,
        events,
        diagnosticLogs,
        activeJob,
        activeJobStats,
        isAutoScrollLogs,
        setAutoScrollLogs,
        clearEvents,
        clearDiagnosticLogs,
        startCaptureJob,
        pauseCaptureJob,
        resumeCaptureJob,
        cancelCaptureJob,
        exportComponentPackage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
