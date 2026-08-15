import { CrawlStatus } from './common';

export type LogLevel = 'info' | 'warn' | 'error';
export type LogModule = 'Crawler' | 'Browser' | 'Analyzer' | 'ResourceCollector' | 'SectionDetector' | 'ComponentClassifier';

export interface DiagnosticLog {
  id: string;
  jobId: string;
  websiteId: string;
  timestamp: string;
  level: LogLevel;
  module: LogModule;
  message: string;
  details?: string;
}

export interface CaptureJob {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  status: CrawlStatus;
  progressPagesCompleted: number;
  progressPagesTotal: number;
  capturedResourcesCount: number;
  discoveredAnimationsCount: number;
  discoveredSectionsCount: number;
  extractedComponentsCount: number;
  currentAction: string;
  currentPageUrl?: string;
  startTime: string;
  endTime?: string;
  warningsCount: number;
  errorsCount: number;
}
