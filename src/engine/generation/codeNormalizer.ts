import { IsolatedComponent } from './componentIsolator';

export interface PortableAssetMapping {
  originalUrl: string;
  localPath: string;
  exportPath: string; // e.g. "assets/hero.webp"
  importName: string; // e.g. "heroAsset0"
  mimeType: string;
}

export interface NormalizedComponent {
  sourceCandidateId: string;
  websiteId: string;
  pageId: string;
  componentPrefix: string;
  title: string;
  category: string;
  normalizedHtml: string;
  scopedCss: string;
  portableAssets: PortableAssetMapping[];
  isolatedData: IsolatedComponent;
  diagnostics: string[];
  stage: 'NORMALIZED';
}

export class CodeNormalizer {
  /**
   * Scopes CSS rules, class names, keyframes, and global elements (html, body, :root)
   * and rewrites asset URLs to portable relative bundle asset paths.
   */
  public normalizeComponent(isolated: IsolatedComponent): NormalizedComponent {
    const diagnostics = [...isolated.diagnostics];
    const shortId = isolated.sourceCandidateId.substring(0, 6).toLowerCase();
    const componentPrefix = `al-${shortId}`;

    // 1. Portable Asset Mapping
    const portableAssets: PortableAssetMapping[] = isolated.assets.map((asset, idx) => {
      const ext = this.getExtensionFromMime(asset.mimeType, asset.originalUrl);
      const filename = `asset_${idx}${ext}`;
      return {
        originalUrl: asset.originalUrl,
        localPath: asset.localPath,
        exportPath: `assets/${filename}`,
        importName: `asset_${idx}`,
        mimeType: asset.mimeType,
      };
    });

    // 2. Class Name & Selector Scoping
    let normalizedHtml = isolated.html;
    let scopedCss = isolated.cssRules.join('\n');

    // Scope class names in HTML: class="hero-title" -> class="al-c1a2-hero-title"
    normalizedHtml = normalizedHtml.replace(/class=["']([^"']+)["']/g, (_, classStr) => {
      const classes = classStr.split(/\s+/).filter(Boolean);
      const scopedClasses = classes.map((c: string) => `${componentPrefix}-${c}`);
      return `class="${scopedClasses.join(' ')}"`;
    });

    // Scope class selectors in CSS: .hero-title -> .al-c1a2-hero-title
    scopedCss = scopedCss.replace(/\.([a-zA-Z0-9_-]+)/g, (match, className) => {
      // Do not double prefix
      if (className.startsWith(componentPrefix)) return match;
      return `.${componentPrefix}-${className}`;
    });

    // 3. Scope Keyframe rules
    const scopedKeyframeMap = new Map<string, string>();
    for (const kf of isolated.keyframes) {
      const scopedName = `${componentPrefix}-${kf.name}`;
      scopedKeyframeMap.set(kf.name, scopedName);
      const scopedRule = kf.ruleCss.replace(new RegExp(`@keyframes\\s+${kf.name}`, 'gi'), `@keyframes ${scopedName}`);
      scopedCss += `\n${scopedRule}`;
    }

    // Replace animation-name references in CSS with scoped keyframe names
    scopedKeyframeMap.forEach((scopedName, origName) => {
      const animRegex = new RegExp(`animation(-name)?\\s*:\\s*([^;}]*\\b)${origName}(\\b[^;}]*)`, 'gi');
      scopedCss = scopedCss.replace(animRegex, `$1: $2${scopedName}$3`);
    });

    // 4. Prevent Global Selector Leakage (body, html, :root, *)
    const globalTags = ['html', 'body', ':root', '\\*'];
    for (const tag of globalTags) {
      const globalRegex = new RegExp(`\\b${tag}\\s*\\{([^}]*)\\}`, 'gi');
      scopedCss = scopedCss.replace(globalRegex, (_, bodyContent) => {
        diagnostics.push(`Scoped global selector "${tag}" to container scope.`);
        return `.${componentPrefix}-root { ${bodyContent.trim()} }`;
      });
    }

    // Wrap unscoped top-level rules inside container selector
    if (scopedCss && !scopedCss.includes(`.${componentPrefix}`)) {
      scopedCss = `.${componentPrefix}-root {\n${scopedCss}\n}`;
    }

    // 5. Rewrite Asset URLs to relative bundle path
    for (const pa of portableAssets) {
      if (pa.originalUrl) {
        normalizedHtml = normalizedHtml.replace(new RegExp(this.escapeRegExp(pa.originalUrl), 'g'), `./${pa.exportPath}`);
        scopedCss = scopedCss.replace(new RegExp(this.escapeRegExp(pa.originalUrl), 'g'), `./${pa.exportPath}`);
      }
    }

    return {
      sourceCandidateId: isolated.sourceCandidateId,
      websiteId: isolated.websiteId,
      pageId: isolated.pageId,
      componentPrefix,
      title: isolated.title,
      category: isolated.category,
      normalizedHtml,
      scopedCss,
      portableAssets,
      isolatedData: isolated,
      diagnostics,
      stage: 'NORMALIZED',
    };
  }

  private getExtensionFromMime(mimeType: string, url: string): string {
    if (mimeType.includes('png')) return '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '.jpg';
    if (mimeType.includes('svg')) return '.svg';
    if (mimeType.includes('webp')) return '.webp';
    if (mimeType.includes('gltf') || url.endsWith('.gltf')) return '.gltf';
    if (mimeType.includes('glb') || url.endsWith('.glb')) return '.glb';
    return '.bin';
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
