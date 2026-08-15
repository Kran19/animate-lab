import { DiscoveredResourceMetadata } from './urlNormalizer';
import { ResourceDiscoverer } from './resourceDiscoverer';
import { ResourceAcquirer, AcquisitionOptions, AcquisitionStats } from './resourceAcquirer';
import { WorkspaceConfig, defaultWorkspaceConfig } from '../storage/workspaceConfig';
import { defaultJobSupervisor } from '../jobs/jobSupervisor';

export interface ResourcePipelineConfig {
  maxResourceCount?: number;
  maxTotalBytes?: bigint;
  maxSingleResourceSize?: bigint;
  concurrencyLimit?: number;
  maxRetries?: number;
  cookies?: Array<{ name: string; value: string; domain: string; path: string }>;
  userAgent?: string;
  customHeaders?: Record<string, string>;
}

export class ResourcePipeline {
  private acquirer: ResourceAcquirer;

  constructor(workspaceConfig: WorkspaceConfig = defaultWorkspaceConfig) {
    this.acquirer = new ResourceAcquirer(workspaceConfig);
  }

  public async processPageResources(
    contextInfo: { pageId: string; websiteId: string; sessionId: string; url: string; jobId?: string },
    pageData: { html?: string; observedNetwork?: DiscoveredResourceMetadata[] },
    config?: ResourcePipelineConfig
  ): Promise<AcquisitionStats> {
    const maxCount = config?.maxResourceCount ?? 100;
    const maxTotalBytes = config?.maxTotalBytes ?? BigInt(250 * 1024 * 1024); // 250MB
    const concurrency = config?.concurrencyLimit ?? 5;

    const stats: AcquisitionStats = {
      discoveredCount: 0,
      capturedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      totalBytesCaptured: BigInt(0),
      isBudgetExceeded: false,
    };

    // 1. Multi-Source Resource Discovery
    const discoveredList: DiscoveredResourceMetadata[] = [];
    const seenUrls = new Set<string>();

    const addDiscovered = (items: DiscoveredResourceMetadata[]) => {
      for (const item of items) {
        if (!seenUrls.has(item.originalUrl)) {
          seenUrls.add(item.originalUrl);
          discoveredList.push(item);
        }
      }
    };

    if (pageData.observedNetwork) {
      addDiscovered(pageData.observedNetwork);
    }

    if (pageData.html) {
      addDiscovered(ResourceDiscoverer.discoverFromHTML(pageData.html, contextInfo.url, contextInfo));
    }

    stats.discoveredCount = discoveredList.length;

    // 2. Queue & Process Resources with Soft Budget Caps
    for (const meta of discoveredList) {
      if (stats.capturedCount >= maxCount) {
        stats.isBudgetExceeded = true;
        stats.budgetReason = `MaxResourceCountBudgetExceeded: Hit maximum resource count cap (${maxCount})`;
        stats.skippedCount++;
        continue;
      }

      if (stats.totalBytesCaptured >= maxTotalBytes) {
        stats.isBudgetExceeded = true;
        stats.budgetReason = `MaxTotalBytesBudgetExceeded: Hit maximum byte capacity cap (${maxTotalBytes} bytes)`;
        stats.skippedCount++;
        continue;
      }

      try {
        const result = await this.acquirer.acquireResource(meta, {
          maxSingleResourceSize: config?.maxSingleResourceSize,
          maxRetries: config?.maxRetries,
          cookies: config?.cookies,
          userAgent: config?.userAgent,
          customHeaders: config?.customHeaders,
        });

        if (result.status === 'completed') {
          stats.capturedCount++;
        } else {
          stats.failedCount++;
        }
      } catch (err) {
        stats.failedCount++;
      }

      if (contextInfo.jobId) {
        defaultJobSupervisor.emitEvent('job.progress', {
          jobId: contextInfo.jobId,
          websiteId: contextInfo.websiteId,
          progress: {
            resourcesDiscovered: stats.discoveredCount,
            resourcesCaptured: stats.capturedCount,
            resourcesFailed: stats.failedCount,
            resourcesSkipped: stats.skippedCount,
          },
        });
      }
    }

    return stats;
  }
}
