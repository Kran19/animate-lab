import React from 'react';
import { useApp } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import {
  Globe,
  FileText,
  Layers,
  Box,
  Sparkles,
  Wrench,
  Image as ImageIcon,
  Activity,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    websites,
    pages,
    sections,
    components,
    animations,
    threeD,
    assets,
    jobs,
    loading,
    navigate,
    setCaptureWizardOpen,
  } = useApp();

  if (loading) {
    return <StateHandler state="loading" title="Loading Lab Dashboard..." />;
  }

  const recentWebsites = websites.slice(0, 3);
  const recentComponents = components.slice(0, 4);
  const activeJob = jobs.find((j) => j.status === 'running');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-background-card via-background-subtle to-background-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-accent/15 text-accent-light border border-accent/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
              Desktop Workspace
            </span>
            <span className="text-xs text-text-muted font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" /> Local-First Storage
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Web Experience Lab Overview</h2>
          <p className="text-xs text-text-muted">
            Cataloged website captures, runtime animation triggers, 3D WebGL scenes, and reusable component candidates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setCaptureWizardOpen(true)}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            New Capture Project
          </Button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card hoverable onClick={() => navigate('websites')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Websites</span>
            <Globe className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{websites.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">Captured projects</span>
        </Card>

        <Card hoverable onClick={() => navigate('pages')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Pages</span>
            <FileText className="w-4 h-4 text-accent-light" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{pages.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">Crawled URLs</span>
        </Card>

        <Card hoverable onClick={() => navigate('sections')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Sections</span>
            <Layers className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{sections.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">DOM Regions</span>
        </Card>

        <Card hoverable onClick={() => navigate('components')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Components</span>
            <Box className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{components.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">Candidates</span>
        </Card>

        <Card hoverable onClick={() => navigate('animations')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Animations</span>
            <Sparkles className="w-4 h-4 text-accent-rose" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{animations.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">GSAP & CSS</span>
        </Card>

        <Card hoverable onClick={() => navigate('threed')} className="bg-background-card/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">3D & WebGL</span>
            <Wrench className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-primary font-mono">{threeD.length}</div>
          <span className="text-[10px] text-text-muted mt-1 inline-block">Canvas scenes</span>
        </Card>
      </div>

      {/* Active Capture Job Alert */}
      {activeJob && (
        <Card className="bg-accent/10 border-accent/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-accent animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  Active Capture Job: {activeJob.websiteName}
                  <StatusBadge status={activeJob.status} />
                </h4>
                <p className="text-xs text-text-muted font-mono mt-0.5">{activeJob.currentAction}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('jobs', { jobId: activeJob.id })}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Job Telemetry
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Websites & Components Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Websites */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent-cyan" /> Recent Website Captures
            </h3>
            <button onClick={() => navigate('websites')} className="text-xs text-accent-light hover:underline flex items-center gap-1">
              View All ({websites.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentWebsites.map((site) => (
              <Card
                key={site.id}
                hoverable
                onClick={() => navigate('website_detail', { websiteId: site.id })}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={site.previewScreenshot} alt={site.name} className="w-14 h-10 object-cover rounded-lg border border-border shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary truncate">{site.name}</h4>
                    <p className="text-xs text-text-muted font-mono truncate">{site.url}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <StatusBadge status={site.status} />
                  <div className="text-right text-xs font-mono text-text-muted">
                    <div>{site.totalComponents} comps</div>
                    <div className="text-[10px] text-text-muted/70">{site.totalPages} pages</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Component Candidates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Box className="w-4 h-4 text-accent-purple" /> Recent Component Candidates
            </h3>
            <button onClick={() => navigate('components')} className="text-xs text-accent-light hover:underline flex items-center gap-1">
              View All ({components.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentComponents.map((comp) => (
              <Card
                key={comp.id}
                hoverable
                onClick={() => navigate('component_detail', { componentId: comp.id })}
                className="flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{comp.category}</Badge>
                    <StatusBadge status={comp.status} />
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary truncate">{comp.title}</h4>
                  <p className="text-[11px] text-text-muted line-clamp-2">{comp.description}</p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>{comp.provenance.sourceWebsiteName}</span>
                  <span className="text-accent-light">Conf: {(comp.evidence.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
