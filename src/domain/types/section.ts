import { ProcessStatus } from './common';

export type SectionCategory =
  | 'Hero'
  | 'Navigation'
  | 'Text Section'
  | 'Text Reveal'
  | 'Gallery'
  | 'Horizontal Gallery'
  | 'Card Grid'
  | '3D Scene'
  | '3D Product Viewer'
  | 'Particle Section'
  | 'Video Section'
  | 'Parallax Section'
  | 'Marquee'
  | 'Testimonials'
  | 'Footer'
  | 'Interactive Experience';

export interface SectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportRatio: number;
}

export interface Section {
  id: string;
  websiteId: string;
  websiteName: string;
  pageId: string;
  pagePath: string;
  title: string;
  category: SectionCategory;
  domSelector: string;
  domTagName: string;
  bounds: SectionBounds;
  previewScreenshot: string;
  status: ProcessStatus;
  isComponentCandidate: boolean;
  componentCandidateId?: string;
  animationIds: string[];
  threeDIds: string[];
  assetIds: string[];
  technologyIds: string[];
  createdAt: string;
}
