export interface DiscoveredThreeDExperience {
  title: string;
  type: 'threejs' | 'babylonjs' | 'custom_webgl' | 'webgl2' | 'webgpu' | 'canvas2d';
  canvasCount: number;
  webGlContextType: 'webgl' | 'webgl2' | 'webgpu' | '2d' | 'none';
  fpsEstimate: number;
  shaderCount: number;
  modelCount: number;
  textureCount: number;
  modelsJson: string;
  texturesJson: string;
  shaderSnippetsJson: string;
  status: 'completed' | 'partially_analyzed' | 'unsupported' | 'failed';
  statusNotes: string;
  previewImage?: string;
  evidence: {
    runtimeEvidence: string;
    domEvidence: string;
    scriptEvidence: string;
    confidence: number;
  };
}

export interface ThreeDAnalysisInput {
  canvases: Array<{
    selector: string;
    contextType: 'webgl' | 'webgl2' | 'webgpu' | '2d' | 'none';
    width: number;
    height: number;
  }>;
  threeState?: {
    isLoaded: boolean;
    version?: string;
    hasActiveRenderer?: boolean;
    sceneCount?: number;
    meshCount?: number;
    modelsLoaded?: string[];
    texturesLoaded?: string[];
    shadersExtracted?: Array<{
      type: 'vertex' | 'fragment';
      sourceSnippet: string;
      uniforms: string[];
      isObfuscated?: boolean;
    }>;
  };
  babylonState?: {
    isLoaded: boolean;
    version?: string;
    engineCount?: number;
    sceneCount?: number;
  };
  phase6Resources?: Array<{
    originalUrl: string;
    mimeType: string;
    resourceType: string;
    contentHash: string;
    localPath: string;
  }>;
}

export class ThreeDAnalyzer {
  public analyzeThreeD(input: ThreeDAnalysisInput): DiscoveredThreeDExperience | null {
    if (!input.canvases || input.canvases.length === 0) {
      return null;
    }

    const canvasCount = input.canvases.length;
    const primaryCanvas = input.canvases[0];

    // 1. Differentiate Context Types
    if (primaryCanvas.contextType === '2d') {
      return {
        title: 'Canvas 2D Rendering Surface',
        type: 'canvas2d',
        canvasCount,
        webGlContextType: '2d',
        fpsEstimate: 60,
        shaderCount: 0,
        modelCount: 0,
        textureCount: 0,
        modelsJson: '[]',
        texturesJson: '[]',
        shaderSnippetsJson: '[]',
        status: 'completed',
        statusNotes: 'Differentiated as 2D Canvas Context (Not 3D WebGL)',
        evidence: {
          runtimeEvidence: 'HTMLCanvasElement.getContext("2d") detected',
          domEvidence: `Canvas selector ${primaryCanvas.selector}`,
          scriptEvidence: 'Canvas 2D Context API',
          confidence: 0.95,
        },
      };
    }

    // 2. Three.js Experience Detection
    if (input.threeState?.isLoaded) {
      const models = input.threeState.modelsLoaded || [];
      const textures = input.threeState.texturesLoaded || [];

      // Correlate with Phase 6 resources
      if (input.phase6Resources) {
        for (const res of input.phase6Resources) {
          if ((res.mimeType.includes('model') || res.originalUrl.endsWith('.glb') || res.originalUrl.endsWith('.gltf')) && !models.includes(res.originalUrl)) {
            models.push(res.originalUrl);
          }
          if (res.mimeType.startsWith('image/') && !textures.includes(res.originalUrl)) {
            textures.push(res.originalUrl);
          }
        }
      }

      const shaders = input.threeState.shadersExtracted || [];
      const isObfuscated = shaders.some((s) => s.isObfuscated);
      const status = isObfuscated ? 'partially_analyzed' : 'completed';
      const statusNotes = isObfuscated
        ? 'Three.js 3D Experience captured with obfuscated/inaccessible shader uniforms'
        : 'Complete Three.js 3D Experience analyzed cleanly';

      return {
        title: `Three.js 3D Experience (${input.threeState.version || 'r150+'})`,
        type: 'threejs',
        canvasCount,
        webGlContextType: primaryCanvas.contextType === 'webgl2' ? 'webgl2' : 'webgl',
        fpsEstimate: 60,
        shaderCount: shaders.length,
        modelCount: models.length,
        textureCount: textures.length,
        modelsJson: JSON.stringify(models),
        texturesJson: JSON.stringify(textures),
        shaderSnippetsJson: JSON.stringify(shaders),
        status,
        statusNotes,
        evidence: {
          runtimeEvidence: `window.THREE object detected with ${input.threeState.sceneCount || 1} active scene(s)`,
          domEvidence: `WebGL Canvas target: ${primaryCanvas.selector}`,
          scriptEvidence: `Three.js WebGLRenderer active instance`,
          confidence: 0.95,
        },
      };
    }

    // 3. Babylon.js Experience Detection
    if (input.babylonState?.isLoaded) {
      return {
        title: `Babylon.js 3D Experience (${input.babylonState.version || 'v5+'})`,
        type: 'babylonjs',
        canvasCount,
        webGlContextType: primaryCanvas.contextType === 'webgl2' ? 'webgl2' : 'webgl',
        fpsEstimate: 60,
        shaderCount: 0,
        modelCount: 0,
        textureCount: 0,
        modelsJson: '[]',
        texturesJson: '[]',
        shaderSnippetsJson: '[]',
        status: 'completed',
        statusNotes: 'Babylon.js 3D Engine detected',
        evidence: {
          runtimeEvidence: 'window.BABYLON object detected',
          domEvidence: `Canvas selector: ${primaryCanvas.selector}`,
          scriptEvidence: 'Babylon Engine active instance',
          confidence: 0.95,
        },
      };
    }

    // 4. Custom WebGL / WebGL2 / WebGPU Experience
    if (primaryCanvas.contextType === 'webgl' || primaryCanvas.contextType === 'webgl2' || primaryCanvas.contextType === 'webgpu') {
      return {
        title: `Custom ${primaryCanvas.contextType.toUpperCase()} Graphics Surface`,
        type: primaryCanvas.contextType === 'webgl2' ? 'webgl2' : primaryCanvas.contextType === 'webgpu' ? 'webgpu' : 'custom_webgl',
        canvasCount,
        webGlContextType: primaryCanvas.contextType,
        fpsEstimate: 60,
        shaderCount: 0,
        modelCount: 0,
        textureCount: 0,
        modelsJson: '[]',
        texturesJson: '[]',
        shaderSnippetsJson: '[]',
        status: 'completed',
        statusNotes: `Custom ${primaryCanvas.contextType.toUpperCase()} context observed`,
        evidence: {
          runtimeEvidence: `HTMLCanvasElement.getContext("${primaryCanvas.contextType}") active context`,
          domEvidence: `Canvas selector: ${primaryCanvas.selector}`,
          scriptEvidence: `Native WebGL Context API`,
          confidence: 0.9,
        },
      };
    }

    return null;
  }
}
