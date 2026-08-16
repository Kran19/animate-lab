export interface ComponentDependenciesManifest {
  npm: Record<string, string>;
  browserApis: string[];
  runtime: string[];
  fonts: string[];
  externalUrls: string[];
  assumptions: string[];
  initializationRequirements: string[];
  cleanupRequirements: string[];
}

export class DependencyManifestGenerator {
  /**
   * Generates a precise, machine-readable dependency manifest for an isolated component.
   */
  public static generateManifest(input: {
    technologies: string[];
    animations: Array<{ technology: string; dependencies?: string[] }>;
    fonts?: Array<{ family: string }>;
    externalAssets?: string[];
  }): ComponentDependenciesManifest {
    const npm: Record<string, string> = {
      react: '^18.0.0 || ^19.0.0',
      'react-dom': '^18.0.0 || ^19.0.0',
    };

    const browserApis = new Set<string>();
    const runtime = new Set<string>();
    const fonts = new Set<string>();
    const assumptions: string[] = ['Standard modern browser environment (ES2020+).'];
    const initializationRequirements: string[] = [];
    const cleanupRequirements: string[] = [];

    // Analyze detected technologies & animations
    for (const tech of input.technologies) {
      if (tech.includes('GSAP')) {
        npm['gsap'] = '^3.12.5';
        cleanupRequirements.push('Kill GSAP timeline/tween instances on component unmount.');
      }
      if (tech.includes('ScrollTrigger')) {
        npm['gsap'] = '^3.12.5';
        browserApis.add('IntersectionObserver');
        browserApis.add('ResizeObserver');
        cleanupRequirements.push('ScrollTrigger.getAll().forEach(t => t.kill()) on unmount.');
      }
      if (tech.includes('Three') || tech.includes('WebGL')) {
        npm['three'] = '^0.160.0';
        runtime.add('WebGL2');
        runtime.add('GPU Acceleration');
        initializationRequirements.push('Mount Three.js WebGLRenderer on DOM canvas reference.');
        cleanupRequirements.push('Dispose Three.js geometries, materials, and renderer context on unmount.');
      }
      if (tech.includes('Lottie')) {
        npm['lottie-web'] = '^5.12.0';
        cleanupRequirements.push('Call animationInstance.destroy() on unmount.');
      }
      if (tech.includes('Tailwind')) {
        assumptions.push('Target project must have TailwindCSS setup or import the scoped Component.css module.');
      }
    }

    // Font dependencies
    if (input.fonts) {
      for (const f of input.fonts) {
        fonts.add(f.family);
      }
    }

    return {
      npm,
      browserApis: Array.from(browserApis),
      runtime: Array.from(runtime),
      fonts: Array.from(fonts),
      externalUrls: input.externalAssets || [],
      assumptions,
      initializationRequirements,
      cleanupRequirements,
    };
  }
}
