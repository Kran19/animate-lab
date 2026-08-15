import React from 'react';
import { useApp } from '../../store/appStore';
import { Search, Command, Activity, PlusCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { setCommandCenterOpen, setCaptureWizardOpen, jobs, navigate } = useApp();

  const activeJob = jobs.find((j) => j.status === 'running');

  return (
    <header className="h-14 border-b border-border bg-background-subtle/80 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 z-10">
      {/* Global Search Command Bar Trigger */}
      <button
        onClick={() => setCommandCenterOpen(true)}
        className="flex items-center space-x-3 bg-background-muted hover:bg-background-hover border border-border px-3.5 py-1.5 rounded-lg text-xs text-text-muted transition-all w-80 shadow-sm group"
      >
        <Search className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
        <span className="flex-1 text-left">Search websites, components, code...</span>
        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-background-card border border-border text-[10px] font-mono text-text-muted">
          <Command className="w-3 h-3 mr-0.5" /> K
        </kbd>
      </button>

      {/* Active Job Status Widget Banner */}
      {activeJob ? (
        <button
          onClick={() => navigate('jobs', { jobId: activeJob.id })}
          className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent-light hover:bg-accent/20 transition-all cursor-pointer"
        >
          <Activity className="w-4 h-4 animate-spin text-accent-light" />
          <div className="text-left font-mono">
            <span className="font-semibold">{activeJob.websiteName}</span> — {activeJob.currentAction}
          </div>
          <span className="px-1.5 py-0.5 rounded bg-accent/20 text-[10px] font-mono">
            {activeJob.progressPagesCompleted}/{activeJob.progressPagesTotal} pages
          </span>
        </button>
      ) : (
        <div className="hidden md:flex items-center space-x-2 text-xs text-text-muted font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Local Engine Storage: <strong className="text-text-primary">D:\WebExperienceLab</strong></span>
        </div>
      )}

      {/* Right Header Controls */}
      <div className="flex items-center space-x-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCaptureWizardOpen(true)}
          icon={<PlusCircle className="w-3.5 h-3.5" />}
        >
          Add Website
        </Button>
      </div>
    </header>
  );
};
