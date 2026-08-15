import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { StateHandler } from '../ui/StateHandler';
import { Image as ImageIcon, Box, FileCode, HardDrive, Globe, Download } from 'lucide-react';
import { AssetType } from '../../domain/types';

export const AssetsScreen: React.FC = () => {
  const { assets, loading } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(search.toLowerCase()) ||
      asset.mimeType.toLowerCase().includes(search.toLowerCase()) ||
      asset.websiteName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <StateHandler state="loading" title="Loading Asset Browser..." />;

  const assetTypes = Array.from(new Set(assets.map((a) => a.type)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent-cyan" /> Asset Browser
        </h2>
        <p className="text-xs text-text-muted">Downloaded website media resources: images, SVGs, 3D models, textures, HDRs, and fonts.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background-card p-3 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter assets by title, MIME type, or website..." />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="all">All Asset Types</option>
          {assetTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filteredAssets.length === 0 ? (
        <StateHandler state="no_results" title="No assets found" description="Try clearing your search term or asset type filter." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="flex flex-col justify-between p-3 space-y-3">
              <div className="space-y-2">
                <div className="relative h-32 rounded-lg overflow-hidden border border-border bg-background-muted flex items-center justify-center">
                  <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="accent" size="sm">{asset.type}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-primary truncate">{asset.title}</h4>
                  <p className="text-[10px] font-mono text-text-muted truncate">{asset.mimeType}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>{asset.dimensions || 'Binary'}</span>
                <span className="text-accent-emerald">{(asset.fileSizeBytes / 1024).toFixed(0)} KB</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
