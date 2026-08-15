import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Breadcrumb } from '../ui/Breadcrumb';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { PreviewFrame } from '../ui/PreviewFrame';
import { Button } from '../ui/Button';
import { FileText, Layers, Sparkles, Box, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';

export const PageDetailScreen: React.FC = () => {
  const { route, navigate, pages, sections, components, animations, websites } = useApp();

  const page = pages.find((p) => p.id === route.pageId) || pages[0];
  const site = websites.find((w) => w.id === (page?.websiteId || route.websiteId));

  if (!page) return <StateHandler state="error" title="Page Not Found" errorMessage="The requested page record does not exist." />;

  const pageSections = sections.filter((s) => s.pageId === page.id);
  const pageComponents = components.filter((c) => c.provenance.sourcePageId === page.id);
  const pageAnimations = animations.filter((a) => a.pageId === page.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Relational Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { id: 'websites', label: 'Websites', type: 'website', onClick: () => navigate('websites') },
            { id: site?.id || 'site', label: site?.name || page.websiteName, type: 'website', onClick: () => site && navigate('website_detail', { websiteId: site.id }) },
            { id: page.id, label: page.title, type: 'page' },
          ]}
        />

        <Button variant="outline" size="sm" onClick={() => navigate('pages')} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Pages
        </Button>
      </div>

      {/* Page Header Info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-text-primary">{page.title}</h1>
              <StatusBadge status={page.status} />
            </div>
            <a href={page.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-accent-light hover:underline flex items-center gap-1">
              {page.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-background-subtle border border-border">HTTP {page.httpStatusCode}</span>
            <span className="px-2.5 py-1 rounded bg-background-subtle border border-border">{page.resourceCount} resources</span>
          </div>
        </div>
      </Card>

      {/* Live Preview Viewport */}
      <PreviewFrame previewUrl={page.screenshot} title={`Page Inspector: ${page.title}`} originalUrl={page.url} />

      {/* DOM Section Candidates Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-amber" /> Detected Visual DOM Sections ({pageSections.length})
        </h3>

        {pageSections.length === 0 ? (
          <p className="text-xs text-text-muted">No DOM sections classified for this page.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageSections.map((sec) => (
              <Card
                key={sec.id}
                hoverable
                onClick={() => navigate('sections', { sectionId: sec.id, pageId: page.id })}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-accent-amber/15 text-accent-amber text-[10px] font-mono font-semibold uppercase">{sec.category}</span>
                  <span className="text-[10px] font-mono text-text-muted">{sec.bounds.width}x{sec.bounds.height}px</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary">{sec.title}</h4>
                <p className="text-[11px] font-mono text-accent-light truncate">{sec.domSelector}</p>

                {sec.isComponentCandidate && sec.componentCandidateId && (
                  <div className="pt-2 border-t border-border/50 flex justify-between items-center text-[10px] font-mono text-accent-purple">
                    <span>Component Candidate Available</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
