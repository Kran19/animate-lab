import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { FileText, ExternalLink, Globe, Layers, Box, Sparkles } from 'lucide-react';

export const PagesScreen: React.FC = () => {
  const { pages, loading, navigate } = useApp();
  const [search, setSearch] = useState('');

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.path.toLowerCase().includes(search.toLowerCase()) ||
    p.websiteName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <StateHandler state="loading" title="Loading Pages Library..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent-light" /> Page Library
        </h2>
        <p className="text-xs text-text-muted">All discovered and analyzed pages across captured website projects.</p>
      </div>

      <div className="bg-background-card p-3 rounded-xl border border-border">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages by title, path, or website name..." />
      </div>

      {filteredPages.length === 0 ? (
        <StateHandler state="no_results" title="No pages found" description="Try refining your search term." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              hoverable
              onClick={() => navigate('page_detail', { pageId: page.id, websiteId: page.websiteId })}
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-36 rounded-lg overflow-hidden border border-border bg-background-muted">
                  <img src={page.screenshot} alt={page.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={page.status} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-accent-cyan flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3" /> {page.websiteName}
                  </span>
                  <h3 className="text-sm font-bold text-text-primary truncate">{page.title}</h3>
                  <span className="text-xs font-mono text-text-muted">{page.path}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>{page.sectionCount} sections</span>
                <span>{page.componentCount} comps</span>
                <span>{page.animationCount} anims</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
