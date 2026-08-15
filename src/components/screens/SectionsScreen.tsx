import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { StateHandler } from '../ui/StateHandler';
import { Breadcrumb } from '../ui/Breadcrumb';
import { Layers, Globe, FileText, ArrowRight, Box } from 'lucide-react';

export const SectionsScreen: React.FC = () => {
  const { sections, loading, navigate } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredSections = sections.filter((sec) => {
    const matchesSearch = sec.title.toLowerCase().includes(search.toLowerCase()) || sec.domSelector.toLowerCase().includes(search.toLowerCase()) || sec.websiteName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || sec.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) return <StateHandler state="loading" title="Loading Sections Library..." />;

  const categories = Array.from(new Set(sections.map((s) => s.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent-amber" /> Section Library
        </h2>
        <p className="text-xs text-text-muted">Detected visual & interactive DOM regions prior to component candidate extraction.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter sections by title, DOM selector, or site..." />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="all">All Section Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredSections.length === 0 ? (
        <StateHandler state="no_results" title="No sections found" description="Try clearing your search term or category filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSections.map((sec) => (
            <Card
              key={sec.id}
              hoverable
              onClick={() => {
                if (sec.isComponentCandidate && sec.componentCandidateId) {
                  navigate('component_detail', { componentId: sec.componentCandidateId });
                } else {
                  navigate('page_detail', { pageId: sec.pageId, websiteId: sec.websiteId });
                }
              }}
              className="flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">{sec.category}</Badge>
                  <span className="text-[10px] font-mono text-text-muted">{sec.bounds.width}x{sec.bounds.height}px</span>
                </div>
                <h3 className="text-sm font-bold text-text-primary">{sec.title}</h3>
                <span className="text-xs font-mono text-accent-light block truncate">{sec.domSelector}</span>
                <p className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                  <Globe className="w-3 h-3 text-accent-cyan" /> {sec.websiteName} ({sec.pagePath})
                </p>
              </div>

              {sec.isComponentCandidate && (
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-accent-purple font-semibold">
                  <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5" /> Component Candidate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
