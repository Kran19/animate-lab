import { URLNormalizer, DiscoveredResourceMetadata } from './urlNormalizer';

export class ResourceDiscoverer {
  /**
   * Discovers all candidate resources from HTML content.
   */
  public static discoverFromHTML(
    html: string,
    baseUrl: string,
    contextInfo: { pageId: string; websiteId: string; sessionId: string }
  ): DiscoveredResourceMetadata[] {
    const results: DiscoveredResourceMetadata[] = [];
    const seenUrls = new Set<string>();

    const addResource = (rawUrl: string, method: DiscoveredResourceMetadata['discoveryMethod']) => {
      const normalized = URLNormalizer.normalize(rawUrl, baseUrl);
      if (!normalized || seenUrls.has(normalized.originalUrl)) return;

      seenUrls.add(normalized.originalUrl);
      const resourceType = URLNormalizer.classifyResource(undefined, normalized.originalUrl);

      results.push({
        originalUrl: normalized.originalUrl,
        canonicalUrl: normalized.canonicalUrl,
        discoveryMethod: method,
        resourceType,
        pageId: contextInfo.pageId,
        websiteId: contextInfo.websiteId,
        sessionId: contextInfo.sessionId,
        discoveredAt: new Date().toISOString(),
      });
    };

    // 1. Regex match for standard src / href attributes
    const srcRegex = /\b(?:src|href|data-src|poster|action)\s*=\s*["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = srcRegex.exec(html)) !== null) {
      addResource(match[1], 'HTML');
    }

    // 2. Srcset attribute parser (e.g. srcset="img-1x.jpg 1x, img-2x.jpg 2x")
    const srcsetRegex = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
    while ((match = srcsetRegex.exec(html)) !== null) {
      const parts = match[1].split(',');
      for (const part of parts) {
        const candidateUrl = part.trim().split(/\s+/)[0];
        if (candidateUrl) addResource(candidateUrl, 'HTML');
      }
    }

    // 3. Link tags with rel hints
    const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      addResource(match[1], 'RESOURCE_HINT');
    }

    // 4. Inline CSS Discovery inside <style> tags
    const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    while ((match = styleBlockRegex.exec(html)) !== null) {
      const cssContent = match[1];
      const cssResources = this.discoverFromCSS(cssContent, baseUrl, contextInfo);
      for (const res of cssResources) {
        if (!seenUrls.has(res.originalUrl)) {
          seenUrls.add(res.originalUrl);
          results.push(res);
        }
      }
    }

    return results;
  }

  /**
   * Discovers resources embedded within CSS content (url(...) & @import).
   */
  public static discoverFromCSS(
    css: string,
    baseUrl: string,
    contextInfo: { pageId: string; websiteId: string; sessionId: string }
  ): DiscoveredResourceMetadata[] {
    const results: DiscoveredResourceMetadata[] = [];
    const seenUrls = new Set<string>();

    const addResource = (rawUrl: string) => {
      // Clean quotes or url() wrappers
      const cleanUrl = rawUrl.replace(/^url\((['"]?)(.*?)\1\)$/gi, '$2').trim();
      const normalized = URLNormalizer.normalize(cleanUrl, baseUrl);
      if (!normalized || seenUrls.has(normalized.originalUrl)) return;

      seenUrls.add(normalized.originalUrl);
      const resourceType = URLNormalizer.classifyResource(undefined, normalized.originalUrl, 'CSS');

      results.push({
        originalUrl: normalized.originalUrl,
        canonicalUrl: normalized.canonicalUrl,
        discoveryMethod: 'CSS',
        resourceType,
        pageId: contextInfo.pageId,
        websiteId: contextInfo.websiteId,
        sessionId: contextInfo.sessionId,
        discoveredAt: new Date().toISOString(),
      });
    };

    // 1. Match url(...) references
    const urlRegex = /url\s*\(\s*["']?([^"'\)]+)["']?\s*\)/gi;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(css)) !== null) {
      addResource(match[1]);
    }

    // 2. Match @import statements
    const importRegex = /@import\s+(?:url\s*\(\s*["']?([^"'\)]+)["']?\s*\)|["']([^"']+)["'])/gi;
    while ((match = importRegex.exec(css)) !== null) {
      addResource(match[1] || match[2]);
    }

    return results;
  }

  /**
   * Discovers static resource references from JavaScript source files.
   */
  public static discoverFromJS(
    js: string,
    baseUrl: string,
    contextInfo: { pageId: string; websiteId: string; sessionId: string }
  ): DiscoveredResourceMetadata[] {
    const results: DiscoveredResourceMetadata[] = [];
    const seenUrls = new Set<string>();

    // Match static string literals ending with common creative asset extensions
    const assetStringRegex = /["']([^"'\s]+\.(?:png|jpg|jpeg|webp|svg|glb|gltf|bin|woff2|mp4|webm|hdr|glsl|wasm))["']/gi;
    let match: RegExpExecArray | null;
    while ((match = assetStringRegex.exec(js)) !== null) {
      const normalized = URLNormalizer.normalize(match[1], baseUrl);
      if (normalized && !seenUrls.has(normalized.originalUrl)) {
        seenUrls.add(normalized.originalUrl);
        results.push({
          originalUrl: normalized.originalUrl,
          canonicalUrl: normalized.canonicalUrl,
          discoveryMethod: 'JAVASCRIPT',
          resourceType: URLNormalizer.classifyResource(undefined, normalized.originalUrl),
          pageId: contextInfo.pageId,
          websiteId: contextInfo.websiteId,
          sessionId: contextInfo.sessionId,
          discoveredAt: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Inspects GLTF JSON to discover associated external binary buffers & image textures.
   */
  public static discoverFromGLTF(
    gltfJsonStr: string,
    gltfUrl: string,
    contextInfo: { pageId: string; websiteId: string; sessionId: string }
  ): DiscoveredResourceMetadata[] {
    const results: DiscoveredResourceMetadata[] = [];
    try {
      const gltf = JSON.parse(gltfJsonStr);

      const addDep = (uri: string, category: DiscoveredResourceMetadata['resourceType']) => {
        if (!uri || uri.startsWith('data:')) return;
        const normalized = URLNormalizer.normalize(uri, gltfUrl);
        if (normalized) {
          results.push({
            originalUrl: normalized.originalUrl,
            canonicalUrl: normalized.canonicalUrl,
            discoveryMethod: 'GLTF',
            resourceType: category,
            pageId: contextInfo.pageId,
            websiteId: contextInfo.websiteId,
            sessionId: contextInfo.sessionId,
            discoveredAt: new Date().toISOString(),
          });
        }
      };

      // Discover GLTF buffers (.bin)
      if (Array.isArray(gltf.buffers)) {
        for (const buf of gltf.buffers) {
          if (buf?.uri) addDep(buf.uri, '3D model');
        }
      }

      // Discover GLTF image textures
      if (Array.isArray(gltf.images)) {
        for (const img of gltf.images) {
          if (img?.uri) addDep(img.uri, 'Texture');
        }
      }
    } catch (e) {
      // Invalid GLTF JSON
    }

    return results;
  }
}
