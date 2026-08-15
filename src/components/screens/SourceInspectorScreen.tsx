import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { CodeViewer } from '../ui/CodeViewer';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { StateHandler } from '../ui/StateHandler';
import { Code2, FileCode, Folder, GitCompare, Eye } from 'lucide-react';

export const SourceInspectorScreen: React.FC = () => {
  const { resources, loading } = useApp();
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const [diffMode, setDiffMode] = useState<'original' | 'normalized' | 'component'>('original');

  if (loading) return <StateHandler state="loading" title="Loading Source Inspector..." />;

  const resFiles = resources.map((r) => ({
    filename: r.localPath.split('/').pop() || r.originalUrl,
    language: r.resourceType === 'css' ? 'css' : r.resourceType === 'js' ? 'javascript' : 'html',
    code: r.contentSnippet || `/* File source capture for ${r.originalUrl} */\n/* MIME: ${r.mimeType} | Size: ${(r.sizeBytes / 1024).toFixed(1)} KB */`
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent-light" /> Source Inspector
        </h2>
        <p className="text-xs text-text-muted">Inspect raw captured HTML, CSS, JS, and shader assets with version comparison.</p>
      </div>

      {/* Workspace Diff Mode Header */}
      <div className="flex items-center justify-between bg-background-card p-3 rounded-xl border border-border">
        <div className="flex items-center space-x-2 text-xs font-mono text-text-muted">
          <GitCompare className="w-4 h-4 text-accent" />
          <span>Source State View:</span>
        </div>

        <div className="flex items-center space-x-1 bg-background-subtle p-1 rounded-lg border border-border">
          <button
            onClick={() => setDiffMode('original')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${diffMode === 'original' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'}`}
          >
            Original Capture
          </button>
          <button
            onClick={() => setDiffMode('normalized')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${diffMode === 'normalized' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'}`}
          >
            Normalized Output
          </button>
          <button
            onClick={() => setDiffMode('component')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${diffMode === 'component' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'}`}
          >
            Component TSX
          </button>
        </div>
      </div>

      {/* Editor & File Tree Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree Side Panel */}
        <Card className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-accent-amber" /> Captured Source Files
          </h3>

          <div className="space-y-1">
            {resFiles.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedResourceIndex(idx)}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${selectedResourceIndex === idx ? 'bg-accent/15 text-accent-light border border-accent/30 font-semibold' : 'text-text-muted hover:text-text-primary hover:bg-background-hover'}`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.filename}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Code Editor Main */}
        <div className="lg:col-span-3">
          <CodeViewer files={[resFiles[selectedResourceIndex] || resFiles[0]]} />
        </div>
      </div>
    </div>
  );
};
