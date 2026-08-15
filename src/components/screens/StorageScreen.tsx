import React from 'react';
import { useApp } from '../../store/appStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StateHandler } from '../ui/StateHandler';
import { HardDrive, Folder, Trash2, ExternalLink, ShieldCheck, Database } from 'lucide-react';

export const StorageScreen: React.FC = () => {
  const { storageStats, loading } = useApp();

  if (loading || !storageStats) return <StateHandler state="loading" title="Inspecting Local Storage..." />;

  const totalMB = (storageStats.totalBytes / (1024 * 1024)).toFixed(1);
  const webMB = (storageStats.breakdown.websitesBytes / (1024 * 1024)).toFixed(1);
  const compMB = (storageStats.breakdown.componentsBytes / (1024 * 1024)).toFixed(1);
  const assetMB = (storageStats.breakdown.assetsBytes / (1024 * 1024)).toFixed(1);
  const dbMB = (storageStats.breakdown.databaseBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-accent-emerald" /> Local Storage & Disk Browser
        </h2>
        <p className="text-xs text-text-muted">All downloaded resources, screenshots, SQLite database, and component metadata remain stored on your PC.</p>
      </div>

      {/* Main Storage Overview Header */}
      <Card className="p-6 bg-background-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-muted">Current Root Storage Location</span>
            <div className="flex items-center space-x-2 text-base font-bold font-mono text-text-primary">
              <Folder className="w-4 h-4 text-accent" />
              <span>{storageStats.storagePath}</span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-text-muted block">Total Disk Space Used</span>
            <strong className="text-2xl font-extrabold text-accent-emerald">{totalMB} MB</strong>
          </div>
        </div>
      </Card>

      {/* Storage Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-muted">
            <span>Websites Archive</span>
            <Folder className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-xl font-extrabold text-text-primary font-mono">{webMB} MB</div>
          <span className="text-[10px] text-text-muted font-mono">{storageStats.websitesCount} sites</span>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-muted">
            <span>Component Store</span>
            <Folder className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="text-xl font-extrabold text-text-primary font-mono">{compMB} MB</div>
          <span className="text-[10px] text-text-muted font-mono">{storageStats.componentsCount} components</span>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-muted">
            <span>Assets & 3D Media</span>
            <Folder className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-xl font-extrabold text-text-primary font-mono">{assetMB} MB</div>
          <span className="text-[10px] text-text-muted font-mono">{storageStats.assetsCount} files</span>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-muted">
            <span>SQLite Database</span>
            <Database className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="text-xl font-extrabold text-text-primary font-mono">{dbMB} MB</div>
          <span className="text-[10px] text-text-muted font-mono">app.db (Prisma)</span>
        </Card>
      </div>

      {/* Actions */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Storage Maintenance</h3>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />}>
            Prune Temporary Cache
          </Button>
        </div>
      </Card>
    </div>
  );
};
