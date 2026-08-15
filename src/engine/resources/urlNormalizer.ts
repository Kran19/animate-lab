import { URL } from 'url';

export interface DiscoveredResourceMetadata {
  originalUrl: string;
  canonicalUrl: string;
  discoveryMethod: 'NETWORK' | 'HTML' | 'CSS' | 'JAVASCRIPT' | 'RESOURCE_HINT' | 'GLTF' | 'MANIFEST' | 'OTHER';
  resourceType: ResourceCategory;
  pageId: string;
  websiteId: string;
  sessionId: string;
  requestMethod?: string;
  statusCode?: number;
  mimeType?: string;
  contentLength?: number;
  referer?: string;
  discoveredAt: string;
}

export type ResourceCategory =
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'JSON'
  | 'Image'
  | 'SVG'
  | 'Font'
  | 'Video'
  | 'Audio'
  | '3D model'
  | 'Texture'
  | 'HDR/environment'
  | 'Shader'
  | 'WASM'
  | 'Other/binary'
  | 'Unknown';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  '_ga',
  '_gl',
  'mc_eid',
]);

export class URLNormalizer {
  /**
   * Normalizes an absolute or relative URL against a base URL conservatively.
   */
  public static normalize(rawUrl: string, baseUrl: string): { originalUrl: string; canonicalUrl: string } | null {
    if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('javascript:')) {
      return null;
    }

    try {
      const resolved = new URL(rawUrl, baseUrl);

      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
        return null;
      }

      const originalUrl = resolved.toString();
      const canonical = new URL(originalUrl);
      const params = new URLSearchParams(canonical.search);

      let modified = false;
      for (const paramKey of Array.from(params.keys())) {
        if (TRACKING_PARAMS.has(paramKey.toLowerCase())) {
          params.delete(paramKey);
          modified = true;
        }
      }

      if (modified) {
        canonical.search = params.toString();
      }

      if (canonical.pathname.endsWith('/') && canonical.pathname !== '/') {
        canonical.pathname = canonical.pathname.slice(0, -1);
      }

      return {
        originalUrl,
        canonicalUrl: canonical.toString(),
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Classifies resource type using MIME type, file extension, and context hints.
   */
  public static classifyResource(mimeType?: string, url?: string, context?: string): ResourceCategory {
    const mime = (mimeType || '').toLowerCase();
    const pathname = url ? new URL(url, 'http://localhost').pathname.toLowerCase() : '';

    if (mime.includes('text/css')) return 'CSS';
    if (mime.includes('javascript') || mime.includes('ecmascript')) return 'JavaScript';
    if (mime.includes('text/html')) return 'HTML';
    if (mime.includes('application/json')) return 'JSON';
    if (mime.includes('image/svg+xml')) return 'SVG';
    if (mime.includes('image/')) return 'Image';
    if (mime.includes('font/') || mime.includes('application/x-font')) return 'Font';
    if (mime.includes('video/')) return 'Video';
    if (mime.includes('audio/')) return 'Audio';
    if (mime.includes('model/gltf') || mime.includes('model/obj')) return '3D model';
    if (mime.includes('application/wasm')) return 'WASM';

    if (pathname.endsWith('.css')) return 'CSS';
    if (pathname.endsWith('.js') || pathname.endsWith('.mjs')) return 'JavaScript';
    if (pathname.endsWith('.json')) return 'JSON';
    if (pathname.endsWith('.svg')) return 'SVG';
    if (/\.(png|jpg|jpeg|webp|gif|avif|bmp|tiff)$/.test(pathname)) return 'Image';
    if (/\.(woff|woff2|ttf|otf|eot)$/.test(pathname)) return 'Font';
    if (/\.(mp4|webm|mov|m4v|ogv)$/.test(pathname)) return 'Video';
    if (/\.(mp3|wav|ogg|flac|aac)$/.test(pathname)) return 'Audio';
    if (/\.(glb|gltf|obj|fbx|usdz)$/.test(pathname)) return '3D model';
    if (/\.(hdr|exr|ktx|ktx2|basis)$/.test(pathname)) return 'Texture';
    if (/\.(glsl|vert|frag)$/.test(pathname)) return 'Shader';
    if (pathname.endsWith('.wasm')) return 'WASM';

    if (context === 'CSS') return 'CSS';
    if (context === 'HTML_SCRIPT') return 'JavaScript';
    if (context === 'HTML_STYLE') return 'CSS';

    return 'Other/binary';
  }

  /**
   * SSRF & Private Network Policy check.
   */
  public static isPrivateNetworkTarget(urlStr: string): boolean {
    try {
      const hostname = new URL(urlStr).hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return true;
      }
      if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('169.254.')) {
        return true;
      }
      if (hostname.startsWith('172.')) {
        const parts = hostname.split('.');
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
