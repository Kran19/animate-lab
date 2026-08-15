import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CodeViewer } from '../ui/CodeViewer';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Wrench, Box, Cpu, Activity, HardDrive } from 'lucide-react';
import { ThreeDExperience } from '../../domain/types';

export const ThreeDLibraryScreen: React.FC = () => {
  const { threeD, loading } = useApp();
  const [search, setSearch] = useState('');
  const [selected3D, setSelected3D] = useState<ThreeDExperience | null>(null);

  const filtered3D = threeD.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.websiteName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <StateHandler state="loading" title="Loading 3D & WebGL Library..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Wrench className="w-5 h-5 text-accent-emerald" /> 3D & WebGL Library
        </h2>
        <p className="text-xs text-text-muted">Detected WebGL2 canvases, Three.js scenes, GLTF/GLB models, and GLSL shaders.</p>
      </div>

      <div className="bg-background-card p-3 rounded-xl border border-border">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter 3D experiences by title, type, or website..." />
      </div>

      {filtered3D.length === 0 ? (
        <StateHandler state="no_results" title="No 3D/WebGL experiences found" description="Try clearing your search term." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered3D.map((item) => (
            <Card
              key={item.id}
              hoverable
              onClick={() => setSelected3D(item)}
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-40 rounded-lg overflow-hidden border border-border bg-background-muted">
                  <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="purple" size="sm">{item.type}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
                  <p className="text-xs font-mono text-accent-light mt-1">{item.websiteName} ({item.pagePath})</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono p-2 bg-background-subtle rounded-lg border border-border">
                  <div><span className="text-[10px] text-text-muted block">Context</span><strong className="text-text-primary uppercase">{item.webGlContextType}</strong></div>
                  <div><span className="text-[10px] text-text-muted block">FPS</span><strong className="text-accent-emerald">{item.fpsEstimate}</strong></div>
                  <div><span className="text-[10px] text-text-muted block">Models</span><strong className="text-accent-cyan">{item.modelCount}</strong></div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>{item.shaderCount} shaders captured</span>
                <span className="text-accent-light font-semibold">Inspect Canvas →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 3D Inspector Modal */}
      {selected3D && (
        <Modal
          isOpen={!!selected3D}
          onClose={() => setSelected3D(null)}
          title={`3D Experience Inspector: ${selected3D.title}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-background-subtle p-4 rounded-lg border border-border">
              <div><span className="text-text-muted">Renderer:</span> <strong className="text-accent-purple uppercase">{selected3D.type}</strong></div>
              <div><span className="text-text-muted">Context:</span> <strong className="text-text-primary uppercase">{selected3D.webGlContextType}</strong></div>
              <div><span className="text-text-muted">Est FPS:</span> <strong className="text-accent-emerald">{selected3D.fpsEstimate} FPS</strong></div>
              <div><span className="text-text-muted">Canvases:</span> <strong className="text-text-primary">{selected3D.canvasCount}</strong></div>
            </div>

            {/* 3D Models Map */}
            {selected3D.models.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5"><Box className="w-4 h-4 text-accent-purple" /> Extracted 3D Models</h4>
                <div className="space-y-2">
                  {selected3D.models.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded bg-background-subtle border border-border text-xs font-mono">
                      <div>
                        <span className="font-semibold text-text-primary">{m.name}</span>
                        <span className="text-text-muted text-[10px] block">{m.format}</span>
                      </div>
                      <span className="text-accent-emerald font-semibold">{(m.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shader Snippets */}
            {selected3D.shaderSnippets.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-primary">GLSL Shader Snippets</h4>
                <CodeViewer files={selected3D.shaderSnippets.map((s) => ({ filename: s.name, language: 'glsl', code: s.code }))} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
