import { ProcessStatus } from './common';

export type ThreeDType =
  | 'three_js'
  | 'babylon_js'
  | 'pixi_js'
  | 'raw_webgl'
  | 'webgl2'
  | 'shader_canvas'
  | 'spline_3d';

export interface ThreeDExperience {
  id: string;
  websiteId: string;
  websiteName: string;
  pageId: string;
  pagePath: string;
  sectionId?: string;
  componentCandidateId?: string;
  title: string;
  type: ThreeDType;
  canvasCount: number;
  webGlContextType: 'webgl' | 'webgl2' | '2d';
  fpsEstimate: number;
  shaderCount: number;
  modelCount: number;
  textureCount: number;
  models: { name: string; format: string; sizeBytes: number; localPath: string }[];
  textures: { name: string; dimensions: string; localPath: string }[];
  shaderSnippets: { name: string; type: 'vertex' | 'fragment'; code: string }[];
  status: ProcessStatus;
  statusNotes: string;
  previewImage: string;
  createdAt: string;
}
