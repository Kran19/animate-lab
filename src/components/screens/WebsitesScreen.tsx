import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, SearchInput } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Globe, PlusCircle, ExternalLink, Calendar, HardDrive, Filter } from 'lucide-react';

export const WebsitesScreen: React.FC = () => {
  const { websites, loading, navigate, setCaptureWizardOpen } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) || site.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <StateHandler state="loading" title="Loading Websites Library..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent-cyan" /> Website Library
          </h2>
          <p className="text-xs text-text-muted">Captured website projects, metadata, and crawling provenance archives.</p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCaptureWizardOpen(true)} icon={<PlusCircle className="w-4 h-4" />}>
          Add Website
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter websites by name or URL..." />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="all">All Crawl Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="partial">Partial</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredWebsites.length === 0 ? (
        <StateHandler
          state="no_results"
          title="No websites match your filter"
          description="Try clearing your search term or status filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map((site) => (
            <Card
              key={site.id}
              hoverable
              onClick={() => navigate('website_detail', { websiteId: site.id })}
              className="flex flex-col justify-between overflow-hidden space-y-4"
            >
              <div className="space-y-3">
                {/* Screenshot & Status Overlay */}
                <div className="relative h-40 rounded-lg overflow-hidden border border-border bg-background-muted">
                  <img src={site.previewScreenshot} alt={site.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={site.status} />
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-base font-bold text-text-primary truncate">{site.name}</h3>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-mono text-accent-light hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {site.url} <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-xs text-text-muted mt-2 line-clamp-2">{site.description}</p>
                </div>
              </div>

              {/* Counter Badges & Storage */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <div className="flex space-x-3">
                  <span><strong className="text-text-primary">{site.totalPages}</strong> pages</span>
                  <span><strong className="text-text-primary">{site.totalComponents}</strong> comps</span>
                  <span><strong className="text-text-primary">{site.totalAnimations}</strong> anims</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-text-muted/70">
                  <HardDrive className="w-3 h-3" />
                  <span>{(site.totalStorageBytes / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
