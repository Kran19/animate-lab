import readline from 'readline';
import { RequestRouter } from '../ipc/requestRouter';
import { defaultJobSupervisor } from '../jobs/jobSupervisor';
import { disconnectPrisma } from '../../database/dbClient';
import { IPCEvent, IPCRequest, IPCResponse, CURRENT_PROTOCOL_VERSION } from '../ipc/protocol';

export type EngineState = 'STARTING' | 'READY' | 'BUSY' | 'SHUTTING_DOWN' | 'STOPPED' | 'FAILED';

export class EngineServer {
  private state: EngineState = 'STOPPED';
  private router = new RequestRouter();
  private rl: readline.Interface | null = null;

  public getState(): EngineState {
    return this.state;
  }

  public async initialize(): Promise<void> {
    this.state = 'STARTING';

    try {
      // Recover interrupted jobs cleanly
      await defaultJobSupervisor.recoverActiveJobsOnStartup();

      this.state = 'READY';

      // Send READY event over stdout stream
      this.sendEvent('engine.ready', {
        engineStatus: 'READY',
        version: '1.0.0',
        protocolVersion: CURRENT_PROTOCOL_VERSION,
      });

      this.logDiagnostic('info', 'Node.js Engine Sidecar initialized successfully.');
    } catch (err: any) {
      this.state = 'FAILED';
      this.logDiagnostic('error', `Engine initialization failed: ${err?.message}`);
      throw err;
    }
  }

  public startStdioTransport(): void {
    if (this.rl) return;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const req: IPCRequest = JSON.parse(trimmed);
        const res = await this.router.routeRequest(req);
        this.writeResponse(res);
      } catch (err: any) {
        const errRes: IPCResponse = {
          id: 'unknown',
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: `JSON-RPC parse error: ${err?.message}`,
          },
        };
        this.writeResponse(errRes);
      }
    });

    // Listen to supervisor engine events and broadcast over stdout
    defaultJobSupervisor.addEventListener((ipcEvent) => {
      this.sendEvent(ipcEvent.event, ipcEvent.payload);
    });
  }

  public writeResponse(res: IPCResponse): void {
    // Write protocol JSON-RPC response ONLY to stdout
    process.stdout.write(JSON.stringify(res) + '\n');
  }

  public sendEvent(event: string, payload: any): void {
    const ipcEvent: IPCEvent = {
      event,
      payload,
      timestamp: new Date().toISOString(),
    };
    // Write protocol JSON-RPC event ONLY to stdout
    process.stdout.write(JSON.stringify(ipcEvent) + '\n');
  }

  public logDiagnostic(level: 'info' | 'warn' | 'error', message: string): void {
    // Diagnostic log entries are written ONLY to stderr (never stdout protocol stream)
    const logLine = `[ENGINE_LOG] [${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    process.stderr.write(logLine);
  }

  public async shutdown(): Promise<void> {
    if (this.state === 'SHUTTING_DOWN' || this.state === 'STOPPED') return;

    this.state = 'SHUTTING_DOWN';
    this.router.setShutdownRequested(true);
    this.logDiagnostic('info', 'Engine shutdown sequence initiated...');

    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }

    try {
      await disconnectPrisma();
      this.logDiagnostic('info', 'Prisma database connection disconnected cleanly.');
    } catch (err: any) {
      this.logDiagnostic('error', `Error disconnecting Prisma: ${err?.message}`);
    }

    this.state = 'STOPPED';
    this.sendEvent('engine.stopped', { engineStatus: 'STOPPED' });
  }
}

// Global server instance for sidecar process entry
export const engineServer = new EngineServer();

if (process.argv[1]?.includes('engineServer.js')) {
  engineServer.initialize()
    .then(() => engineServer.startStdioTransport())
    .catch(() => process.exit(1));

  process.on('SIGTERM', () => engineServer.shutdown().then(() => process.exit(0)));
  process.on('SIGINT', () => engineServer.shutdown().then(() => process.exit(0)));
}
