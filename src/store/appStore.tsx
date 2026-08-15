import React, { createContext, useContext, useState, useEffect } from 'react';
import { services } from '../bridge/appBridge';
import { Website, Page, Section, ComponentCandidate, Animation, ThreeDExperience, Asset, Technology, Resource, CaptureJob, StorageStats } from '../domain/types';

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

interface AppContextType {
  route: RouteState;
  navigate: (screen: ScreenId, params?: Partial<Omit<RouteState, 'screen'>>) => void;
  isCommandCenterOpen: boolean;
  setCommandCenterOpen: (open: boolean) => void;
  isCaptureWizardOpen: boolean;
  setCaptureWizardOpen: (open: boolean) => void;
  
  // Quick access data state
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>({ screen: 'dashboard' });
  const [isCommandCenterOpen, setCommandCenterOpen] = useState(false);
  const [isCaptureWizardOpen, setCaptureWizardOpen] = useState(false);

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

  const navigate = (screen: ScreenId, params: Partial<Omit<RouteState, 'screen'>> = {}) => {
    setRoute({ screen, ...params });
    window.scrollTo(0, 0);
  };

  const refreshData = async () => {
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
    } catch (err) {
      console.error('Failed to load repository data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandCenterOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
