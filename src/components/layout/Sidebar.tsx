import React from 'react';
import { useApp, ScreenId } from '../../store/appStore';
import {
  LayoutDashboard,
  Globe,
  FileText,
  Layers,
  Box,
  Sparkles,
  Cpu,
  Image as ImageIcon,
  Wrench,
  Activity,
  Code2,
  HardDrive,
  Settings,
  PlusCircle,
  FlaskConical
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItemProps {
  id: ScreenId;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const Sidebar: React.FC = () => {
  const { route, navigate, setCaptureWizardOpen, websites, pages, sections, components, animations, threeD, assets, jobs } = useApp();

  const activeJobCount = jobs.filter(j => j.status === 'running').length;

  const NavItem: React.FC<NavItemProps> = ({ id, label, icon, count }) => {
    const isActive = route.screen === id;
    return (
      <button
        onClick={() => navigate(id)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
          isActive
            ? 'bg-accent/15 text-accent-light border border-accent/30 font-semibold shadow-inner-light'
            : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
        )}
      >
        <div className="flex items-center space-x-2.5">
          <span className={clsx('transition-colors', isActive ? 'text-accent-light' : 'text-text-muted group-hover:text-text-secondary')}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {count !== undefined && (
          <span
            className={clsx(
              'px-1.5 py-0.5 rounded text-[10px] font-mono',
              isActive ? 'bg-accent/25 text-accent-light' : 'bg-background-muted text-text-muted'
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-background-subtle border-r border-border flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-background-card/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent-light shadow-glow-indigo">
            <FlaskConical className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-text-primary flex items-center gap-1.5">
              AnimateLab
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-accent/20 text-accent-light uppercase">v0.1</span>
            </h1>
            <p className="text-[10px] text-text-muted font-mono">Component Extractor</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-3 border-b border-border">
        <button
          onClick={() => setCaptureWizardOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-white font-medium px-3 py-2 rounded-lg text-xs transition-all shadow-glow-indigo active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Capture Project</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Dashboard */}
        <div>
          <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
        </div>

        {/* EXPLORE Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider font-mono mb-2">Explore</p>
          <NavItem id="websites" label="Websites" icon={<Globe className="w-4 h-4" />} count={websites.length} />
          <NavItem id="pages" label="Pages" icon={<FileText className="w-4 h-4" />} count={pages.length} />
          <NavItem id="sections" label="Sections" icon={<Layers className="w-4 h-4" />} count={sections.length} />
          <NavItem id="components" label="Component Candidates" icon={<Box className="w-4 h-4" />} count={components.length} />
          <NavItem id="animations" label="Animations" icon={<Sparkles className="w-4 h-4" />} count={animations.length} />
          <NavItem id="threed" label="3D / WebGL" icon={<Wrench className="w-4 h-4" />} count={threeD.length} />
          <NavItem id="assets" label="Assets" icon={<ImageIcon className="w-4 h-4" />} count={assets.length} />
          <NavItem id="technologies" label="Technologies" icon={<Cpu className="w-4 h-4" />} />
        </div>

        {/* INSPECT Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider font-mono mb-2">Inspect</p>
          <NavItem id="jobs" label="Jobs / Processing" icon={<Activity className="w-4 h-4" />} count={activeJobCount > 0 ? activeJobCount : jobs.length} />
          <NavItem id="source_inspector" label="Source Inspector" icon={<Code2 className="w-4 h-4" />} />
          <NavItem id="storage" label="Storage & Data" icon={<HardDrive className="w-4 h-4" />} />
        </div>

        {/* SYSTEM Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider font-mono mb-2">System</p>
          <NavItem id="settings" label="Settings" icon={<Settings className="w-4 h-4" />} />
        </div>
      </div>

      {/* Footer Local Status */}
      <div className="p-3 border-t border-border bg-background-card/40 text-[11px] text-text-muted flex items-center justify-between font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
          <span>Local Engine Ready</span>
        </div>
        <span className="text-[10px]">Tauri Ready</span>
      </div>
    </aside>
  );
};
