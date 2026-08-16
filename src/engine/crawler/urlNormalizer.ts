import { CrawlMode } from '../../domain/types';

/**
 * URL Normalization, Scope Verification, and Safety Utilities for the Crawler.
 */

const DANGEROUS_PROTOCOLS = new Set(['javascript:', 'data:', 'file:', 'vbscript:', 'about:', 'chrome:', 'blob:']);

/**
 * Validates whether a given URL has an allowed protocol (http/https) and is well-formed.
 */
export function isValidCrawlUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (trimmed === '' || trimmed.startsWith('#')) return false;

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block dangerous loopback/internal hosts in strict environments if needed
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL:
 * - Resolves relative paths against baseUrl if provided
 * - Converts scheme and hostname to lowercase
 * - Removes URL hash/fragment (#...)
 * - Sorts search query parameters alphabetically for consistent deduplication
 * - Normalizes trailing slashes (preserves root slash, removes trailing slash for subpaths unless index-like)
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string {
  const trimmed = rawUrl.trim();
  let parsed: URL;

  try {
    if (baseUrl) {
      parsed = new URL(trimmed, baseUrl);
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    throw new Error(`Invalid URL for normalization: "${rawUrl}" with base "${baseUrl || ''}"`);
  }

  // Enforce http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol "${parsed.protocol}" in URL: "${rawUrl}"`);
  }

  // Lowercase hostname
  parsed.hostname = parsed.hostname.toLowerCase();

  // Remove fragment/hash
  parsed.hash = '';

  // Sort query parameters
  const params = Array.from(parsed.searchParams.entries());
  if (params.length > 0) {
    params.sort(([aKey], [bKey]) => aKey.localeCompare(bKey));
    parsed.search = '';
    for (const [k, v] of params) {
      // Filter out tracking query parameters if desired (e.g. utm_*)
      if (!k.toLowerCase().startsWith('utm_') && k.toLowerCase() !== 'fbclid' && k.toLowerCase() !== 'gclid') {
        parsed.searchParams.append(k, v);
      }
    }
  }

  // Normalize pathname: remove duplicate slashes, remove trailing slash if path is longer than '/'
  let pathname = parsed.pathname.replace(/\/+/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  parsed.pathname = pathname;

  return parsed.toString();
}

/**
 * Extracts normalized host/domain from URL.
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Checks whether targetUrl is within the configured CrawlMode scope of baseUrl.
 */
export function isUrlInScope(targetUrl: string, baseUrl: string, scope: CrawlMode): boolean {
  if (!isValidCrawlUrl(targetUrl) || !isValidCrawlUrl(baseUrl)) {
    return false;
  }

  let target: URL;
  let base: URL;

  try {
    target = new URL(targetUrl);
    base = new URL(baseUrl);
  } catch {
    return false;
  }

  switch (scope) {
    case 'single_page': {
      // Must match base URL hostname and exact pathname (ignoring query and hash)
      return (
        target.hostname.toLowerCase() === base.hostname.toLowerCase() &&
        target.pathname.replace(/\/+$/, '') === base.pathname.replace(/\/+$/, '')
      );
    }

    case 'same_domain': {
      // Must have exact same hostname
      return target.hostname.toLowerCase() === base.hostname.toLowerCase();
    }

    case 'subpaths_only': {
      if (target.hostname.toLowerCase() !== base.hostname.toLowerCase()) {
        return false;
      }
      let basePath = base.pathname;
      if (!basePath.endsWith('/')) basePath += '/';
      let targetPath = target.pathname;
      if (!targetPath.endsWith('/')) targetPath += '/';
      return targetPath.startsWith(basePath);
    }

    case 'custom_depth':
    default:
      // By default within custom depth, keep within same domain
      return target.hostname.toLowerCase() === base.hostname.toLowerCase();
  }
}
