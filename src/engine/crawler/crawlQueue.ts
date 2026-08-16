import { normalizeUrl, isValidCrawlUrl } from './urlNormalizer';

export type QueueItemStatus = 'pending' | 'processing' | 'visited' | 'skipped' | 'failed';

export interface CrawlQueueItem {
  url: string;
  normalizedUrl: string;
  depth: number;
  discoveredAt: string;
  status: QueueItemStatus;
  failureReason?: string;
  skipReason?: string;
}

export interface SerializedCrawlQueue {
  pending: CrawlQueueItem[];
  visited: CrawlQueueItem[];
  skipped: CrawlQueueItem[];
  failed: CrawlQueueItem[];
  maxPages: number;
  maxDepth: number;
}

export class CrawlQueue {
  private queue: CrawlQueueItem[] = [];
  private visitedMap: Map<string, CrawlQueueItem> = new Map();
  private skippedMap: Map<string, CrawlQueueItem> = new Map();
  private failedMap: Map<string, CrawlQueueItem> = new Map();
  private knownUrls: Set<string> = new Set();

  private maxPages: number;
  private maxDepth: number;

  constructor(maxPages: number = 10, maxDepth: number = 2) {
    this.maxPages = maxPages;
    this.maxDepth = maxDepth;
  }

  /**
   * Attempts to enqueue a URL into the crawl queue.
   * Performs deduplication and depth/limit checks.
   * Returns true if successfully added, false if duplicate or invalid.
   */
  public enqueue(rawUrl: string, depth: number = 0, baseUrl?: string): boolean {
    if (!isValidCrawlUrl(rawUrl)) {
      return false;
    }

    let normalized: string;
    try {
      normalized = normalizeUrl(rawUrl, baseUrl);
    } catch {
      return false;
    }

    if (this.knownUrls.has(normalized)) {
      return false;
    }

    if (depth > this.maxDepth) {
      const skippedItem: CrawlQueueItem = {
        url: rawUrl,
        normalizedUrl: normalized,
        depth,
        discoveredAt: new Date().toISOString(),
        status: 'skipped',
        skipReason: `Exceeds max depth limit of ${this.maxDepth}`,
      };
      this.skippedMap.set(normalized, skippedItem);
      this.knownUrls.add(normalized);
      return false;
    }

    // Check if max pages limit reached
    const totalProcessedOrPending = this.visitedMap.size + this.queue.length;
    if (totalProcessedOrPending >= this.maxPages) {
      const skippedItem: CrawlQueueItem = {
        url: rawUrl,
        normalizedUrl: normalized,
        depth,
        discoveredAt: new Date().toISOString(),
        status: 'skipped',
        skipReason: `Exceeds max pages limit of ${this.maxPages}`,
      };
      this.skippedMap.set(normalized, skippedItem);
      this.knownUrls.add(normalized);
      return false;
    }

    const item: CrawlQueueItem = {
      url: rawUrl,
      normalizedUrl: normalized,
      depth,
      discoveredAt: new Date().toISOString(),
      status: 'pending',
    };

    this.queue.push(item);
    this.knownUrls.add(normalized);
    return true;
  }

  /**
   * Dequeues the next pending item (BFS: lowest depth first).
   */
  public dequeue(): CrawlQueueItem | undefined {
    if (this.queue.length === 0) return undefined;
    // Sort by depth ascending to guarantee BFS traversal
    this.queue.sort((a, b) => a.depth - b.depth);
    const item = this.queue.shift();
    if (item) {
      item.status = 'processing';
    }
    return item;
  }

  /**
   * Peeks at the next item in the queue.
   */
  public peek(): CrawlQueueItem | undefined {
    return this.queue[0];
  }

  /**
   * Marks a processed item as successfully visited.
   */
  public markVisited(item: CrawlQueueItem): void {
    item.status = 'visited';
    this.visitedMap.set(item.normalizedUrl, item);
  }

  /**
   * Marks an item as skipped with a reason (e.g. disallowed by robots.txt or out of scope).
   */
  public markSkipped(rawUrl: string, depth: number, reason: string): void {
    let normalized = rawUrl;
    try {
      normalized = normalizeUrl(rawUrl);
    } catch {
      // Fallback
    }

    const item: CrawlQueueItem = {
      url: rawUrl,
      normalizedUrl: normalized,
      depth,
      discoveredAt: new Date().toISOString(),
      status: 'skipped',
      skipReason: reason,
    };

    this.skippedMap.set(normalized, item);
    this.knownUrls.add(normalized);
  }

  /**
   * Marks an item as failed with a failure reason.
   */
  public markFailed(item: CrawlQueueItem, reason: string): void {
    item.status = 'failed';
    item.failureReason = reason;
    this.failedMap.set(item.normalizedUrl, item);
  }

  /**
   * Checks if URL has already been queued or processed.
   */
  public has(rawUrl: string, baseUrl?: string): boolean {
    try {
      const norm = normalizeUrl(rawUrl, baseUrl);
      return this.knownUrls.has(norm);
    } catch {
      return false;
    }
  }

  /**
   * Checks if URL has already been visited.
   */
  public isVisited(rawUrl: string, baseUrl?: string): boolean {
    try {
      const norm = normalizeUrl(rawUrl, baseUrl);
      return this.visitedMap.has(norm);
    } catch {
      return false;
    }
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get visitedCount(): number {
    return this.visitedMap.size;
  }

  public get skippedCount(): number {
    return this.skippedMap.size;
  }

  public get failedCount(): number {
    return this.failedMap.size;
  }

  public get totalDiscovered(): number {
    return this.knownUrls.size;
  }

  public getStats() {
    return {
      pending: this.pendingCount,
      visited: this.visitedCount,
      skipped: this.skippedCount,
      failed: this.failedCount,
      totalDiscovered: this.totalDiscovered,
      maxPages: this.maxPages,
      maxDepth: this.maxDepth,
    };
  }

  /**
   * Serializes the queue state into a plain JSON-compatible object for SQLite persistence.
   */
  public serialize(): SerializedCrawlQueue {
    return {
      pending: [...this.queue],
      visited: Array.from(this.visitedMap.values()),
      skipped: Array.from(this.skippedMap.values()),
      failed: Array.from(this.failedMap.values()),
      maxPages: this.maxPages,
      maxDepth: this.maxDepth,
    };
  }

  /**
   * Restores queue state from a previously serialized object.
   */
  public static deserialize(data: SerializedCrawlQueue): CrawlQueue {
    const queue = new CrawlQueue(data.maxPages || 10, data.maxDepth || 2);
    queue.knownUrls = new Set();

    if (data.visited) {
      for (const item of data.visited) {
        queue.visitedMap.set(item.normalizedUrl, item);
        queue.knownUrls.add(item.normalizedUrl);
      }
    }

    if (data.skipped) {
      for (const item of data.skipped) {
        queue.skippedMap.set(item.normalizedUrl, item);
        queue.knownUrls.add(item.normalizedUrl);
      }
    }

    if (data.failed) {
      for (const item of data.failed) {
        queue.failedMap.set(item.normalizedUrl, item);
        queue.knownUrls.add(item.normalizedUrl);
      }
    }

    if (data.pending) {
      for (const item of data.pending) {
        queue.queue.push(item);
        queue.knownUrls.add(item.normalizedUrl);
      }
    }

    return queue;
  }
}
