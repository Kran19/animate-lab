import { ComponentCandidateStatus, Provenance } from './common';

export type ComponentCategory =
  | 'Hero'
  | 'Navigation'
  | 'Text'
  | 'Cards'
  | 'Gallery'
  | '3D'
  | 'WebGL'
  | 'Interaction'
  | 'Cursor'
  | 'Scroll'
  | 'Buttons'
  | 'Forms'
  | 'Backgrounds'
  | 'Loaders'
  | 'Transitions'
  | 'Other';

export interface ComponentEvidence {
  domStructureScore: number;
  animationCount: number;
  interactiveBehaviors: string[];
  associatedAssetsCount: number;
  detectedTechnologies: string[];
  visualCharacteristics: string[];
  confidenceScore: number; // 0.0 - 1.0
}

export interface ComponentSourceCode {
  originalHtml?: string;
  originalCss?: string;
  originalJs?: string;
  normalizedHtml?: string;
  normalizedCss?: string;
  normalizedJs?: string;
  generatedReactTsx?: string;
}

export interface ComponentCandidate {
  id: string;
  title: string;
  category: ComponentCategory;
  description: string;
  status: ComponentCandidateStatus;
  provenance: Provenance;
  evidence: ComponentEvidence;
  previewUrl: string;
  previewType: 'iframe' | 'canvas' | 'screenshot';
  technologyIds: string[];
  animationIds: string[];
  threeDIds: string[];
  assetIds: string[];
  resourceIds: string[];
  sourceCode: ComponentSourceCode;
  tags: string[];
  dependencies: string[];
  licensingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReusableComponent {
  id: string;
  candidateId: string;
  title: string;
  category: ComponentCategory;
  reactCode: string;
  cssCode: string;
  propsDocumentation: { name: string; type: string; description: string; required: boolean }[];
  exportFormat: 'react_tailwind' | 'react_css_modules' | 'vanilla_html_css';
  version: string;
  exportedAt: string;
}
