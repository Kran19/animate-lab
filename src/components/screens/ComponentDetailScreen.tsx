import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Breadcrumb } from '../ui/Breadcrumb';
import { CodeViewer } from '../ui/CodeViewer';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { SandboxedPreview } from '../workbench/SandboxedPreview';
import { PropsInspector } from '../workbench/PropsInspector';
import { ExportModal } from '../workbench/ExportModal';
import {
  Box,
  Globe,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Download,
  Code2,
  ArrowLeft,
  Sliders,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export const ComponentDetailScreen: React.FC = () => {
  const { route, navigate, components, animations, assets, technologies, websites, pages, sections } = useApp();
  const [activeTab, setActiveTab] = useState('preview');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const comp = components.find((c) => c.id === route.componentId) || components[0];

  // Workbench local props state (separate from persisted backend records)
  const defaultPropsDoc = [
    { name: 'title', type: 'string', description: 'Component headline text', defaultValue: comp?.title || 'Hero Banner' },
    { name: 'description', type: 'string', description: 'Body text content', defaultValue: comp?.description || 'Interactive Component' },
    { name: 'isActive', type: 'boolean', description: 'Active state toggle', defaultValue: true },
  ];

  const [propValues, setPropValues] = useState<Record<string, any>>({
    title: comp?.title || 'Headline Title',
    description: comp?.description || 'Interactive component extracted by AnimateLab',
    isActive: true,
  });

  if (!comp) {
    return <StateHandler state="error" title="Component Candidate Not Found" errorMessage="The requested component ID does not exist." />;
  }

  const site = websites.find((w) => w.id === comp.provenance.sourceWebsiteId);
  const page = pages.find((p) => p.id === comp.provenance.sourcePageId);
  const sec = sections.find((s) => s.id === comp.provenance.sourceSectionId);

  const compAnims = animations.filter((a) => comp.animationIds.includes(a.id));
  const compAssets = assets.filter((a) => comp.assetIds.includes(a.id));
  const compTechs = technologies.filter((t) => comp.technologyIds.includes(t.id));

  const codeFiles = [
    { filename: 'Component.tsx (Generated React)', language: 'typescript', code: comp.sourceCode.generatedReactTsx || '// React TSX\nexport function Component(props: any) {\n  return <div className="p-4">{props.title}</div>;\n}' },
    { filename: 'Component.module.css', language: 'css', code: comp.sourceCode.normalizedCss || comp.sourceCode.originalCss || '/* Scoped CSS */\n.component { position: relative; }' },
    { filename: 'manifest.json', language: 'json', code: JSON.stringify({ name: comp.title, category: comp.category, version: '1.0.0', dependencies: comp.dependencies }, null, 2) },
    { filename: 'original.html', language: 'html', code: comp.sourceCode.originalHtml || '<!-- Original DOM snippet -->\n<div class="extracted-element"></div>' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { id: 'websites', label: 'Websites', type: 'website', onClick: () => navigate('websites') },
            { id: site?.id || 'site', label: site?.name || comp.provenance.sourceWebsiteName, type: 'website', onClick: () => site && navigate('website_detail', { websiteId: site.id }) },
            { id: page?.id || 'page', label: page?.title || comp.provenance.sourcePagePath, type: 'page', onClick: () => page && navigate('page_detail', { pageId: page.id, websiteId: site?.id }) },
            { id: comp.id, label: comp.title, type: 'component' },
          ]}
        />

        <Button variant="outline" size="sm" onClick={() => navigate('components')} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Components
        </Button>
      </div>

      {/* Header Info Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-text-primary">{comp.title}</h1>
              <StatusBadge status={comp.status} />
              <span className="px-2.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-xs font-mono font-semibold uppercase">
                {comp.category}
              </span>
              <span className="inline-flex items-center text-[10px] font-mono text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Validated Phase 9
              </span>
            </div>
            <p className="text-xs text-text-muted">{comp.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Component Package
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'preview', label: 'Interactive Workbench', icon: <Box className="w-4 h-4" /> },
          { id: 'source', label: 'Source Code & Manifest', icon: <Code2 className="w-4 h-4" /> },
          { id: 'evidence', label: 'Evidence & Provenance', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'animations', label: 'Animations', count: compAnims.length, icon: <Sparkles className="w-4 h-4" /> },
          { id: 'assets', label: 'Assets', count: compAssets.length, icon: <ImageIcon className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Interactive Workbench (Sandbox + Props Inspector) */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column Sandboxed Preview Area */}
          <div className="lg:col-span-2 space-y-6">
            <SandboxedPreview
              componentId={comp.id}
              componentTitle={comp.title}
              reactCode={comp.sourceCode.generatedReactTsx}
              cssCode={comp.sourceCode.normalizedCss || comp.sourceCode.originalCss}
              props={propValues}
            />

            {/* Quick Provenance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 space-y-1 bg-background-card">
                <h4 className="text-[10px] font-semibold text-text-muted uppercase font-mono">Source Origin</h4>
                <p className="text-xs text-text-primary font-medium truncate">{comp.provenance.sourceWebsiteName}</p>
                <p className="text-[11px] font-mono text-accent-light truncate">{comp.provenance.sourcePagePath}</p>
              </Card>

              <Card className="p-4 space-y-1 bg-background-card">
                <h4 className="text-[10px] font-semibold text-text-muted uppercase font-mono">Confidence Score</h4>
                <div className="text-xl font-extrabold text-accent-emerald font-mono">
                  {(comp.evidence.confidenceScore * 100).toFixed(0)}%
                </div>
                <p className="text-[10px] text-text-muted">High structural & visual match</p>
              </Card>

              <Card className="p-4 space-y-1 bg-background-card">
                <h4 className="text-[10px] font-semibold text-text-muted uppercase font-mono">Dependencies</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {comp.dependencies.length > 0 ? (
                    comp.dependencies.map((dep, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-background-subtle border border-border text-[10px] font-mono text-text-secondary">
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-text-muted">Zero external dependencies</span>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* 1-Column Props Inspector */}
          <div className="space-y-6">
            <PropsInspector
              propsDocumentation={defaultPropsDoc}
              values={propValues}
              onChange={setPropValues}
            />

            {/* Detected Technologies in this Component */}
            {compTechs.length > 0 && (
              <Card className="p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-text-muted uppercase">
                  <Cpu className="w-3.5 h-3.5 text-accent" />
                  <span>Detected Technologies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {compTechs.map((tech) => (
                    <span key={tech.id} className="px-2 py-1 rounded-md bg-accent-purple/10 border border-accent-purple/20 text-xs font-mono text-accent-purple font-medium">
                      {tech.name} {tech.version && `v${tech.version}`}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Source Code & Manifest */}
      {activeTab === 'source' && <CodeViewer files={codeFiles} />}

      {/* Tab 3: Evidence & Provenance */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Component Evidence Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-background-subtle rounded-lg border border-border space-y-1">
                <span className="text-text-muted block text-[10px] uppercase">DOM Structure Score</span>
                <strong className="text-accent-light text-lg">{(comp.evidence.domStructureScore * 100).toFixed(0)}%</strong>
              </div>

              <div className="p-3.5 bg-background-subtle rounded-lg border border-border space-y-1">
                <span className="text-text-muted block text-[10px] uppercase">Interactive Behaviors</span>
                <ul className="list-disc pl-4 space-y-0.5 text-text-primary">
                  {comp.evidence.interactiveBehaviors.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Full Traceability Lineage</h3>
            <div className="p-4 rounded-lg bg-background-subtle border border-border font-mono text-xs space-y-2">
              <div className="flex items-center space-x-2 text-text-muted">
                <Globe className="w-3.5 h-3.5" />
                <span>Website: <strong className="text-text-primary">{comp.provenance.sourceWebsiteName}</strong> ({comp.provenance.sourceWebsiteId})</span>
              </div>
              <div className="flex items-center space-x-2 text-text-muted pl-4 border-l border-border">
                <Layers className="w-3.5 h-3.5" />
                <span>Page: <strong className="text-text-primary">{comp.provenance.sourcePagePath}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-text-muted pl-8 border-l border-border">
                <Box className="w-3.5 h-3.5" />
                <span>Candidate: <strong className="text-accent-light">{comp.title}</strong></span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Animations */}
      {activeTab === 'animations' && (
        <div className="space-y-4">
          {compAnims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compAnims.map((anim) => (
                <Card key={anim.id} className="p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-text-primary">{anim.name}</strong>
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px]">{anim.type}</span>
                  </div>
                  <p className="text-[11px] text-text-muted">Library: {anim.library} | Trigger: {anim.trigger}</p>
                  <p className="text-[11px] text-text-muted">Duration: {anim.durationMs}ms | Easing: {anim.easing}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-text-muted text-xs">
              No standalone animation records linked directly to this component candidate.
            </Card>
          )}
        </div>
      )}

      {/* Tab 5: Assets */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {compAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {compAssets.map((asset) => (
                <Card key={asset.id} className="p-3 space-y-2 text-xs font-mono">
                  <div className="h-28 bg-background-subtle rounded-md overflow-hidden flex items-center justify-center border border-border">
                    {asset.type === 'image' && asset.localPath ? (
                      <img src={asset.localPath} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-muted opacity-40" />
                    )}
                  </div>
                  <p className="font-semibold text-text-primary truncate">{asset.name}</p>
                  <p className="text-[10px] text-text-muted">{(asset.sizeBytes / 1024).toFixed(1)} KB • {asset.format}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-text-muted text-xs">
              No dedicated local media assets linked to this component candidate.
            </Card>
          )}
        </div>
      )}

      {/* Export Package Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        candidateId={comp.id}
        componentTitle={comp.title}
        reactCode={comp.sourceCode.generatedReactTsx}
        cssCode={comp.sourceCode.normalizedCss || comp.sourceCode.originalCss}
        manifestJson={JSON.stringify({ name: comp.title, category: comp.category, version: '1.0.0', dependencies: comp.dependencies }, null, 2)}
      />
    </div>
  );
};
