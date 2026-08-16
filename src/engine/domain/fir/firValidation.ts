import { SectionFIR } from './sectionFIR';
import { CURRENT_FIR_SCHEMA_URL, isFIRVersionCompatible } from './firVersion';
import * as crypto from 'crypto';

export interface FIRValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  integrityHash: string;
}

export class FIRValidator {
  /**
   * Computes a canonical SHA-256 hash across the FIR payload (excluding diagnostics.integrityHash).
   */
  public static computeIntegrityHash(fir: Omit<SectionFIR, 'diagnostics'> & { diagnostics?: Partial<SectionFIR['diagnostics']> }): string {
    const payloadCopy = {
      schema: fir.schema,
      firVersion: fir.firVersion,
      identity: fir.identity,
      capture: fir.capture,
      geometry: fir.geometry,
      dom: fir.dom,
      styles: fir.styles,
      assets: fir.assets,
      motion: fir.motion,
      interactions: fir.interactions,
      canvas: fir.canvas,
      dependencies: fir.dependencies,
      checkpoints: fir.checkpoints,
    };
    const jsonString = JSON.stringify(payloadCopy, Object.keys(payloadCopy).sort());
    return crypto.createHash('sha256').update(jsonString, 'utf-8').digest('hex');
  }

  /**
   * Validates a candidate SectionFIR data structure against FIR specifications.
   */
  public static validate(fir: any): FIRValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!fir || typeof fir !== 'object') {
      return {
        isValid: false,
        errors: ['FIR payload is null or not an object.'],
        warnings: [],
        integrityHash: '',
      };
    }

    // 1. Schema & Version Validation
    if (fir.schema !== CURRENT_FIR_SCHEMA_URL) {
      errors.push(`Invalid schema: "${fir.schema}". Expected "${CURRENT_FIR_SCHEMA_URL}".`);
    }

    if (!fir.firVersion || typeof fir.firVersion !== 'string') {
      errors.push('Missing or invalid "firVersion".');
    } else if (!isFIRVersionCompatible(fir.firVersion)) {
      errors.push(`FIR version "${fir.firVersion}" is incompatible with current engine.`);
    }

    // 2. Identity Validation
    if (!fir.identity || typeof fir.identity !== 'object') {
      errors.push('Missing "identity" block.');
    } else {
      if (!fir.identity.sectionId) errors.push('identity.sectionId is required.');
      if (!fir.identity.title) errors.push('identity.title is required.');
      if (!fir.identity.sourceUrl) errors.push('identity.sourceUrl is required.');
      if (!fir.identity.domSelector) errors.push('identity.domSelector is required.');
    }

    // 3. Geometry Validation
    if (!fir.geometry || typeof fir.geometry !== 'object') {
      errors.push('Missing "geometry" block.');
    } else {
      if (typeof fir.geometry.width !== 'number' || fir.geometry.width <= 0) {
        errors.push('geometry.width must be a positive number.');
      }
      if (typeof fir.geometry.height !== 'number' || fir.geometry.height <= 0) {
        errors.push('geometry.height must be a positive number.');
      }
    }

    // 4. DOM Validation
    if (!fir.dom || typeof fir.dom !== 'object') {
      errors.push('Missing "dom" block.');
    } else {
      if (typeof fir.dom.nodeCount !== 'number' || fir.dom.nodeCount < 1) {
        errors.push('dom.nodeCount must be at least 1.');
      }
      if (!fir.dom.rootNode || typeof fir.dom.rootNode !== 'object') {
        errors.push('dom.rootNode is required.');
      }
    }

    // 5. Styles Validation
    if (!fir.styles || typeof fir.styles !== 'object') {
      errors.push('Missing "styles" block.');
    }

    // 6. Assets Validation & Provenance Check
    if (!fir.assets || typeof fir.assets !== 'object') {
      errors.push('Missing "assets" block.');
    } else if (Array.isArray(fir.assets.assets)) {
      for (let i = 0; i < fir.assets.assets.length; i++) {
        const a = fir.assets.assets[i];
        if (!a.assetId) errors.push(`assets.assets[${i}] is missing assetId.`);
        if (!a.sourceUrl) errors.push(`assets.assets[${i}] is missing sourceUrl.`);
        if (!a.sha256) warnings.push(`assets.assets[${i}] is missing sha256 checksum.`);
      }
    }

    // 7. Motion Discriminated Union Validation
    if (!fir.motion || typeof fir.motion !== 'object') {
      errors.push('Missing "motion" block.');
    } else if (Array.isArray(fir.motion.traces)) {
      for (let i = 0; i < fir.motion.traces.length; i++) {
        const trace = fir.motion.traces[i];
        const validKinds = ['css_animation', 'css_transition', 'gsap_timeline', 'scroll_trigger', 'unknown_motion'];
        if (!validKinds.includes(trace.kind)) {
          errors.push(`motion.traces[${i}] has unrecognized kind "${trace.kind}".`);
        }
      }
    }

    // 8. Canvas Discriminated Union Validation
    if (!fir.canvas || typeof fir.canvas !== 'object') {
      errors.push('Missing "canvas" block.');
    } else if (Array.isArray(fir.canvas.evidence)) {
      for (let i = 0; i < fir.canvas.evidence.length; i++) {
        const cv = fir.canvas.evidence[i];
        const validKinds = ['canvas_2d_static', 'webgl_static_fallback', 'webgl_runtime_scene'];
        if (!validKinds.includes(cv.kind)) {
          errors.push(`canvas.evidence[${i}] has unrecognized kind "${cv.kind}".`);
        }
      }
    }

    const integrityHash = errors.length === 0 ? this.computeIntegrityHash(fir) : '';

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      integrityHash,
    };
  }
}
