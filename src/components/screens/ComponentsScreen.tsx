import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { StateHandler } from '../ui/StateHandler';
import { Box, Globe, ExternalLink, Sparkles, Code2, ArrowRight } from 'lucide-react';

export const ComponentsScreen: React.FC = () => {
  const { components, loading, navigate } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredComponents = components.filter((comp) => {
    const matchesSearch = comp.title.toLowerCase().includes(search.toLowerCase()) ||
      comp.description.toLowerCase().includes(search.toLowerCase()) ||
      comp.provenance.sourceWebsiteName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || comp.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  if (loading) return <StateHandler state="loading" title="Loading Component Library..." />;

  const categories = Array.from(new Set(components.map((c) => c.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Box className="w-5 h-5 text-accent-purple" /> Component Library
        </h2>
        <p className="text-xs text-text-muted">Analyzed component candidates isolated from captured visual sections.</p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search component candidates by name, category, or website..." />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="candidate">Candidate</option>
            <option value="verified">Verified</option>
            <option value="exported">Exported</option>
          </select>
        </div>
      </div>

      {/* Components Grid */}
      {filteredComponents.length === 0 ? (
        <StateHandler state="no_results" title="No matching component candidates" description="Try adjusting your category or search criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((comp) => (
            <Card
              key={comp.id}
              hoverable
              onClick={() => navigate('component_detail', { componentId: comp.id })}
              className="flex flex-col justify-between space-y-4 overflow-hidden"
            >
              <div className="space-y-3">
                {/* Thumbnail Preview Tile */}
                <div className="relative h-44 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-background-card via-background-subtle to-background-muted flex items-center justify-center group">
                  <img
                    src={comp.previewUrl}
                    alt={comp.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Visual Fallback Graphic */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none -z-0">
                    <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-2 shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                      {comp.category === 'Hero' ? <Sparkles className="w-6 h-6" /> :
                       comp.category === '3D' ? <Box className="w-6 h-6" /> :
                       <Code2 className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-mono font-medium text-text-muted">{comp.title}</span>
                  </div>

                  <div className="absolute top-2 right-2 z-10">
                    <StatusBadge status={comp.status} />
                  </div>
                  <div className="absolute bottom-2 left-2 z-10">
                    <Badge variant="purple" size="sm">{comp.category}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-text-primary">{comp.title}</h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{comp.description}</p>
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <span className="truncate flex items-center gap-1 text-[11px]">
                  <Globe className="w-3 h-3 text-accent-cyan" /> {comp.provenance.sourceWebsiteName}
                </span>
                <span className="text-accent-light shrink-0 font-semibold text-[11px]">
                  Conf: {(comp.evidence.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
