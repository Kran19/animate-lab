/**
 * PoliteRateLimiter ensures polite crawl spacing between requests to the same host,
 * respecting user-configured rateLimitMs and robots.txt Crawl-delay.
 */

export interface RateLimiterOptions {
  nowFn?: () => number;
  sleepFn?: (ms: number) => Promise<void>;
}

export class PoliteRateLimiter {
  private lastRequestTimeByHost: Map<string, number> = new Map();
  private activeRequestsByHost: Map<string, number> = new Map();
  private nowFn: () => number;
  private sleepFn: (ms: number) => Promise<void>;

  constructor(options?: RateLimiterOptions) {
    this.nowFn = options?.nowFn || (() => Date.now());
    this.sleepFn = options?.sleepFn || ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  /**
   * Acquires permission to make a request to the given host.
   * Delays execution if the elapsed time since the last request is less than requiredDelayMs.
   */
  public async acquire(
    host: string,
    rateLimitMs: number = 500,
    crawlDelaySeconds?: number,
    isCancelledFn?: () => boolean
  ): Promise<void> {
    const normalizedHost = host.toLowerCase().trim();
    if (!normalizedHost) return;

    if (isCancelledFn && isCancelledFn()) {
      return;
    }

    // Determine required delay: max of configured rateLimitMs and robots crawlDelay (in ms)
    const robotsDelayMs = crawlDelaySeconds ? Math.round(crawlDelaySeconds * 1000) : 0;
    const requiredDelayMs = Math.max(rateLimitMs, robotsDelayMs);

    const now = this.nowFn();
    const lastTime = this.lastRequestTimeByHost.get(normalizedHost) || 0;
    const elapsed = now - lastTime;

    if (elapsed < requiredDelayMs && lastTime > 0) {
      const waitMs = requiredDelayMs - elapsed;
      if (!isCancelledFn || !isCancelledFn()) {
        await this.sleepFn(waitMs);
      }
    }

    // Update timestamp and concurrency
    const currentActive = this.activeRequestsByHost.get(normalizedHost) || 0;
    this.activeRequestsByHost.set(normalizedHost, currentActive + 1);
    this.lastRequestTimeByHost.set(normalizedHost, this.nowFn());
  }

  /**
   * Releases active concurrency slot for a host.
   */
  public release(host: string): void {
    const normalizedHost = host.toLowerCase().trim();
    if (!normalizedHost) return;

    const currentActive = this.activeRequestsByHost.get(normalizedHost) || 0;
    if (currentActive > 1) {
      this.activeRequestsByHost.set(normalizedHost, currentActive - 1);
    } else {
      this.activeRequestsByHost.delete(normalizedHost);
    }
  }

  /**
   * Gets the active request count for a host.
   */
  public getActiveCount(host: string): number {
    return this.activeRequestsByHost.get(host.toLowerCase().trim()) || 0;
  }

  /**
   * Clears all tracked host state.
   */
  public reset(): void {
    this.lastRequestTimeByHost.clear();
    this.activeRequestsByHost.clear();
  }
}
