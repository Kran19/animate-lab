import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Settings as SettingsIcon, ShieldCheck, HardDrive, Cpu, Save, Lock } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const [storageDir, setStorageDir] = useState('D:\\WebExperienceLab');
  const [concurrency, setConcurrency] = useState(3);
  const [rateLimit, setRateLimit] = useState(500);
  const [respectRobots, setRespectRobots] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-text-muted" /> Application Settings
        </h2>
        <p className="text-xs text-text-muted">Configure local desktop engine settings, Playwright browser concurrency, and legal parameters.</p>
      </div>

      <Card className="space-y-6">
        {/* Storage Root */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-accent-emerald" /> Local Storage Root Directory
          </label>
          <Input value={storageDir} onChange={(e) => setStorageDir(e.target.value)} />
          <p className="text-xs text-text-muted">All downloaded site resources, components, and SQLite database will reside in this directory.</p>
        </div>

        {/* Browser Engine Concurrency */}
        <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Max Browser Concurrency</label>
            <Input type="number" value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} min={1} max={8} />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Default Rate Limit Delay (ms)</label>
            <Input type="number" value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value))} min={100} max={5000} />
          </div>
        </div>

        {/* Legal & Compliance Policy */}
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-accent-cyan" /> Legal & Security Compliance
          </h4>

          <label className="flex items-center space-x-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" checked={respectRobots} onChange={(e) => setRespectRobots(e.target.checked)} className="rounded text-accent" />
            <span>Respect robots.txt and website access control policies</span>
          </label>

          <p className="text-xs text-text-muted bg-background-subtle p-3 rounded-lg border border-border">
            AnimateLab is a developer reference & research tool. It does not bypass authentication, paywalls, DRM, or security access controls.
          </p>
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
            {saved ? 'Settings Saved!' : 'Save Configurations'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
