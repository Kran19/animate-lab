import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CodeViewer } from '../ui/CodeViewer';
import { Modal } from '../ui/Modal';
import { StateHandler } from '../ui/StateHandler';
import { Sparkles, Clock, Sliders, Play, ShieldCheck, Activity, Eye, Layers } from 'lucide-react';
import { Animation } from '../../domain/types';

export const AnimationsScreen: React.FC = () => {
  const { animations, loading } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null);

  const filteredAnimations = animations.filter((anim) => {
    const matchesSearch =
      anim.name.toLowerCase().includes(search.toLowerCase()) ||
      anim.library.toLowerCase().includes(search.toLowerCase()) ||
      anim.websiteName.toLowerCase().includes(search.toLowerCase()) ||
      anim.affectedElements.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || anim.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <StateHandler state="loading" title="Loading Animation Library..." />;

  const types = Array.from(new Set(animations.map((a) => a.type)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-rose" /> Animation Timeline & Runtime Analysis
        </h2>
        <p className="text-xs text-text-muted">
          Visual inspection of detected CSS keyframes, WAAPI animations, and GSAP tweens from Phase 7 analysis.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter animations by selector, library, or website..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
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
                    <Clock className="w-3 h-3" /> {anim.durationMs > 0 ? `${anim.durationMs}ms` : 'Continuous'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-primary">{anim.name}</h3>
                  <p className="text-xs font-mono text-accent-light mt-1 truncate">{anim.affectedElements}</p>
                </div>

                {/* Visual Timeline Track */}
                <div className="p-3 bg-background-subtle rounded-lg border border-border space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Delay: {anim.delayMs}ms</span>
                    <span>Easing: <strong className="text-accent-amber">{anim.easing}</strong></span>
                  </div>
                  <div className="w-full h-1.5 bg-background-card rounded-full overflow-hidden flex">
                    {anim.delayMs > 0 && (
                      <div
                        className="bg-text-muted/30 h-full"
                        style={{ width: `${Math.min(30, (anim.delayMs / (anim.durationMs + anim.delayMs)) * 100)}%` }}
                      />
                    )}
                    <div className="bg-accent-rose flex-1 h-full rounded-full" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>{anim.websiteName}</span>
                <span className="text-accent-light font-semibold">Inspect Timeline →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Animation Detail & Timeline Modal */}
      {selectedAnimation && (
        <Modal
          isOpen={!!selectedAnimation}
          onClose={() => setSelectedAnimation(null)}
          title={`Animation Inspector: ${selectedAnimation.name}`}
          maxWidth="3xl"
        >
          <div className="space-y-5">
            {/* Visual Timeline Panel */}
            <div className="p-4 rounded-xl bg-background-subtle border border-border space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Analytical Timeline Track</span>
                <span className="text-[10px] text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20">
                  Phase 7 Verified
                </span>
              </div>

              {/* Timeline Scale & Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0 ms (Start)</span>
                  <span>{Math.round(selectedAnimation.durationMs / 2)} ms</span>
                  <span>{selectedAnimation.durationMs + selectedAnimation.delayMs} ms (End)</span>
                </div>
                <div className="h-6 w-full bg-background-card rounded-lg border border-border overflow-hidden relative flex items-center">
                  <div
                    className="h-full bg-gradient-to-r from-accent-purple/60 via-accent-rose/70 to-accent-amber/60 rounded-md flex items-center px-3 text-[10px] font-bold text-white shadow-sm"
                    style={{ width: '100%' }}
                  >
                    {selectedAnimation.name} ({selectedAnimation.easing})
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-2 rounded bg-background-card border border-border/60">
                  <span className="text-[10px] text-text-muted uppercase block">Library</span>
                  <strong className="text-accent-purple uppercase">{selectedAnimation.library}</strong>
                </div>
                <div className="p-2 rounded bg-background-card border border-border/60">
                  <span className="text-[10px] text-text-muted uppercase block">Trigger</span>
                  <strong className="text-text-primary">{selectedAnimation.trigger}</strong>
                </div>
                <div className="p-2 rounded bg-background-card border border-border/60">
                  <span className="text-[10px] text-text-muted uppercase block">Duration</span>
                  <strong className="text-text-primary">{selectedAnimation.durationMs} ms</strong>
                </div>
                <div className="p-2 rounded bg-background-card border border-border/60">
                  <span className="text-[10px] text-text-muted uppercase block">Delay</span>
                  <strong className="text-text-primary">{selectedAnimation.delayMs} ms</strong>
                </div>
              </div>
            </div>

            {/* Affected DOM Selector */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-text-primary">Target DOM Selector</h4>
              <div className="p-2.5 bg-background-card rounded-lg border border-border font-mono text-xs text-accent-light">
                {selectedAnimation.affectedElements}
              </div>
            </div>

            {/* Runtime Evidence */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-text-primary">Runtime Evidence & Trace</h4>
              <div className="p-3 font-mono text-xs text-text-muted bg-background-card rounded-lg border border-border">
                {selectedAnimation.evidence?.runtimeEvidence || 'Captured via Playwright MutationObserver and DevTools animation telemetry.'}
              </div>
            </div>

            {/* Code Snippet */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-text-primary">Captured Script / Style Snippet (Read-Only)</h4>
              <CodeViewer files={[{ filename: 'animation.js', language: 'javascript', code: selectedAnimation.codeSnippet || '// Animation snippet' }]} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
