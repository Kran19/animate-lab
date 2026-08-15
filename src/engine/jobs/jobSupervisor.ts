import { getPrismaClient } from '../../database/dbClient';
import { IPCEvent } from '../ipc/protocol';

export type JobEventListener = (event: IPCEvent) => void;

export class JobSupervisor {
  private eventListeners: Set<JobEventListener> = new Set();

  public addEventListener(listener: JobEventListener): void {
    this.eventListeners.add(listener);
  }

  public removeEventListener(listener: JobEventListener): void {
    this.eventListeners.delete(listener);
  }

  public emitEvent(event: string, payload: any): void {
    const ipcEvent: IPCEvent = {
      event,
      payload,
      timestamp: new Date().toISOString(),
    };
    for (const listener of this.eventListeners) {
      try {
        listener(ipcEvent);
      } catch (err) {
        console.error('Error delivering engine event to listener:', err);
      }
    }
  }

  /**
   * Recovers uncommitted or active jobs on sidecar startup.
   * Marks any active 'running' jobs as 'paused' so they are safely recoverable on user command.
   */
  public async recoverActiveJobsOnStartup(): Promise<number> {
    const prisma = getPrismaClient();
    const runningJobs = await prisma.captureJob.findMany({
      where: { status: 'running' },
    });

    if (runningJobs.length === 0) return 0;

    for (const job of runningJobs) {
      await prisma.captureJob.update({
        where: { id: job.id },
        data: {
          status: 'paused',
          currentAction: 'Engine restarted; job state preserved as paused',
        },
      });

      await prisma.diagnosticLog.create({
        data: {
          jobId: job.id,
          websiteId: job.websiteId,
          level: 'warn',
          module: 'Crawler',
          message: 'Engine process restarted. Running job state recovered cleanly as paused.',
        },
      });

      this.emitEvent('job.paused', { jobId: job.id, websiteId: job.websiteId, reason: 'Engine restart' });
    }

    return runningJobs.length;
  }
}

export const defaultJobSupervisor = new JobSupervisor();
