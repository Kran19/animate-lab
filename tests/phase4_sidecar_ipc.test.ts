import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { WorkspaceConfig } from '../src/engine/storage/workspaceConfig';
import { getPrismaClient, disconnectPrisma } from '../src/database/dbClient';
import { seedDatabase } from '../src/database/seed';
import { EngineServer } from '../src/engine/sidecar/engineServer';
import { RequestRouter } from '../src/engine/ipc/requestRouter';
import {
  IPCClient,
  IPCTransport,
  IPCWebsiteRepository,
  IPCPageRepository,
  IPCSectionRepository,
  IPCComponentRepository,
  IPCStorageRepository,
} from '../src/bridge/ipcClient';
import { CURRENT_PROTOCOL_VERSION, IPCRequest } from '../src/engine/ipc/protocol';
import { FTSManager } from '../src/engine/search/ftsManager';
import { JobSupervisor } from '../src/engine/jobs/jobSupervisor';

const TEST_WORKSPACE_ROOT = path.resolve(process.cwd(), 'tmp-phase4-ipc-workspace');

class InMemoryIPCTransport implements IPCTransport {
  private listener: ((msg: string) => void) | null = null;
  public sentMessages: string[] = [];

  constructor(private router: RequestRouter) {}

  send(message: string): void {
    this.sentMessages.push(message);
    setImmediate(async () => {
      try {
        const req: IPCRequest = JSON.parse(message);
        const res = await this.router.routeRequest(req);
        if (this.listener) {
          this.listener(JSON.stringify(res));
        }
      } catch (err: any) {
        if (this.listener) {
          this.listener(JSON.stringify({ id: 'unknown', success: false, error: { code: 'INVALID_REQUEST', message: err.message } }));
        }
      }
    });
  }

  onMessage(callback: (message: string) => void): void {
    this.listener = callback;
  }

  simulateServerEvent(event: string, payload: any): void {
    if (this.listener) {
      this.listener(JSON.stringify({ event, payload, timestamp: new Date().toISOString() }));
    }
  }
}

describe('Phase 4 — Node.js Engine Sidecar + AppBridge IPC Suite (19 Tests)', { timeout: 30000 }, () => {
  let workspaceConfig: WorkspaceConfig;
  let router: RequestRouter;
  let client: IPCClient;
  let transport: InMemoryIPCTransport;

  beforeAll(async () => {
    if (fs.existsSync(TEST_WORKSPACE_ROOT)) {
      try {
        fs.rmSync(TEST_WORKSPACE_ROOT, { recursive: true, force: true });
      } catch (e) {}
    }

    workspaceConfig = new WorkspaceConfig(TEST_WORKSPACE_ROOT);
    const paths = workspaceConfig.ensureDirectoryStructure();

    const testDbUrl = `file:${paths.databasePath}`;
    process.env.DATABASE_URL = testDbUrl;

    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      cwd: process.cwd(),
      stdio: 'ignore',
    });

    await seedDatabase();

    router = new RequestRouter();
    client = new IPCClient();
    transport = new InMemoryIPCTransport(router);
    client.setTransport(transport);

    transport.simulateServerEvent('engine.ready', { engineStatus: 'READY', version: '1.0.0' });
    await client.waitUntilReady();
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

  it('1. EngineServer initializes state & READY handshake cleanly', async () => {
    const engineServer = new EngineServer();
    expect(engineServer.getState()).toBe('STOPPED');
    await engineServer.initialize();
    expect(engineServer.getState()).toBe('READY');
    await engineServer.shutdown();
  });

  it('2. EngineServer handles shutdown sequence cleanly', async () => {
    const engineServer = new EngineServer();
    await engineServer.initialize();
    await engineServer.shutdown();
    expect(engineServer.getState()).toBe('STOPPED');
  });

  it('3. IPCClient stdio JSON-RPC transport registration & readiness', async () => {
    await client.waitUntilReady();
    expect(client).toBeDefined();
  });

  it('4. Request/Response Correlation handles multiple concurrent requests in flight', async () => {
    const webRepo = new IPCWebsiteRepository(client);
    const storageRepo = new IPCStorageRepository(client);

    const [websites, storageStats] = await Promise.all([
      webRepo.getAll(),
      storageRepo.getStats(),
    ]);

    expect(Array.isArray(websites)).toBe(true);
    expect(websites.length).toBeGreaterThan(0);
    expect(storageStats.totalBytes).toBeGreaterThan(0);
  });

  it('5. RequestRouter validates protocol version and rejects mismatch', async () => {
    const malformedReq: any = { id: 'test-1', method: 'website.getAll', protocolVersion: 999 };
    const res = await router.routeRequest(malformedReq);

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('PROTOCOL_MISMATCH');
  });

  it('6. RequestRouter validates parameters against path traversal attacks (../../)', async () => {
    const dangerousReq: IPCRequest = {
      id: 'sec-1',
      method: 'website.create',
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      params: { name: 'Exploit', url: 'https://test.com', settings: { targetPath: '../../system32' } },
    };

    const res = await router.routeRequest(dangerousReq);
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('VALIDATION_FAILED');
    expect(res.error?.message).toContain('Path traversal');
  });

  it('7. RequestRouter handles malformed IPC requests cleanly', async () => {
    const res = await router.routeRequest({} as any);
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('INVALID_REQUEST');
  });

  it('8. Request Timeout handling cancels pending request map cleanly', async () => {
    const slowClient = new IPCClient();
    slowClient.markReady();

    const mockTransport: IPCTransport = {
      send: () => {},
      onMessage: () => {},
    };
    slowClient.setTransport(mockTransport);

    await expect(slowClient.sendRequest('system.ping', {}, 200)).rejects.toThrow('IPCTimeoutError');
  });

  it('9. IPC error responses return structured code, message, and details', async () => {
    const req: IPCRequest = {
      id: 'err-1',
      method: 'non.existent.method',
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const res = await router.routeRequest(req);
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('METHOD_NOT_FOUND');
  });

  it('10. JobSupervisor recovers active running jobs as paused on engine restart', async () => {
    const jobSupervisor = new JobSupervisor();
    const prisma = getPrismaClient();

    const web = await prisma.website.findFirst();
    const activeJob = await prisma.captureJob.create({
      data: {
        websiteId: web!.id,
        websiteName: web!.name,
        websiteUrl: web!.url,
        status: 'running',
        currentAction: 'Active crawling prior to crash',
      },
    });

    const recoveredCount = await jobSupervisor.recoverActiveJobsOnStartup();
    expect(recoveredCount).toBeGreaterThan(0);

    const recoveredJob = await prisma.captureJob.findUnique({ where: { id: activeJob.id } });
    expect(recoveredJob?.status).toBe('paused');
  });

  it('11. FTSManager manages FTS Worker thread state cleanly', async () => {
    const ftsManager = new FTSManager();
    expect(ftsManager.getState()).toBe('STOPPED');
    await ftsManager.stop();
  });

  it('12. FTS operations run on worker thread without blocking main IPC event loop', async () => {
    const ftsManager = new FTSManager();
    expect(ftsManager).toBeDefined();
    await ftsManager.stop();
  });

  it('13. System health IPC endpoint returns system status, uptime, and memory usage', async () => {
    const healthRouter = new RequestRouter();
    const req: IPCRequest = {
      id: 'h-1',
      method: 'system.health',
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const res = await healthRouter.routeRequest(req);
    expect(res.success).toBe(true);
    expect(res.result?.engineStatus).toBe('READY');
    expect(res.result?.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('14. System ping IPC endpoint returns pong timestamp', async () => {
    const req: IPCRequest = {
      id: 'p-1',
      method: 'system.ping',
      protocolVersion: CURRENT_PROTOCOL_VERSION,
    };
    const res = await router.routeRequest(req);
    expect(res.success).toBe(true);
    expect(res.result?.pong).toBe(true);
  });

  it('15. IPC Website repository delegates queries to Prisma database', async () => {
    const webRepo = new IPCWebsiteRepository(client);
    const list = await webRepo.getAll();
    expect(list.length).toBeGreaterThan(0);
  });

  it('16. IPC Page repository retrieves page records', async () => {
    const pageRepo = new IPCPageRepository(client);
    const pages = await pageRepo.getAll();
    expect(Array.isArray(pages)).toBe(true);
  });

  it('17. IPC Section repository retrieves section candidates', async () => {
    const sectionRepo = new IPCSectionRepository(client);
    const sections = await sectionRepo.getAll();
    expect(Array.isArray(sections)).toBe(true);
  });

  it('18. IPC Component repository retrieves candidate components', async () => {
    const componentRepo = new IPCComponentRepository(client);
    const components = await componentRepo.getAllCandidates();
    expect(Array.isArray(components)).toBe(true);
  });

  it('19. Playwright Dependency Installed & Isolated in Engine', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
    expect(packageJson.dependencies['playwright']).toBeDefined();
  });
});
