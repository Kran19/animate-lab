/**
 * Lightweight, safe robots.txt parser and policy evaluator.
 */

export interface RobotsRules {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelaySeconds?: number;
  sitemaps: string[];
}

/**
 * Parses raw robots.txt file content.
 * Evaluates directives for the specified userAgent or defaults to '*'.
 */
export function parseRobotsTxt(content: string, targetUserAgent: string = '*'): RobotsRules {
  const result: RobotsRules = {
    userAgent: targetUserAgent,
    disallow: [],
    allow: [],
    sitemaps: [],
  };

  if (!content || typeof content !== 'string') {
    return result;
  }

  const lines = content.split(/\r?\n/);
  let currentUserAgents: string[] = [];
  let isTargetSection = false;

  for (const rawLine of lines) {
    // Strip comments
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const field = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (field === 'user-agent') {
      const agent = value.toLowerCase();
      // If we are starting a new group of user agents
      if (currentUserAgents.length > 0 && !line.startsWith('user-agent')) {
        currentUserAgents = [agent];
      } else {
        currentUserAgents.push(agent);
      }
      isTargetSection = currentUserAgents.includes('*') || currentUserAgents.includes(targetUserAgent.toLowerCase());
      continue;
    }

    if (field === 'sitemap') {
      if (value) {
        result.sitemaps.push(value);
      }
      continue;
    }

    if (isTargetSection) {
      if (field === 'disallow') {
        if (value) {
          result.disallow.push(value);
        }
      } else if (field === 'allow') {
        if (value) {
          result.allow.push(value);
        }
      } else if (field === 'crawl-delay') {
        const parsedDelay = parseFloat(value);
        if (!isNaN(parsedDelay) && parsedDelay >= 0) {
          result.crawlDelaySeconds = parsedDelay;
        }
      }
    }
  }

  return result;
}

/**
 * Checks whether a specific path or URL is permitted by robots.txt rules.
 * Standard robots.txt prefix matching: Longer rule matches take precedence over shorter rules.
 */
export function isAllowedByRobots(pathOrUrl: string, rules: RobotsRules): boolean {
  if (!rules) return true;

  let path = pathOrUrl;
  try {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      const parsed = new URL(pathOrUrl);
      path = parsed.pathname + parsed.search;
    }
  } catch {
    // Fall back to raw string
  }

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Find most specific matching Allow rule
  let bestAllowLen = -1;
  for (const allowPattern of rules.allow) {
    if (pathMatchesRule(path, allowPattern)) {
      if (allowPattern.length > bestAllowLen) {
        bestAllowLen = allowPattern.length;
      }
    }
  }

  // Find most specific matching Disallow rule
  let bestDisallowLen = -1;
  for (const disallowPattern of rules.disallow) {
    if (pathMatchesRule(path, disallowPattern)) {
      if (disallowPattern.length > bestDisallowLen) {
        bestDisallowLen = disallowPattern.length;
      }
    }
  }

  // If matched allow is strictly longer than disallow, it's allowed
  if (bestAllowLen > bestDisallowLen) {
    return true;
  }

  // If disallow is longer or equal and matches, it is forbidden
  if (bestDisallowLen >= 0 && bestDisallowLen >= bestAllowLen) {
    return false;
  }

  return true;
}

/**
 * Matches a URL path against a robots.txt rule pattern supporting prefix and wildcards (* and $).
 */
function pathMatchesRule(path: string, pattern: string): boolean {
  if (!pattern) return false;
  if (pattern === '/') return true;

  // Escape regex special chars except * and $
  let regexStr = '^' + pattern
    .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  if (pattern.endsWith('$')) {
    regexStr = regexStr.slice(0, -1) + '$';
  }

  try {
    const regex = new RegExp(regexStr);
    return regex.test(path);
  } catch {
    return path.startsWith(pattern);
  }
}
