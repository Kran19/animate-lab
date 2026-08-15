import React, { useState } from 'react';
import { PreviewMode } from '../../domain/types';
import { Monitor, RefreshCw, ExternalLink, ShieldAlert, Code2, Layers, Globe } from 'lucide-react';
import { clsx } from 'clsx';

export interface PreviewFrameProps {
  previewUrl?: string;
  title?: string;
  originalUrl?: string;
  className?: string;
  mode?: PreviewMode;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  previewUrl,
  title = 'Component Preview',
  originalUrl,
  className,
  mode = 'local_capture',
}) => {
  const [activeMode, setActiveMode] = useState<PreviewMode>(mode);
  const [aspect, setAspect] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const modes: { id: PreviewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'original', label: 'Live Original', icon: <Globe className="w-3 h-3" /> },
    { id: 'local_capture', label: 'Local Capture', icon: <Monitor className="w-3 h-3" /> },
    { id: 'isolated_section', label: 'Isolated Section', icon: <Layers className="w-3 h-3" /> },
    { id: 'generated_component', label: 'Generated Component', icon: <Code2 className="w-3 h-3" /> },
  ];

  return (
    <div className={clsx('flex flex-col bg-background-subtle border border-border rounded-xl overflow-hidden shadow-xl', className)}>
      {/* Top DevTools Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-background-card border-b border-border text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-accent-rose/60 border border-accent-rose/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-accent-amber/60 border border-accent-amber/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-accent-emerald/60 border border-accent-emerald/80 inline-block" />
          </div>

          <span className="font-medium text-text-primary">{title}</span>

          {/* Persistent Preview Honesty Warning Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 text-[10px] font-mono text-accent-amber ml-2">
            <ShieldAlert className="w-3 h-3 mr-1" />
            MOCK PREVIEW — Backend not connected
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 bg-background-subtle p-1 rounded-lg border border-border">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={clsx(
                'flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                activeMode === m.id
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Device Viewport Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-background/50 border-b border-border/50 text-[11px] text-text-muted font-mono">
        <div className="flex items-center space-x-3">
          <span>Viewport: <strong className="text-text-primary">{aspect === 'desktop' ? '1920x1080' : aspect === 'tablet' ? '768x1024' : '375x812'}</strong></span>
          <div className="flex space-x-1">
            <button onClick={() => setAspect('desktop')} className={clsx('px-1.5 py-0.5 rounded', aspect === 'desktop' && 'bg-background-card text-accent-light')}>Desktop</button>
            <button onClick={() => setAspect('tablet')} className={clsx('px-1.5 py-0.5 rounded', aspect === 'tablet' && 'bg-background-card text-accent-light')}>Tablet</button>
            <button onClick={() => setAspect('mobile')} className={clsx('px-1.5 py-0.5 rounded', aspect === 'mobile' && 'bg-background-card text-accent-light')}>Mobile</button>
          </div>
        </div>

        {originalUrl && (
          <a href={originalUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-accent-light hover:underline">
            <span>{originalUrl}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Render Frame Area */}
      <div className="relative min-h-[320px] bg-background-muted flex items-center justify-center p-6 overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className={clsx(
              'max-w-full rounded-lg shadow-2xl border border-border transition-all duration-300',
              aspect === 'desktop' && 'w-full max-h-[500px] object-cover',
              aspect === 'tablet' && 'w-[600px] max-h-[450px] object-cover',
              aspect === 'mobile' && 'w-[320px] max-h-[400px] object-cover'
            )}
          />
        ) : (
          <div className="text-center space-y-2">
            <Monitor className="w-12 h-12 text-text-muted mx-auto opacity-40 animate-pulse" />
            <p className="text-xs font-mono text-text-muted">Simulated DOM Component Render Viewport ({activeMode})</p>
          </div>
        )}
      </div>
    </div>
  );
};
