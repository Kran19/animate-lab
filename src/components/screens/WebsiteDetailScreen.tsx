import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Breadcrumb } from '../ui/Breadcrumb';
import { Tabs } from '../ui/Tabs';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Button } from '../ui/Button';
import { Globe, FileText, Layers, Box, Sparkles, Cpu, HardDrive, ExternalLink, Activity, ArrowLeft } from 'lucide-react';

export const WebsiteDetailScreen: React.FC = () => {
  const { route, navigate, websites, pages, sections, components, animations, threeD, technologies, jobs } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const site = websites.find((w) => w.id === route.websiteId) || websites[0];

  if (!site) return <StateHandler state="error" title="Website Not Found" errorMessage="The requested website ID does not exist in local storage." />;

  const sitePages = pages.filter((p) => p.websiteId === site.id);
  const siteSections = sections.filter((s) => s.websiteId === site.id);
  const siteComponents = components.filter((c) => c.provenance.sourceWebsiteId === site.id);
  const siteAnimations = animations.filter((a) => a.websiteId === site.id);
  const siteThreeD = threeD.filter((t) => t.websiteId === site.id);
  const siteJobs = jobs.filter((j) => j.websiteId === site.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Relational Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { id: 'home', label: 'Websites', type: 'website', onClick: () => navigate('websites') },
            { id: site.id, label: site.name, type: 'website' },
          ]}
        />

        <Button variant="outline" size="sm" onClick={() => navigate('websites')} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Library
        </Button>
      </div>

      {/* Website Header Banner */}
      <Card className="bg-background-card p-6 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <img src={site.previewScreenshot} alt={site.name} className="w-24 h-16 object-cover rounded-lg border border-border shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-text-primary">{site.name}</h1>
                <StatusBadge status={site.status} />
              </div>
              <a href={site.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-accent-light hover:underline flex items-center gap-1">
                {site.url} <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-text-muted">{site.description}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 text-xs font-mono border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Pages</span>
              <strong className="text-text-primary text-base">{sitePages.length}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Components</span>
              <strong className="text-accent-purple text-base">{siteComponents.length}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Animations</span>
              <strong className="text-accent-rose text-base">{siteAnimations.length}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Storage</span>
              <strong className="text-accent-emerald text-base">{(site.totalStorageBytes / (1024 * 1024)).toFixed(1)} MB</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Workspace Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
          { id: 'pages', label: 'Pages', count: sitePages.length, icon: <FileText className="w-4 h-4" /> },
          { id: 'sections', label: 'Sections', count: siteSections.length, icon: <Layers className="w-4 h-4" /> },
          { id: 'components', label: 'Component Candidates', count: siteComponents.length, icon: <Box className="w-4 h-4" /> },
          { id: 'animations', label: 'Animations', count: siteAnimations.length, icon: <Sparkles className="w-4 h-4" /> },
          { id: 'jobs', label: 'Crawl History', count: siteJobs.length, icon: <Activity className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Capture Configuration & Provenance</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-background-subtle p-4 rounded-lg border border-border">
              <div><span className="text-text-muted">Crawl Mode:</span> <strong className="text-text-primary uppercase">{site.captureSettings.crawlMode}</strong></div>
              <div><span className="text-text-muted">Max Pages Limit:</span> <strong className="text-text-primary">{site.captureSettings.maxPages}</strong></div>
              <div><span className="text-text-muted">Rate Limit Delay:</span> <strong className="text-text-primary">{site.captureSettings.rateLimitMs} ms</strong></div>
              <div><span className="text-text-muted">Storage Path:</span> <strong className="text-text-primary text-[11px] truncate block">{site.storagePath}</strong></div>
            </div>

            <h3 className="text-sm font-semibold text-text-primary pt-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {site.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-1 rounded bg-background-muted text-xs text-text-secondary border border-border">
                  #{t}
                </span>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Detected Tech Stack</h3>
            <div className="space-y-2">
              {technologies.slice(0, 5).map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-2 rounded bg-background-subtle text-xs">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                    <span className="font-medium text-text-primary">{tech.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent-emerald">Confidence: 98%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Pages */}
      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitePages.map((page) => (
            <Card
              key={page.id}
              hoverable
              onClick={() => navigate('page_detail', { pageId: page.id, websiteId: site.id })}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={page.status} />
                <span className="text-[11px] font-mono text-text-muted">HTTP {page.httpStatusCode}</span>
              </div>
              <h4 className="text-sm font-bold text-text-primary truncate">{page.title}</h4>
              <p className="text-xs font-mono text-accent-light">{page.path}</p>
              <div className="pt-2 border-t border-border/50 flex justify-between text-[11px] font-mono text-text-muted">
                <span>{page.sectionCount} sections</span>
                <span>{page.componentCount} comps</span>
                <span>{page.animationCount} anims</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Component Candidates */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {siteComponents.map((comp) => (
            <Card
              key={comp.id}
              hoverable
              onClick={() => navigate('component_detail', { componentId: comp.id })}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-accent-purple/15 text-accent-purple text-[10px] font-mono font-semibold uppercase">{comp.category}</span>
                <StatusBadge status={comp.status} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">{comp.title}</h4>
              <p className="text-xs text-text-muted line-clamp-2">{comp.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
