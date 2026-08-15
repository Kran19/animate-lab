export type TechnologyCategory =
  | 'framework'
  | 'animation'
  | '3d'
  | 'utility'
  | 'styling'
  | 'scroll';

export type EvidenceType = 'dom' | 'script' | 'global_var' | 'asset' | 'network';

export interface TechnologyEvidence {
  id: string;
  technologyId: string;
  websiteId: string;
  pageId?: string;
  source: string; // e.g. "Window global __NEXT_DATA__", "Script tag https://.../gsap.min.js"
  evidenceType: EvidenceType;
  evidenceValue: string;
  confidence: number; // 0.0 - 1.0
  detectedAt: string;
}

export interface Technology {
  id: string;
  name: string;
  category: TechnologyCategory;
  version?: string;
  iconName: string;
  description: string;
  websiteCount: number;
  componentCount: number;
  evidence: TechnologyEvidence[];
}
