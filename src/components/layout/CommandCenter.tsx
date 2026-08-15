import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Search, Globe, FileText, Layers, Box, Sparkles, Wrench, Image as ImageIcon, Cpu, Activity, HardDrive, Settings, PlusCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const CommandCenter: React.FC = () => {
  const {
    isCommandCenterOpen,
    setCommandCenterOpen,
    setCaptureWizardOpen,
    navigate,
    websites,
    pages,
    sections,
    components,
    animations,
    threeD,
    assets,
    technologies,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isCommandCenterOpen) return null;

  const handleClose = () => {
    setQuery('');
    setCommandCenterOpen(false);
  };

  const filteredWebsites = query
    ? websites.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()) || w.url.toLowerCase().includes(query.toLowerCase()))
    : websites.slice(0, 3);

  const filteredPages = query
    ? pages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.path.toLowerCase().includes(query.toLowerCase()))
    : pages.slice(0, 3);

  const filteredComponents = query
    ? components.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : components.slice(0, 3);

  const filteredAnimations = query
    ? animations.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.library.toLowerCase().includes(query.toLowerCase()))
    : animations.slice(0, 3);

  const actions = [
    {
      id: 'act-add',
      title: 'Add Website / New Capture',
      icon: <PlusCircle className="w-4 h-4 text-accent" />,
      run: () => {
        handleClose();
        setCaptureWizardOpen(true);
      },
    },
    {
      id: 'act-jobs',
      title: 'Open Processing Jobs Center',
      icon: <Activity className="w-4 h-4 text-accent-light" />,
      run: () => {
        handleClose();
        navigate('jobs');
      },
    },
    {
      id: 'act-components',
      title: 'Browse Component Candidates',
      icon: <Box className="w-4 h-4 text-accent-purple" />,
      run: () => {
        handleClose();
        navigate('components');
      },
    },
    {
      id: 'act-assets',
      title: 'Open Asset Browser',
      icon: <ImageIcon className="w-4 h-4 text-accent-cyan" />,
      run: () => {
        handleClose();
        navigate('assets');
      },
    },
    {
      id: 'act-storage',
      title: 'Inspect Local Storage & Disk',
      icon: <HardDrive className="w-4 h-4 text-accent-emerald" />,
      run: () => {
        handleClose();
        navigate('storage');
      },
    },
    {
      id: 'act-settings',
      title: 'Application Settings',
      icon: <Settings className="w-4 h-4 text-text-muted" />,
      run: () => {
        handleClose();
        navigate('settings');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-background-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-background-subtle">
          <Search className="w-5 h-5 text-accent mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search websites, components, code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none font-sans"
          />
          <kbd
            onClick={handleClose}
            className="px-2 py-1 rounded bg-background-muted border border-border text-[10px] font-mono text-text-muted cursor-pointer hover:bg-background-hover"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="px-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono mb-1.5">Quick Actions</p>
              <div className="space-y-1">
                {actions.map((act) => (
                  <button
                    key={act.id}
                    onClick={act.run}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-background-hover transition-colors text-text-primary group"
                  >
                    <div className="flex items-center space-x-3">
                      {act.icon}
                      <span className="font-medium">{act.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Websites Search Results */}
          {filteredWebsites.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono mb-1.5">Websites ({filteredWebsites.length})</p>
              <div className="space-y-1">
                {filteredWebsites.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      handleClose();
                      navigate('website_detail', { websiteId: w.id });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-background-hover transition-colors text-text-primary"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Globe className="w-4 h-4 text-accent-cyan shrink-0" />
                      <span className="font-medium">{w.name}</span>
                      <span className="text-text-muted font-mono text-[11px]">{w.url}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent-light">{w.totalComponents} comps</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Components Search Results */}
          {filteredComponents.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono mb-1.5">Components ({filteredComponents.length})</p>
              <div className="space-y-1">
                {filteredComponents.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleClose();
                      navigate('component_detail', { componentId: c.id });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-background-hover transition-colors text-text-primary"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Box className="w-4 h-4 text-accent-purple shrink-0" />
                      <span className="font-medium">{c.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-background-muted text-[10px]">{c.category}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">{c.provenance.sourceWebsiteName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
