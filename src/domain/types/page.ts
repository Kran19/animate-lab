import { ProcessStatus } from './common';

export interface Page {
  id: string;
  websiteId: string;
  websiteName: string;
  url: string;
  path: string;
  title: string;
  screenshot: string;
  status: ProcessStatus;
  httpStatusCode: number;
  resourceCount: number;
  sectionCount: number;
  componentCount: number;
  animationCount: number;
  threeDCount: number;
  detectedTechIds: string[];
  createdAt: string;
  lastAnalyzedAt: string;
  errorMessage?: string;
}
