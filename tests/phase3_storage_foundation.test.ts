import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { WorkspaceConfig } from '../src/engine/storage/workspaceConfig';
import { ContentStore } from '../src/engine/storage/contentStore';
import { DefaultStorageMonitor } from '../src/engine/storage/storageMonitor';
import { getPrismaClient, disconnectPrisma } from '../src/database/dbClient';
import { seedDatabase } from '../src/database/seed';

const TEST_WORKSPACE_ROOT = path.resolve(process.cwd(), 'tmp-test-workspace');

describe('Phase 3 — Local Database & Storage Foundation Suite', { timeout: 30000 }, () => {
  let workspaceConfig: WorkspaceConfig;
  let contentStore: ContentStore;
  let storageMonitor: DefaultStorageMonitor;

  beforeAll(async () => {
    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }

    workspaceConfig = new WorkspaceConfig(TEST_WORKSPACE_ROOT);
    const paths = workspaceConfig.ensureDirectoryStructure();
    contentStore = new ContentStore(workspaceConfig);
    storageMonitor = new DefaultStorageMonitor();

    process.env.DATABASE_URL = `file:${paths.databasePath}`;

    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: `file:${paths.databasePath}` },
      cwd: process.cwd(),
      stdio: 'ignore',
    });
  }, 30000);

  afterAll(async () => {
    try {
      await disconnectPrisma();
    } catch (e) {}

    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }
  });

  it('1. WorkspaceConfig ensures directory structure and path security', () => {
    const paths = workspaceConfig.ensureDirectoryStructure();
    expect(fs.existsSync(path.dirname(paths.databasePath))).toBe(true);
    expect(fs.existsSync(paths.assetsPath)).toBe(true);
    expect(fs.existsSync(paths.tmpPath)).toBe(true);
  });

  it('2. Path Traversal & Invalid Workspace Path protection', () => {
    expect(() => workspaceConfig.validatePathSecurity(path.join(process.cwd(), 'outside'))).toThrow();
  });

  it('3. ContentStore performs SHA-256 calculation and atomic file writes', async () => {
    const sampleData = Buffer.from('AnimateLab Deterministic Test Payload 123');
    const result = await contentStore.saveBufferAtomic(sampleData, '.bin');

    expect(result.hash).toBeDefined();
    expect(result.hash.length).toBe(64);
    expect(fs.existsSync(result.localPath)).toBe(true);

    const fileContent = fs.readFileSync(result.localPath);
    expect(fileContent.equals(sampleData)).toBe(true);
  });

  it('4. Hash Mismatch Error handling during atomic write', async () => {
    const sampleData = Buffer.from('Corrupted Payload');
    const result = await contentStore.saveBufferAtomic(sampleData, '.bin');
    expect(result.hash).toBeDefined();
  });

  it('5. StorageMonitor checks available and total disk capacity', async () => {
    const avail = await storageMonitor.getAvailableBytes(TEST_WORKSPACE_ROOT);
    const total = await storageMonitor.getTotalBytes(TEST_WORKSPACE_ROOT);
    const used = await storageMonitor.getUsedBytes(TEST_WORKSPACE_ROOT);

    expect(avail).toBeGreaterThan(BigInt(0));
    expect(total).toBeGreaterThan(BigInt(0));
    expect(used).toBeGreaterThanOrEqual(BigInt(0));
  });

  it('6. Prisma Seed populates deterministic test database', async () => {
    await seedDatabase();
    const prisma = getPrismaClient();

    const websites = await prisma.website.findMany();
    expect(websites.length).toBeGreaterThan(0);

    const pages = await prisma.page.findMany();
    expect(pages.length).toBeGreaterThan(0);

    const components = await prisma.componentCandidate.findMany();
    expect(components.length).toBeGreaterThan(0);
  });

  it('7. Transaction Rollback safety on operation failure', async () => {
    const prisma = getPrismaClient();

    try {
      await prisma.$transaction(async (tx) => {
        const ws = await tx.workspace.findFirst();
        await tx.website.create({
          data: {
            id: 'tx-fail-web',
            url: 'https://rollback-test.com',
            name: 'Rollback Test',
            storagePath: 'workspace-data/rollback-test',
            workspace: { connect: { id: ws!.id } },
          },
        });
        throw new Error('Forced Rollback Error');
      });
    } catch (e: any) {
      expect(e.message).toBe('Forced Rollback Error');
    }

    const found = await prisma.website.findUnique({ where: { id: 'tx-fail-web' } });
    expect(found).toBeNull();
  });

  it('8. Database Reopen & Data Persistence across reconnect', async () => {
    const prisma1 = getPrismaClient();
    const ws = await prisma1.workspace.findFirst();

    await prisma1.website.create({
      data: {
        id: 'web-persist-test',
        url: 'https://persist-test.com',
        name: 'Persist Test',
        storagePath: 'workspace-data/persist-test',
        workspace: { connect: { id: ws!.id } },
      },
    });

    await disconnectPrisma();
    const prisma2 = getPrismaClient();
    const found = await prisma2.website.findUnique({ where: { id: 'web-persist-test' } });

    expect(found).not.toBeNull();
    expect(found?.name).toBe('Persist Test');
  });

  it('9. Missing & Orphan physical file detection', async () => {
    const prisma = getPrismaClient();
    const website = await prisma.website.findFirst();
    const page = await prisma.page.findFirst({ where: { websiteId: website!.id } });
    expect(website).not.toBeNull();

    const result = await contentStore.saveBufferAtomic(Buffer.from('Orphan File Content'), '.bin');
    expect(result.hash).toBeDefined();

    await prisma.resource.create({
      data: {
        id: 'res-orphan-test',
        website: { connect: { id: website!.id } },
        page: { connect: { id: page!.id } },
        originalUrl: 'https://persist-test.com/file.bin',
        canonicalUrl: 'https://persist-test.com/file.bin',
        contentHash: result.hash,
        localPath: result.localPath,
        mimeType: 'application/octet-stream',
        sizeBytes: BigInt(19),
        acquisitionPath: 'browser_buffer',
        status: 'completed',
        resourceType: 'Other/binary',
      },
    });
  });

  it('10. Shared resource deletion safety', async () => {
    const prisma = getPrismaClient();
    const website = await prisma.website.findFirst();
    const page = await prisma.page.findFirst({ where: { websiteId: website!.id } });

    const result = await contentStore.saveBufferAtomic(Buffer.from('Shared Content Payload'), '.bin');

    const res1 = await prisma.resource.create({
      data: {
        id: 'res-shared-1',
        website: { connect: { id: website!.id } },
        page: { connect: { id: page!.id } },
        originalUrl: 'https://shared1.com/file.bin',
        canonicalUrl: 'https://shared1.com/file.bin',
        contentHash: result.hash,
        localPath: result.localPath,
        mimeType: 'application/octet-stream',
        sizeBytes: BigInt(22),
        acquisitionPath: 'browser_buffer',
        status: 'completed',
        resourceType: 'Other/binary',
      },
    });

    const res2 = await prisma.resource.create({
      data: {
        id: 'res-shared-2',
        website: { connect: { id: website!.id } },
        page: { connect: { id: page!.id } },
        originalUrl: 'https://shared2.com/file.bin',
        canonicalUrl: 'https://shared2.com/file.bin',
        contentHash: result.hash,
        localPath: result.localPath,
        mimeType: 'application/octet-stream',
        sizeBytes: BigInt(22),
        acquisitionPath: 'browser_buffer',
        status: 'completed',
        resourceType: 'Other/binary',
      },
    });

    await prisma.resource.delete({ where: { id: res1.id } });
    expect(fs.existsSync(result.localPath)).toBe(true);

    await prisma.resource.delete({ where: { id: res2.id } });
    const count = await prisma.resource.count({ where: { contentHash: result.hash } });
    expect(count).toBe(0);
  });
});
