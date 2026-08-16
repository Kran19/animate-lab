import * as crypto from 'crypto';

export interface RedirectHop {
  hopIndex: number;
  url: string;
  statusCode: number;
  statusText?: string;
  timestamp: string;
  headers?: Record<string, string>;
}

export interface NavigationForensicRecord {
  recordId: string;
  requestedUrl: string;
  finalUrl: string;
  hasRedirect: boolean;
  redirectCount: number;
  redirectChain: RedirectHop[];
  finalOrigin: string;
  navigationTimestamp: string;
  timingMs: number;
  httpVersion?: string;
  sha256Hash: string;
}

export class NavigationForensics {
  /**
   * Constructs an immutable forensic navigation record documenting the full redirect chain.
   */
  public static createRecord(
    requestedUrl: string,
    finalUrl: string,
    redirectChain: RedirectHop[] = [],
    timingMs: number = 0,
    httpVersion: string = 'HTTP/2'
  ): NavigationForensicRecord {
    let finalOrigin = requestedUrl;
    try {
      finalOrigin = new URL(finalUrl).origin;
    } catch {}

    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({
      requestedUrl,
      finalUrl,
      redirectChain,
      finalOrigin,
      timestamp,
      timingMs,
    });
    const sha256Hash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      recordId: `nav_${sha256Hash.substring(0, 16)}`,
      requestedUrl,
      finalUrl,
      hasRedirect: requestedUrl !== finalUrl || redirectChain.length > 0,
      redirectCount: redirectChain.length,
      redirectChain,
      finalOrigin,
      navigationTimestamp: timestamp,
      timingMs,
      httpVersion,
      sha256Hash,
    };
  }
}
