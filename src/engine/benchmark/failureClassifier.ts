import { FailureCode, FailureSeverity, StructuredFailure } from './types';

export class FailureClassifier {
  /**
   * Classifies an unhandled exception or pipeline issue into a structured, actionable failure record.
   */
  public static classify(error: any, context: { stage: string; url: string; componentId?: string; evidence?: any }): StructuredFailure {
    const errorMsg = String(error?.message || error || 'Unknown error occurred');
    const stage = context.stage;
    const url = context.url;
    const componentId = context.componentId;

    // 1. WebGL / 3D Analysis Failures
    if (errorMsg.includes('WebGL') || errorMsg.includes('Three.js') || errorMsg.includes('shader') || stage.includes('3D')) {
      return {
        code: 'WEBGL_ANALYSIS_FAILURE',
        severity: 'medium',
        stage,
        url,
        componentId,
        message: `WebGL/3D experience detected but cannot execute headless: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Mark experience as WEBGL_PARTIAL/WEBGL_NATIVE and retain safe shader/canvas metadata without executing in Node.',
      };
    }

    // 2. Unsupported Runtime Dependencies (e.g. native physics, WebAudio, WebSockets)
    if (
      errorMsg.includes('Matter') ||
      errorMsg.includes('Cannon') ||
      errorMsg.includes('AudioContext') ||
      errorMsg.includes('WebSocket') ||
      errorMsg.includes('unsupported dependency')
    ) {
      return {
        code: 'UNSUPPORTED_RUNTIME_DEPENDENCY',
        severity: 'low',
        stage,
        url,
        componentId,
        message: `Specialized runtime dependency detected: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Degrade gracefully to PARTIAL export with explicit dependency notices in manifest.json.',
      };
    }

    // 3. Network / Navigation / Capture Failures
    if (errorMsg.includes('net::') || errorMsg.includes('Navigation timeout') || errorMsg.includes('ERR_CONNECTION')) {
      return {
        code: 'CAPTURE_FAILURE',
        severity: 'high',
        stage,
        url,
        componentId,
        message: `Network request or page navigation failed: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Retry with backoff or verify robots.txt and network connectivity.',
      };
    }

    // 4. Resource & Asset Failures
    if (errorMsg.includes('404') || errorMsg.includes('Asset') || errorMsg.includes('MIME') || errorMsg.includes('Font')) {
      return {
        code: 'ASSET_FAILURE',
        severity: 'medium',
        stage,
        url,
        componentId,
        message: `Asset discovery or download failure: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Verify CORS policies, content-addressing hashes, and relative asset resolution paths.',
      };
    }

    // 5. CSS / Style Leakage Failures
    if (errorMsg.includes('global CSS') || errorMsg.includes('selector') || errorMsg.includes(':root') || errorMsg.includes('body {')) {
      return {
        code: 'CSS_DEPENDENCY_FAILURE',
        severity: 'high',
        stage,
        url,
        componentId,
        message: `CSS rule isolation or scoping violation: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Strip global html/body selectors and wrap extracted CSS in component scope.',
      };
    }

    // 6. Component Boundary / Isolation Failures
    if (errorMsg.includes('Isolation') || errorMsg.includes('Boundary') || errorMsg.includes('Empty candidate')) {
      return {
        code: 'COMPONENT_BOUNDARY_FAILURE',
        severity: 'high',
        stage,
        url,
        componentId,
        message: `Failed to isolate valid DOM subtree for candidate: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: false,
        suggestedNextAction: 'Refine DOM tree scoring heuristics and filter out non-visual wrapper containers.',
      };
    }

    // 7. Validation Failures
    if (errorMsg.includes('Validation') || errorMsg.includes('Syntax error') || errorMsg.includes('untrusted')) {
      return {
        code: 'VALIDATION_FAILURE',
        severity: 'critical',
        stage,
        url,
        componentId,
        message: `Phase 9 safety validation rejected generated code: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: false,
        suggestedNextAction: 'Enforce deterministic generator templates and remove unsafe dynamic code constructions.',
      };
    }

    // 8. Export Failures
    if (errorMsg.includes('Export') || errorMsg.includes('rollback') || errorMsg.includes('staging')) {
      return {
        code: 'EXPORT_FAILURE',
        severity: 'critical',
        stage,
        url,
        componentId,
        message: `Package packaging or disk staging error: ${errorMsg}`,
        evidence: context.evidence,
        recoverable: true,
        suggestedNextAction: 'Verify directory write permissions and ensure atomic rollback clean-up.',
      };
    }

    // Fallback: Generic Capture/Process Failure
    return {
      code: 'DOM_MUTATION_FAILURE',
      severity: 'medium',
      stage,
      url,
      componentId,
      message: errorMsg,
      evidence: context.evidence,
      recoverable: true,
      suggestedNextAction: 'Inspect diagnostics telemetry stream for localized root-cause indicators.',
    };
  }

  /**
   * Aggregates failure counts by code and severity.
   */
  public static summarizeFailures(failures: StructuredFailure[]): {
    total: number;
    bySeverity: Record<FailureSeverity, number>;
    byCode: Record<FailureCode, number>;
    recoverableCount: number;
    unrecoverableCount: number;
  } {
    const bySeverity: Record<FailureSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const byCode: Partial<Record<FailureCode, number>> = {};
    let recoverableCount = 0;
    let unrecoverableCount = 0;

    for (const f of failures) {
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
      byCode[f.code] = (byCode[f.code] || 0) + 1;
      if (f.recoverable) recoverableCount++;
      else unrecoverableCount++;
    }

    return {
      total: failures.length,
      bySeverity,
      byCode: byCode as Record<FailureCode, number>,
      recoverableCount,
      unrecoverableCount,
    };
  }
}
