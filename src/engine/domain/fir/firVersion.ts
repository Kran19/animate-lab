/**
 * FIR Versioning & Semantic Compatibility Rules
 */

export const CURRENT_FIR_VERSION = '0.1.0';
export const CURRENT_FIR_SCHEMA_URL = 'https://animatelab.io/schemas/fir/v0.1.json';

export interface FIRVersionComponents {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parses a semantic version string (e.g. "0.1.0") into numeric components.
 */
export function parseFIRVersion(versionStr: string): FIRVersionComponents {
  const parts = versionStr.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) {
    throw new Error(`Invalid FIR version format: "${versionStr}". Expected "MAJOR.MINOR.PATCH".`);
  }
  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
}

/**
 * Checks if a given captured FIR version is compatible with a target runtime version.
 * Standard SemVer rules apply: Major version must match. Target minor must be >= captured minor.
 */
export function isFIRVersionCompatible(
  capturedVersion: string,
  targetVersion: string = CURRENT_FIR_VERSION
): boolean {
  try {
    const captured = parseFIRVersion(capturedVersion);
    const target = parseFIRVersion(targetVersion);

    if (captured.major !== target.major) {
      return false;
    }
    if (captured.minor > target.minor) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
