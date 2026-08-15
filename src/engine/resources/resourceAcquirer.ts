import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { ContentStore, ContentFileMetadata } from '../storage/contentStore';
import { WorkspaceConfig, defaultWorkspaceConfig } from '../storage/workspaceConfig';
import { DefaultStorageMonitor, StorageMonitor } from '../storage/storageMonitor';
import { DiscoveredResourceMetadata, URLNormalizer } from './urlNormalizer';
import { getPrismaClient } from '../../database/dbClient';

export const RESOURCE_STREAMING_THRESHOLD = BigInt(10 * 1024 * 1024); // 10MB
export const DEFAULT_MAX_SINGLE_RESOURCE_SIZE = BigInt(50 * 1024 * 1024); // 50MB
export const DEFAULT_MIN_DISK_SPACE = BigInt(100 * 1024 * 1024); // 100MB

export interface AcquisitionOptions {
  maxResourceCount?: number;
  maxTotalBytes?: bigint;
  maxSingleResourceSize?: bigint;
  minDiskSpaceBytes?: bigint;
  concurrencyLimit?: number;
  maxRetries?: number;
  allowPrivateNetworks?: boolean;
  cookies?: Array<{ name: string; value: string; domain: string; path: string }>;
  userAgent?: string;
  customHeaders?: Record<string, string>;
}

export interface AcquisitionStats {
  discoveredCount: number;
  capturedCount: number;
  failedCount: number;
  skippedCount: number;
  totalBytesCaptured: bigint;
  isBudgetExceeded: boolean;
  budgetReason?: string;
}

export class ResourceAcquirer {
  private contentStore: ContentStore;
  private storageMonitor: StorageMonitor;

  constructor(
    private workspaceConfig: WorkspaceConfig = defaultWorkspaceConfig,
    storageMonitor?: StorageMonitor
  ) {
    this.contentStore = new ContentStore(this.workspaceConfig);
    this.storageMonitor = storageMonitor || new DefaultStorageMonitor();
  }

  public async acquireResource(
    meta: DiscoveredResourceMetadata,
    options?: AcquisitionOptions
  ): Promise<{ resourceId: string; status: 'completed' | 'failed' | 'partial'; hash?: string; localPath?: string }> {
    const prisma = getPrismaClient();
    const maxSingleSize = options?.maxSingleResourceSize || DEFAULT_MAX_SINGLE_RESOURCE_SIZE;
    const minDiskSpace = options?.minDiskSpaceBytes || DEFAULT_MIN_DISK_SPACE;
    const maxRetries = options?.maxRetries || 3;
    const allowPrivate = options?.allowPrivateNetworks !== false; // Allow local test server in dev/test

    // 1. SSRF & Private Network Policy Check
    if (!allowPrivate && URLNormalizer.isPrivateNetworkTarget(meta.originalUrl)) {
      const blockedId = `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const blockedRecord = await prisma.resource.create({
        data: {
          id: blockedId,
          websiteId: meta.websiteId,
          pageId: meta.pageId,
          originalUrl: meta.originalUrl,
          canonicalUrl: meta.canonicalUrl,
          contentHash: 'BLOCKED_SSRF_POLICY',
          localPath: '',
          mimeType: meta.mimeType || 'application/octet-stream',
          sizeBytes: BigInt(0),
          acquisitionPath: 'blocked',
          status: 'failed',
          resourceType: meta.resourceType,
          contentSnippet: 'BlockedByPolicy: Private network target access rejected by SSRF policy.',
        },
      });

      await prisma.pageResource.create({
        data: { pageId: meta.pageId, resourceId: blockedRecord.id },
      });

      return { resourceId: blockedRecord.id, status: 'failed' };
    }

    // 2. Check if Logical Resource record already exists with same content in database
    const existingResource = await prisma.resource.findFirst({
      where: { websiteId: meta.websiteId, originalUrl: meta.originalUrl },
    });

    if (existingResource && existingResource.status === 'completed') {
      await prisma.pageResource.upsert({
        where: { pageId_resourceId: { pageId: meta.pageId, resourceId: existingResource.id } },
        create: { pageId: meta.pageId, resourceId: existingResource.id },
        update: {},
      });

      return {
        resourceId: existingResource.id,
        status: 'completed',
        hash: existingResource.contentHash,
        localPath: existingResource.localPath,
      };
    }

    // 3. Perform HTTP Streaming Acquisition with Retry Policy
    let attempt = 0;
    let success = false;
    let savedMeta: ContentFileMetadata | null = null;
    let lastError: string | undefined;
    let statusCode = meta.statusCode || 0;
    let mimeType = meta.mimeType || 'application/octet-stream';

    while (attempt <= maxRetries && !success) {
      attempt++;
      try {
        // Pre-acquisition Disk Space Safety Check
        const availBytes = await this.storageMonitor.getAvailableBytes(this.workspaceConfig.getWorkspaceRoot());
        if (availBytes < minDiskSpace) {
          throw new Error(`InsufficientDiskSpace: Disk space ${availBytes} bytes below required minimum ${minDiskSpace} bytes.`);
        }

        const res = await this.downloadResourceStream(meta.originalUrl, {
          cookies: options?.cookies,
          userAgent: options?.userAgent,
          customHeaders: options?.customHeaders,
          maxSize: maxSingleSize,
        });

        statusCode = res.statusCode;
        mimeType = res.mimeType || mimeType;

        if (statusCode >= 400) {
          lastError = `HTTPError ${statusCode}`;
          if (statusCode === 404 || statusCode === 403) {
            break; // Do NOT retry 404 or 403
          }
        } else if (res.buffer) {
          // Atomically write buffer/stream to ContentStore with SHA-256 verification
          savedMeta = await this.contentStore.saveBufferAtomic(res.buffer, this.getExtensionFromUrl(meta.originalUrl));
          success = true;
        }
      } catch (err: any) {
        lastError = err?.message || 'Download error';
        if (lastError.includes('InsufficientDiskSpace')) break;
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, attempt * 300));
        }
      }
    }

    // 4. Database Commit (DISCOVER -> QUEUE -> ACQUIRE -> HASH -> WRITE -> VERIFY -> COMMIT)
    const resourceStatus = success ? 'completed' : 'failed';
    const resourceId = `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const createdRecord = await prisma.resource.create({
      data: {
        id: resourceId,
        websiteId: meta.websiteId,
        pageId: meta.pageId,
        originalUrl: meta.originalUrl,
        canonicalUrl: meta.canonicalUrl,
        contentHash: savedMeta ? savedMeta.hash : 'FAILED_ACQUISITION',
        localPath: savedMeta ? savedMeta.localPath : '',
        mimeType,
        sizeBytes: savedMeta ? savedMeta.sizeBytes : BigInt(0),
        acquisitionPath: savedMeta && savedMeta.sizeBytes > RESOURCE_STREAMING_THRESHOLD ? 'http_stream' : 'browser_buffer',
        status: resourceStatus,
        resourceType: meta.resourceType,
        contentSnippet: lastError ? `Error: ${lastError}` : undefined,
      },
    });

    await prisma.pageResource.create({
      data: {
        pageId: meta.pageId,
        resourceId: createdRecord.id,
      },
    });

    return {
      resourceId: createdRecord.id,
      status: resourceStatus,
      hash: savedMeta?.hash,
      localPath: savedMeta?.localPath,
    };
  }

  private downloadResourceStream(
    targetUrl: string,
    opts: {
      cookies?: Array<{ name: string; value: string }>;
      userAgent?: string;
      customHeaders?: Record<string, string>;
      maxSize: bigint;
    }
  ): Promise<{ statusCode: number; mimeType?: string; buffer?: Buffer }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const headers: Record<string, string> = {
        'User-Agent': opts.userAgent || 'AnimateLab/1.0 (Desktop Engine; Resource Acquirer)',
        Accept: '*/*',
        ...opts.customHeaders,
      };

      if (opts.cookies && opts.cookies.length > 0) {
        headers['Cookie'] = opts.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
      }

      const req = httpModule.get(targetUrl, { headers, timeout: 15000 }, (res) => {
        const statusCode = res.statusCode || 0;
        const mimeType = res.headers['content-type'];

        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).toString();
          this.downloadResourceStream(redirectUrl, opts).then(resolve).catch(reject);
          return;
        }

        if (statusCode >= 400) {
          resolve({ statusCode, mimeType });
          return;
        }

        const chunks: Buffer[] = [];
        let totalSize = BigInt(0);

        res.on('data', (chunk: Buffer) => {
          totalSize += BigInt(chunk.length);
          if (totalSize > opts.maxSize) {
            req.destroy(new Error(`ResourceBudgetExceeded: Size ${totalSize} bytes exceeds max single resource cap ${opts.maxSize}`));
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve({
            statusCode,
            mimeType,
            buffer: Buffer.concat(chunks),
          });
        });

        res.on('error', (err) => reject(err));
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy(new Error('HTTPTimeout: Resource download connection timed out.'));
      });
    });
  }

  private getExtensionFromUrl(urlStr: string): string {
    try {
      const pathname = new URL(urlStr).pathname;
      const ext = path.extname(pathname);
      return ext && ext.length <= 5 ? ext : '.bin';
    } catch (e) {
      return '.bin';
    }
  }
}
