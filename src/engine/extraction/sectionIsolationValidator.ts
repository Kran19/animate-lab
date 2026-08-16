export interface SectionIsolationValidationInput {
  sectionId: string;
  sectionTitle: string;
  tsxCode: string;
  scopedCss: string;
  assets: Array<{ exportPath: string; localPath?: string; originalUrl: string }>;
  runtimeDependencies: string[];
  props: Array<{ name: string; required: boolean; isEvidenceBased: boolean }>;
}

export interface SectionIsolationReport {
  sectionId: string;
  isIsolated: boolean;
  status: 'ISOLATED' | 'PARTIAL' | 'UNSUPPORTED' | 'FAILED';
  layersPassed: string[];
  layersFailed: string[];
  violations: string[];
  warnings: string[];
}

export class SectionIsolationValidator {
  /**
   * Validates that an extracted section is truly standalone and independent of page-global assumptions.
   */
  public static validateSection(input: SectionIsolationValidationInput): SectionIsolationReport {
    const violations: string[] = [];
    const warnings: string[] = [];
    const layersPassed: string[] = [];
    const layersFailed: string[] = [];

    // 1. Global CSS Leakage Check (body, html, :root, *)
    const globalCssMatches = input.scopedCss.match(/\b(body|html|:root|\*)\s*\{/gi);
    if (globalCssMatches && globalCssMatches.length > 0) {
      violations.push(`CSS contains forbidden global selectors: ${globalCssMatches.join(', ')}`);
      layersFailed.push('CSS Isolation');
    } else {
      layersPassed.push('CSS Isolation');
    }

    // 2. AnimateLab Internal URL Leakage Check
    const internalUrlPatterns = ['localhost', '127.0.0.1', 'workspaces/', 'C:\\Users', 'file://'];
    const hasInternalUrls = internalUrlPatterns.some(
      (pat) => input.tsxCode.includes(pat) || input.scopedCss.includes(pat)
    );
    if (hasInternalUrls) {
      violations.push('Generated code contains references to internal AnimateLab or local filesystem paths.');
      layersFailed.push('URL Portability');
    } else {
      layersPassed.push('URL Portability');
    }

    // 3. Asset Reference Validation
    let hasBrokenAssets = false;
    for (const a of input.assets) {
      if (!a.exportPath.startsWith('./assets/') && !a.exportPath.startsWith('assets/')) {
        hasBrokenAssets = true;
        violations.push(`Asset "${a.originalUrl}" has non-portable export path "${a.exportPath}"`);
      }
    }
    if (hasBrokenAssets) {
      layersFailed.push('Asset Portability');
    } else {
      layersPassed.push('Asset Portability');
    }

    // 4. Evidence-Based Props Validation (No Fabricated Props)
    const hasFabricatedProps = input.props.some((p) => !p.isEvidenceBased);
    if (hasFabricatedProps) {
      violations.push('Contains fabricated props not substantiated by observable DOM/CSS evidence.');
      layersFailed.push('Props Invariant');
    } else {
      layersPassed.push('Props Invariant');
    }

    // 5. Unsupported Runtime Dependency Check
    const unsupportedDeps = ['Matter.js', 'WebAudio', 'WebSocket', 'CanvasPhysics'];
    const detectedUnsupported = input.runtimeDependencies.filter((d) => unsupportedDeps.includes(d));
    if (detectedUnsupported.length > 0) {
      warnings.push(`Specialized runtime dependencies require partial degradation: ${detectedUnsupported.join(', ')}`);
      layersFailed.push('Runtime Portability');
    } else {
      layersPassed.push('Runtime Portability');
    }

    // Determine Final Status
    let status: SectionIsolationReport['status'] = 'ISOLATED';
    if (violations.length > 0) {
      status = 'FAILED';
    } else if (warnings.length > 0 || detectedUnsupported.length > 0) {
      status = 'PARTIAL';
    }

    return {
      sectionId: input.sectionId,
      isIsolated: status === 'ISOLATED',
      status,
      layersPassed,
      layersFailed,
      violations,
      warnings,
    };
  }
}
