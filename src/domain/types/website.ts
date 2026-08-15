import { CrawlStatus } from './common';

export type CrawlMode = 'single_page' | 'same_domain' | 'subpaths_only' | 'custom_depth';

export interface CaptureSettings {
  crawlMode: CrawlMode;
  maxPages: number;
  maxDepth: number;
  captureImages: boolean;
  captureMedia: boolean;
  captureFonts: boolean;
  captureShaders: boolean;
  capture3DAssets: boolean;
  detectAnimations: boolean;
  detectSections: boolean;
  extractComponents: boolean;
  respectRobotsTxt: boolean;
  rateLimitMs: number;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  status: CrawlStatus;
  faviconUrl: string;
  previewScreenshot: string;
  captureSettings: CaptureSettings;
  totalPages: number;
  totalSections: number;
  totalComponents: number;
  totalAnimations: number;
  total3D: number;
  totalResources: number;
  totalStorageBytes: number;
  createdAt: string;
  lastAnalyzedAt: string;
  storagePath: string;
  provenanceNotes?: string;
}
