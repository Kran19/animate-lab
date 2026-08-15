export type AssetType =
  | 'image'
  | 'video'
  | 'svg'
  | 'font'
  | '3d_model'
  | 'texture'
  | 'hdr'
  | 'shader';

export interface Asset {
  id: string;
  websiteId: string;
  websiteName: string;
  pageId?: string;
  resourceId?: string;
  componentCandidateId?: string;
  title: string;
  type: AssetType;
  dimensions?: string; // e.g. "1920x1080"
  fileSizeBytes: number;
  mimeType: string;
  localPath: string;
  sourceUrl: string;
  previewUrl: string;
  createdAt: string;
}
