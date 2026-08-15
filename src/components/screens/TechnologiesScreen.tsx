import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { StateHandler } from '../ui/StateHandler';
import { Cpu, Zap, Sliders, Box, Code, Sparkles, ShieldCheck, Globe } from 'lucide-react';
import { Technology } from '../../domain/types';

export const TechnologiesScreen: React.FC = () => {
  const { technologies, loading } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  const filteredTechs = technologies.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <StateHandler state="loading" title="Loading Technology Library..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent-emerald" /> Technology Library
        </h2>
        <p className="text-xs text-text-muted">Evidence-based technology detection engine index across captured web ecosystem.</p>
      </div>

      <div className="bg-background-card p-3 rounded-xl border border-border">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter technologies by name or category..." />
      </div>

      {filteredTechs.length === 0 ? (
        <StateHandler state="no_results" title="No technologies found" description="Try clearing your search term." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechs.map((tech) => (
            <Card
              key={tech.id}
              hoverable
              onClick={() => setSelectedTech(tech)}
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="success" size="sm">{tech.category}</Badge>
                  {tech.version && <span className="text-[10px] font-mono text-text-muted">v{tech.version}</span>}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{tech.name}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5">{tech.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>{tech.websiteCount} sites detected</span>
                <span className="text-accent-light font-semibold">{tech.componentCount} comps →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Evidence Inspector Modal */}
      {selectedTech && (
        <Modal
          isOpen={!!selectedTech}
          onClose={() => setSelectedTech(null)}
          title={`Technology Evidence Trace: ${selectedTech.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="p-4 bg-background-subtle rounded-lg border border-border space-y-1">
              <h4 className="text-sm font-semibold text-text-primary">{selectedTech.name} {selectedTech.version && `(v${selectedTech.version})`}</h4>
              <p className="text-xs text-text-muted">{selectedTech.description}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-emerald" /> Detection Evidence Trace ({selectedTech.evidence.length})
              </h4>

              {selectedTech.evidence.length === 0 ? (
                <p className="text-xs text-text-muted font-mono">No direct evidence traces recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedTech.evidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-background-subtle rounded-lg border border-border space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-accent-cyan font-semibold uppercase">{ev.evidenceType}</span>
                        <span className="text-accent-emerald font-semibold">Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-text-primary">{ev.source}</div>
                      <div className="text-text-muted text-[11px] bg-background-card p-2 rounded border border-border/50">{ev.evidenceValue}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
