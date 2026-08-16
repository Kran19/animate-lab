import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { services } from '../../bridge/appBridge';
import {
  Activity,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Terminal,
  Radio,
  Filter,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Globe,
  Compass
} from 'lucide-react';
import { CaptureJob, DiagnosticLog, LogLevel, LogModule } from '../../domain/types';

export const JobsScreen: React.FC = () => {
  const {
    jobs,
    loading,
    navigate,
    activeJob,
    activeJobStats,
    events,
    diagnosticLogs,
    isAutoScrollLogs,
    setAutoScrollLogs,
    clearEvents,
    clearDiagnosticLogs,
    pauseCaptureJob,
    resumeCaptureJob,
    cancelCaptureJob,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<CaptureJob | null>(null);
  const [jobHistoryLogs, setJobHistoryLogs] = useState<DiagnosticLog[]>([]);

  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll diagnostic terminal when new logs arrive (if auto-scroll enabled)
  useEffect(() => {
    if (isAutoScrollLogs && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diagnosticLogs, events, isAutoScrollLogs]);

  const handleInspectJobHistoryLogs = async (job: CaptureJob) => {
    setSelectedJob(job);
    try {
      const logs = await services.jobs.getLogsByJobId(job.id);
      setJobHistoryLogs(logs);
    } catch {
      setJobHistoryLogs([]);
    }
  };

  const currentActiveJob = activeJob || jobs.find((j) => j.status === 'running' || j.status === 'paused') || jobs[0];

  // Filter live diagnostic logs
  const filteredLogs = diagnosticLogs.filter((log) => {
    if (selectedCategory !== 'All' && log.module !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && log.level !== selectedSeverity.toLowerCase()) return false;
    return true;
  });

  if (loading && jobs.length === 0) {
    return <StateHandler state="loading" title="Connecting to Mission Control Telemetry..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-light" /> Live Capture Hub & Mission Control
          </h2>
          <p className="text-xs text-text-muted">
            Push-based real-time telemetry, crawler orchestration controls, and live diagnostic stream.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald">
            <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            LIVE IPC STREAM ACTIVE
          </span>
        </div>
      </div>

      {/* Active Job Telemetry Card */}
      {currentActiveJob && (
        <Card className="p-6 border border-border bg-background-card space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-text-primary">{currentActiveJob.websiteName}</h3>
                <StatusBadge status={currentActiveJob.status} />
              </div>
              <p className="text-xs font-mono text-text-muted">{currentActiveJob.websiteUrl}</p>
            </div>

            {/* Authoritative State Machine Action Buttons */}
            <div className="flex items-center space-x-2">
              {currentActiveJob.status === 'completed' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('components')}
                    icon={<Layers className="w-3.5 h-3.5" />}
                  >
                    View Extracted Components ➔
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('sections')}
                    icon={<Compass className="w-3.5 h-3.5" />}
                  >
                    Inspect Sections
                  </Button>
                </>
              )}

              {currentActiveJob.status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pauseCaptureJob(currentActiveJob.id)}
                  icon={<Pause className="w-3.5 h-3.5" />}
                >
                  Pause Crawl
                </Button>
              )}

              {currentActiveJob.status === 'paused' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => resumeCaptureJob(currentActiveJob.id)}
                  icon={<Play className="w-3.5 h-3.5" />}
                >
                  Resume Crawl
                </Button>
              )}

              {(currentActiveJob.status === 'running' || currentActiveJob.status === 'paused') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelCaptureJob(currentActiveJob.id)}
                  icon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Real-Time Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-accent-light font-medium truncate max-w-lg">
                {currentActiveJob.currentAction || 'Processing crawl pipeline...'}
              </span>
              <span className="text-text-primary font-bold">
                {currentActiveJob.progressPagesTotal > 0
                  ? Math.round((currentActiveJob.progressPagesCompleted / currentActiveJob.progressPagesTotal) * 100)
                  : 0}% ({currentActiveJob.progressPagesCompleted} / {currentActiveJob.progressPagesTotal} pages)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-background-subtle border border-border overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    currentActiveJob.progressPagesTotal > 0
                      ? Math.min(100, Math.round((currentActiveJob.progressPagesCompleted / currentActiveJob.progressPagesTotal) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Live Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50 text-xs font-mono">
            <div className="p-3 bg-background-subtle rounded-lg border border-border/60">
              <span className="text-[10px] text-text-muted uppercase block">Discovered Links</span>
              <strong className="text-base text-text-primary">
                {activeJobStats?.totalDiscovered || currentActiveJob.progressPagesTotal || 0}
              </strong>
            </div>
            <div className="p-3 bg-background-subtle rounded-lg border border-border/60">
              <span className="text-[10px] text-text-muted uppercase block">Captured Pages</span>
              <strong className="text-base text-accent-light">
                {activeJobStats?.visited || currentActiveJob.progressPagesCompleted || 0}
              </strong>
            </div>
            <div
              onClick={() => navigate('components')}
              className="p-3 bg-background-subtle rounded-lg border border-border/60 hover:border-accent cursor-pointer transition-all hover:bg-background-card"
            >
              <span className="text-[10px] text-text-muted uppercase block flex items-center justify-between">
                <span>Extracted Components</span>
                <span className="text-accent text-[9px]">View ➔</span>
              </span>
              <strong className="text-base text-accent-purple">
                {currentActiveJob.extractedComponentsCount || 0}
              </strong>
            </div>
            <div className="p-3 bg-background-subtle rounded-lg border border-border/60">
              <span className="text-[10px] text-text-muted uppercase block">Failed / Errors</span>
              <strong className="text-base text-accent-amber">
                {activeJobStats?.failed || currentActiveJob.errorsCount || 0}
              </strong>
            </div>
          </div>
        </Card>
      )}

      {/* 2-Column Split: Push Event Ticker & Live Streaming Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Live Push Event Ticker */}
        <Card className="p-4 space-y-3 bg-background-card border border-border flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-text-primary uppercase">
              <Compass className="w-4 h-4 text-accent" />
              <span>Event Ticker ({events.length})</span>
            </div>
            <button
              onClick={clearEvents}
              className="text-[11px] text-text-muted hover:text-text-primary font-mono flex items-center gap-1"
              title="Clear event stream buffer"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
            {events.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted text-center text-[11px]">
                Awaiting crawler events...
              </div>
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-background-subtle border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                      {evt.event}
                    </span>
                    <span>{evt.timestamp.split('T')[1]?.replace('Z', '').slice(0, 8)}</span>
                  </div>
                  <p className="text-[11px] text-text-primary truncate">
                    {evt.payload?.url || evt.payload?.title || evt.payload?.status || JSON.stringify(evt.payload || {})}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Column 2: Streaming Diagnostic Terminal */}
        <Card className="lg:col-span-2 p-4 space-y-3 bg-background-card border border-border flex flex-col h-[520px]">
          {/* Terminal Header & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-text-primary uppercase">
              <Terminal className="w-4 h-4 text-accent-emerald" />
              <span>Streaming Diagnostic Terminal</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 text-[11px] font-mono bg-background-subtle border border-border rounded text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="All">All Modules</option>
                <option value="Crawler">Crawler</option>
                <option value="Browser">Browser</option>
                <option value="ResourceCollector">ResourceCollector</option>
                <option value="Analyzer">Analyzer</option>
                <option value="SectionDetector">SectionDetector</option>
                <option value="ComponentExtractor">ComponentExtractor</option>
              </select>

              {/* Severity Filter */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-2 py-1 text-[11px] font-mono bg-background-subtle border border-border rounded text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="All">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>

              {/* Scroll Lock Toggle */}
              <button
                onClick={() => setAutoScrollLogs(!isAutoScrollLogs)}
                className={`p-1 rounded border border-border text-[11px] font-mono flex items-center gap-1 ${
                  isAutoScrollLogs ? 'bg-accent/10 text-accent' : 'bg-background-subtle text-text-muted'
                }`}
                title={isAutoScrollLogs ? 'Auto-scroll Enabled' : 'Auto-scroll Paused'}
              >
                {isAutoScrollLogs ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>

              {/* Clear Buffer */}
              <button
                onClick={clearDiagnosticLogs}
                className="p-1 rounded border border-border bg-background-subtle text-text-muted hover:text-text-primary"
                title="Clear visual log buffer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Terminal Console Viewport */}
          <div className="flex-1 overflow-y-auto bg-[#0d1117] rounded-lg p-3 font-mono text-xs text-[#c9d1d9] space-y-1.5 border border-border/80">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted text-center text-[11px]">
                No diagnostic messages in buffer.
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2 leading-relaxed text-[11px]">
                  <span className="text-[#8b949e] shrink-0">{log.timestamp.split('T')[1]?.replace('Z', '').slice(0, 8)}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold shrink-0 ${
                      log.level === 'error'
                        ? 'bg-accent-rose/20 text-accent-rose'
                        : log.level === 'warn'
                        ? 'bg-accent-amber/20 text-accent-amber'
                        : 'bg-accent/20 text-accent-light'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-[#7ee787] shrink-0">[{log.module}]</span>
                  <span className="text-[#e6edf3] break-all">{log.message}</span>
                </div>
              ))
            )}
            <div ref={terminalBottomRef} />
          </div>
        </Card>
      </div>

      {/* Historical Jobs List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase font-mono">Job History ({jobs.length})</h3>
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <strong className="text-text-primary">{job.websiteName}</strong>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-text-muted">{job.websiteUrl} • Started: {job.startTime.split('T')[0]}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleInspectJobHistoryLogs(job)} icon={<Terminal className="w-3.5 h-3.5" />}>
                  Inspect Logs
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
