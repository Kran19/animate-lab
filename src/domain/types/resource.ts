export type ResourceType =
  | 'html'
  | 'css'
  | 'js'
  | 'json'
  | 'image'
  | 'svg'
  | 'video'
  | 'audio'
  | 'font'
  | '3d_model'
  | 'texture'
  | 'hdr'
  | 'shader'
  | 'other';

export interface Resource {
  id: string;
  websiteId: string;
  pageId: string;
  originalUrl: string;
  localPath: string;
  mimeType: string;
  sizeBytes: number;
  hash: string;
  resourceType: ResourceType;
  capturedAt: string;
  contentSnippet?: string;
}
