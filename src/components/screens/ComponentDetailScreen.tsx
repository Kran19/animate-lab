import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Breadcrumb } from '../ui/Breadcrumb';
import { PreviewFrame } from '../ui/PreviewFrame';
import { CodeViewer } from '../ui/CodeViewer';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { Box, Globe, ExternalLink, Sparkles, Cpu, Layers, Image as ImageIcon, ShieldCheck, Download, Code2, ArrowLeft } from 'lucide-react';

export const ComponentDetailScreen: React.FC = () => {
  const { route, navigate, components, animations, assets, technologies, websites, pages, sections } = useApp();
  const [activeTab, setActiveTab] = useState('preview');

  const comp = components.find((c) => c.id === route.componentId) || components[0];

  if (!comp) return <StateHandler state="error" title="Component Candidate Not Found" errorMessage="The requested component ID does not exist." />;

  const site = websites.find((w) => w.id === comp.provenance.sourceWebsiteId);
  const page = pages.find((p) => p.id === comp.provenance.sourcePageId);
  const sec = sections.find((s) => s.id === comp.provenance.sourceSectionId);

  const compAnims = animations.filter((a) => comp.animationIds.includes(a.id));
  const compAssets = assets.filter((a) => comp.assetIds.includes(a.id));
  const compTechs = technologies.filter((t) => comp.technologyIds.includes(t.id));

  const codeFiles = [
    { filename: 'Component.tsx (Generated React)', language: 'typescript', code: comp.sourceCode.generatedReactTsx || '// Component React TSX code not generated yet.' },
    { filename: 'original.html', language: 'html', code: comp.sourceCode.originalHtml || '<!-- Original DOM snippet -->\n<div class="extracted-element"></div>' },
    { filename: 'original.css', language: 'css', code: comp.sourceCode.originalCss || '/* Original CSS styles */\n.extracted-element { position: relative; }' },
    { filename: 'animation.js', language: 'javascript', code: comp.sourceCode.originalJs || '// Runtime animation triggers\ngsap.to(".extracted-element", { opacity: 1 });' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Relational Navigation Breadcrumb */}
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
          Back to Component Library
        </Button>
      </div>

      {/* Header Info Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-text-primary">{comp.title}</h1>
              <StatusBadge status={comp.status} />
              <span className="px-2.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-xs font-mono font-semibold uppercase">{comp.category}</span>
            </div>
            <p className="text-xs text-text-muted">{comp.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Export Component Code
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'preview', label: 'Live Preview', icon: <Box className="w-4 h-4" /> },
          { id: 'source', label: 'Source Code', icon: <Code2 className="w-4 h-4" /> },
          { id: 'evidence', label: 'Evidence & Provenance', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'animations', label: 'Animations', count: compAnims.length, icon: <Sparkles className="w-4 h-4" /> },
          { id: 'assets', label: 'Assets', count: compAssets.length, icon: <ImageIcon className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <PreviewFrame previewUrl={comp.previewUrl} title={`Component Preview: ${comp.title}`} originalUrl={comp.provenance.originalUrl} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase font-mono">Source Provenance</h4>
              <p className="text-xs text-text-primary font-medium">{comp.provenance.sourceWebsiteName}</p>
              <p className="text-xs font-mono text-accent-light">{comp.provenance.sourcePagePath}</p>
              <p className="text-[10px] text-text-muted font-mono">Captured: {comp.provenance.captureDate}</p>
            </Card>

            <Card className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase font-mono">Confidence Score</h4>
              <div className="text-2xl font-extrabold text-accent-emerald font-mono">
                {(comp.evidence.confidenceScore * 100).toFixed(0)}%
              </div>
              <p className="text-[11px] text-text-muted">High structural & animation match score</p>
            </Card>

            <Card className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase font-mono">Dependencies</h4>
              <div className="flex flex-wrap gap-1">
                {comp.dependencies.map((dep, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-background-subtle border border-border text-[11px] font-mono text-text-secondary">
                    {dep}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Source Code */}
      {activeTab === 'source' && <CodeViewer files={codeFiles} />}

      {/* Tab 3: Evidence & Provenance */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Component Evidence Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-background-subtle rounded-lg border border-border space-y-1">
                <span className="text-text-muted block text-[10px] uppercase">DOM Structure Score</span>
                <strong className="text-accent-light text-base">{(comp.evidence.domStructureScore * 100).toFixed(0)}%</strong>
              </div>

              <div className="p-3 bg-background-subtle rounded-lg border border-border space-y-1">
                <span className="text-text-muted block text-[10px] uppercase">Interactive Behaviors</span>
                <ul className="list-disc pl-4 space-y-0.5 text-text-primary">
                  {comp.evidence.interactiveBehaviors.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Licensing & Usage Notes</h3>
            <p className="text-xs text-text-muted">{comp.licensingNotes || comp.provenance.licensingNotes || 'Public research capture. Check original website licensing for usage rights.'}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
