import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { services } from '../../bridge/appBridge';
import { Activity, Play, Pause, XCircle, RotateCcw, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';
import { CaptureJob, DiagnosticLog } from '../../domain/types';

export const JobsScreen: React.FC = () => {
  const { jobs, loading, refreshData } = useApp();
  const [selectedJob, setSelectedJob] = useState<CaptureJob | null>(null);
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);

  const handleInspectLogs = async (job: CaptureJob) => {
    setSelectedJob(job);
    const jobLogs = await services.jobs.getLogsByJobId(job.id);
    setLogs(jobLogs);
  };

  const handlePause = async (id: string) => {
    await services.jobs.pauseJob(id);
    await refreshData();
  };

  const handleResume = async (id: string) => {
    await services.jobs.resumeJob(id);
    await refreshData();
  };

  const handleCancel = async (id: string) => {
    await services.jobs.cancelJob(id);
    await refreshData();
  };

  const handleRetry = async (id: string) => {
    await services.jobs.retryJob(id);
    await refreshData();
  };

  if (loading) return <StateHandler state="loading" title="Loading Processing Jobs..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-light" /> Job / Processing Center
        </h2>
        <p className="text-xs text-text-muted">Background crawling pipeline execution telemetry, step progress, and diagnostic logs.</p>
      </div>

      {jobs.length === 0 ? (
        <StateHandler state="empty" title="No Jobs Active" description="Start a new capture project to queue job pipelines." />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const pct = Math.round((job.progressPagesCompleted / job.progressPagesTotal) * 100);
            return (
              <Card key={job.id} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-bold text-text-primary">{job.websiteName}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs font-mono text-text-muted">{job.websiteUrl}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.status === 'running' && (
                      <Button variant="outline" size="sm" onClick={() => handlePause(job.id)} icon={<Pause className="w-3.5 h-3.5" />}>
                        Pause
                      </Button>
                    )}

                    {job.status === 'paused' && (
                      <Button variant="primary" size="sm" onClick={() => handleResume(job.id)} icon={<Play className="w-3.5 h-3.5" />}>
                        Resume
                      </Button>
                    )}

                    {(job.status === 'running' || job.status === 'paused') && (
                      <Button variant="danger" size="sm" onClick={() => handleCancel(job.id)} icon={<XCircle className="w-3.5 h-3.5" />}>
                        Cancel
                      </Button>
                    )}

                    {(job.status === 'failed' || job.status === 'partial') && (
                      <Button variant="outline" size="sm" onClick={() => handleRetry(job.id)} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                        Retry Failed
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => handleInspectLogs(job)} icon={<Terminal className="w-3.5 h-3.5" />}>
                      Diagnostics
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">{job.currentAction}</span>
                    <span className="text-text-primary font-bold">{pct}% ({job.progressPagesCompleted}/{job.progressPagesTotal} pages)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-background-subtle border border-border overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Counter Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-xs font-mono text-text-muted">
                  <div>Captured Resources: <strong className="text-text-primary">{job.capturedResourcesCount}</strong></div>
                  <div>Discovered Animations: <strong className="text-accent-rose">{job.discoveredAnimationsCount}</strong></div>
                  <div>Extracted Comps: <strong className="text-accent-purple">{job.extractedComponentsCount}</strong></div>
                  <div>Warnings / Errors: <strong className="text-accent-amber">{job.warningsCount} / {job.errorsCount}</strong></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Diagnostic Log Modal */}
      {selectedJob && (
        <div className="mt-8 bg-background-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" /> Diagnostics Log Output: {selectedJob.websiteName}
            </h3>
            <button onClick={() => setSelectedJob(null)} className="text-xs text-text-muted hover:text-text-primary font-mono">Close Logs</button>
          </div>

          <div className="bg-background-subtle p-4 rounded-lg border border-border font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-text-secondary">
                <span className="text-text-muted/60 text-[10px] shrink-0">{log.timestamp.split('T')[1].replace('Z', '')}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${log.level === 'error' ? 'bg-accent-rose/20 text-accent-rose' : log.level === 'warn' ? 'bg-accent-amber/20 text-accent-amber' : 'bg-accent/20 text-accent-light'}`}>
                  {log.level}
                </span>
                <span className="text-text-muted text-[11px] shrink-0">[{log.module}]</span>
                <span className="text-text-primary">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
