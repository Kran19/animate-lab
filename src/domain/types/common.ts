export type CrawlStatus = 'queued' | 'running' | 'paused' | 'completed' | 'partial' | 'failed' | 'canceled';
export type ProcessStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'failed' | 'unsupported';
export type ComponentCandidateStatus = 'candidate' | 'verified' | 'exported';

export interface Provenance {
  sourceWebsiteId: string;
  sourceWebsiteName: string;
  sourceWebsiteUrl: string;
  sourcePageId: string;
  sourcePagePath: string;
  sourceSectionId?: string;
  sourceSectionSelector?: string;
  originalUrl: string;
  captureDate: string;
  localFolderPath: string;
  licensingNotes?: string;
}

export interface StorageStats {
  totalBytes: number;
  websitesCount: number;
  pagesCount: number;
  sectionsCount: number;
  componentsCount: number;
  animationsCount: number;
  threeDCount: number;
  assetsCount: number;
  resourcesCount: number;
  storagePath: string;
  breakdown: {
    websitesBytes: number;
    componentsBytes: number;
    assetsBytes: number;
    databaseBytes: number;
    logsBytes: number;
  };
}

export type PreviewMode = 'original' | 'local_capture' | 'isolated_section' | 'generated_component';
