import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CodeViewer } from '../ui/CodeViewer';
import { Modal } from '../ui/Modal';
import { StateHandler } from '../ui/StateHandler';
import { Sparkles, Globe, Clock, Sliders, Code2, Play } from 'lucide-react';
import { Animation } from '../../domain/types';

export const AnimationsScreen: React.FC = () => {
  const { animations, loading } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null);

  const filteredAnimations = animations.filter((anim) => {
    const matchesSearch = anim.name.toLowerCase().includes(search.toLowerCase()) ||
      anim.library.toLowerCase().includes(search.toLowerCase()) ||
      anim.websiteName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || anim.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <StateHandler state="loading" title="Loading Animation Library..." />;

  const types = Array.from(new Set(animations.map((a) => a.type)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-rose" /> Animation Library
        </h2>
        <p className="text-xs text-text-muted">Detected runtime animation triggers, GSAP timelines, CSS transitions, and easing profiles.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter animations by name, library, or website..." />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="all">All Animation Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filteredAnimations.length === 0 ? (
        <StateHandler state="no_results" title="No animations found" description="Try clearing your search term or animation type filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimations.map((anim) => (
            <Card
              key={anim.id}
              hoverable
              onClick={() => setSelectedAnimation(anim)}
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm">{anim.library}</Badge>
                  <span className="text-[10px] font-mono text-accent-cyan flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {anim.durationMs > 0 ? `${anim.durationMs}ms` : 'Loop'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-primary">{anim.name}</h3>
                  <p className="text-xs font-mono text-accent-light mt-1 truncate">{anim.affectedElements}</p>
                </div>

                <div className="p-2.5 bg-background-subtle rounded-lg border border-border space-y-1 text-xs font-mono">
                  <div className="text-text-muted text-[10px]">Trigger: <span className="text-text-primary">{anim.trigger}</span></div>
                  <div className="text-text-muted text-[10px]">Easing: <span className="text-accent-amber">{anim.easing}</span></div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>{anim.websiteName}</span>
                <span className="text-accent-light font-semibold">Inspect Evidence →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Animation Detail Modal */}
      {selectedAnimation && (
        <Modal
          isOpen={!!selectedAnimation}
          onClose={() => setSelectedAnimation(null)}
          title={`Animation Inspector: ${selectedAnimation.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-background-subtle p-4 rounded-lg border border-border">
              <div><span className="text-text-muted">Library:</span> <strong className="text-accent-rose uppercase">{selectedAnimation.library}</strong></div>
              <div><span className="text-text-muted">Type:</span> <strong className="text-text-primary uppercase">{selectedAnimation.type}</strong></div>
              <div><span className="text-text-muted">Trigger:</span> <strong className="text-text-primary">{selectedAnimation.trigger}</strong></div>
              <div><span className="text-text-muted">Duration:</span> <strong className="text-text-primary">{selectedAnimation.durationMs} ms</strong></div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-primary">Runtime Evidence & Trace</h4>
              <p className="text-xs font-mono text-text-muted bg-background-card p-3 rounded-lg border border-border">
                {selectedAnimation.evidence.runtimeEvidence}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-primary">Extracted Script Snippet</h4>
              <CodeViewer files={[{ filename: 'animation.js', language: 'javascript', code: selectedAnimation.codeSnippet }]} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
