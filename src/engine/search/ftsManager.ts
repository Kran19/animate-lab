import { Worker } from 'worker_threads';
import path from 'path';

export type FTSWorkerState = 'STARTING' | 'READY' | 'BUSY' | 'STOPPING' | 'STOPPED' | 'FAILED';

export class FTSManager {
  private worker: Worker | null = null;
  private state: FTSWorkerState = 'STOPPED';
  private restartCount = 0;
  private maxRestarts = 3;
  private pendingRequests: Map<string, { resolve: (res: any) => void; reject: (err: any) => void }> = new Map();

  public getState(): FTSWorkerState {
    return this.state;
  }

  public async start(): Promise<void> {
    if (this.state === 'READY' || this.state === 'STARTING') return;

    this.state = 'STARTING';
    const workerScript = path.resolve(__dirname, 'ftsWorker.js');

    try {
      this.worker = new Worker(workerScript);

      this.worker.on('message', (msg) => {
        if (msg.type === 'worker.ready') {
          this.state = 'READY';
          return;
        }

        if (msg.id && this.pendingRequests.has(msg.id)) {
          const req = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.success) {
            req.resolve(msg.result);
          } else {
            req.reject(new Error(msg.error || 'FTS task error'));
          }
        }
      });

      this.worker.on('error', (err) => {
        console.error('FTS Worker thread error:', err);
        this.handleWorkerCrash();
      });

      this.worker.on('exit', (code) => {
        if (code !== 0 && this.state !== 'STOPPING' && this.state !== 'STOPPED') {
          console.warn(`FTS Worker thread exited unexpectedly with code ${code}`);
          this.handleWorkerCrash();
        }
      });
    } catch (err) {
      this.state = 'FAILED';
      console.error('Failed to spawn FTS worker thread:', err);
    }
  }

  private handleWorkerCrash(): void {
    this.state = 'FAILED';
    this.worker = null;

    // Reject all pending worker tasks
    for (const [id, req] of this.pendingRequests.entries()) {
      req.reject(new Error('FTS Worker thread crashed during task execution'));
    }
    this.pendingRequests.clear();

    // Bounded auto-restart
    if (this.restartCount < this.maxRestarts) {
      this.restartCount++;
      console.log(`Attempting bounded FTS worker restart (${this.restartCount}/${this.maxRestarts})...`);
      this.start().catch((err) => console.error('FTS worker restart failed:', err));
    }
  }

  public async executeTask(type: string, payload: any): Promise<any> {
    if (this.state !== 'READY' || !this.worker) {
      throw new Error(`FTSWorkerUnavailable: Worker state is ${this.state}`);
    }

    const id = `fts-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type, payload });
    });
  }

  public async stop(): Promise<void> {
    this.state = 'STOPPING';
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    this.state = 'STOPPED';
  }
}

export const defaultFTSManager = new FTSManager();
