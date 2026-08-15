import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { services } from '../../bridge/appBridge';
import { CrawlMode, CaptureSettings } from '../../domain/types';
import { Globe, Layers, Sparkles, Box, Check, ArrowRight, ArrowLeft, Play, AlertCircle } from 'lucide-react';

export const CaptureWizardModal: React.FC = () => {
  const { isCaptureWizardOpen, setCaptureWizardOpen, refreshData, navigate } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [crawlMode, setCrawlMode] = useState<CrawlMode>('same_domain');
  const [maxPages, setMaxPages] = useState(10);
  const [maxDepth, setMaxDepth] = useState(2);
  const [rateLimitMs, setRateLimitMs] = useState(500);

  // Feature Toggles
  const [captureImages, setCaptureImages] = useState(true);
  const [captureMedia, setCaptureMedia] = useState(true);
  const [captureFonts, setCaptureFonts] = useState(true);
  const [captureShaders, setCaptureShaders] = useState(true);
  const [capture3DAssets, setCapture3DAssets] = useState(true);
  const [detectAnimations, setDetectAnimations] = useState(true);
  const [detectSections, setDetectSections] = useState(true);
  const [extractComponents, setExtractComponents] = useState(true);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStep(1);
    setUrl('');
    setName('');
    setTagsInput('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    setCaptureWizardOpen(false);
  };

  const handleStartCapture = async () => {
    if (!url) return;
    setIsSubmitting(true);

    const settings: CaptureSettings = {
      crawlMode,
      maxPages: Number(maxPages),
      maxDepth: Number(maxDepth),
      captureImages,
      captureMedia,
      captureFonts,
      captureShaders,
      capture3DAssets,
      detectAnimations,
      detectSections,
      extractComponents,
      respectRobotsTxt,
      rateLimitMs: Number(rateLimitMs),
    };

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const newWebsite = await services.websites.create(url, name, settings, tags);
      await refreshData();
      handleClose();
      // Navigate to website detail or jobs screen
      navigate('website_detail', { websiteId: newWebsite.id });
    } catch (err) {
      console.error('Failed to create capture project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isCaptureWizardOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-accent" />
          <span>New Website Capture Project</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1 text-xs text-text-muted font-mono">
            <span>Step {step} of 3</span>
          </div>

          <div className="flex space-x-2">
            {step > 1 && (
              <Button variant="outline" size="sm" onClick={() => setStep((step - 1) as any)} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!url && step === 1}
                onClick={() => setStep((step + 1) as any)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartCapture}
                disabled={isSubmitting}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? 'Queueing Project...' : 'Start Capture Job'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Wizard Step 1: Target URL */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">1. Enter Website URL</h3>
            <p className="text-xs text-text-muted mt-0.5">Specify the live website URL you want to crawl and analyze.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Target Website URL *</label>
              <Input
                placeholder="https://example.com or https://studio.design"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Project Name (Optional)</label>
              <Input
                placeholder="e.g. Studio Design Portfolio"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Tags (Comma-separated)</label>
              <Input
                placeholder="GSAP, Three.js, Dark Mode, Portfolio"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Wizard Step 2: Crawl Settings */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">2. Crawl & Discovery Scope</h3>
            <p className="text-xs text-text-muted mt-0.5">Configure how deep the browser engine should crawl.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Crawl Mode"
              value={crawlMode}
              onChange={(e) => setCrawlMode(e.target.value as CrawlMode)}
              options={[
                { value: 'same_domain', label: 'Same Domain (Recommended)' },
                { value: 'single_page', label: 'Single Page Only' },
                { value: 'subpaths_only', label: 'Sub-paths Only' },
                { value: 'custom_depth', label: 'Custom Depth Limit' },
              ]}
            />

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Maximum Pages</label>
              <Input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Depth Limit</label>
              <Input
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                min={0}
                max={5}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Rate Limit Delay (ms)</label>
              <Input
                type="number"
                value={rateLimitMs}
                onChange={(e) => setRateLimitMs(Number(e.target.value))}
                min={100}
                max={3000}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={respectRobotsTxt}
                onChange={(e) => setRespectRobotsTxt(e.target.checked)}
                className="rounded border-border bg-background-subtle text-accent focus:ring-accent"
              />
              <span>Respect robots.txt and access policies</span>
            </label>
          </div>
        </div>
      )}

      {/* Wizard Step 3: Resource & Analysis Options */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">3. Resource Capture & Runtime Analysis</h3>
            <p className="text-xs text-text-muted mt-0.5">Select what assets and behavior detectors to enable.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={captureImages} onChange={(e) => setCaptureImages(e.target.checked)} className="rounded text-accent" />
              <span>Capture Images (PNG/WebP/JPG)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={capture3DAssets} onChange={(e) => setCapture3DAssets(e.target.checked)} className="rounded text-accent" />
              <span>Capture 3D Assets (GLTF/GLB/HDR)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={captureShaders} onChange={(e) => setCaptureShaders(e.target.checked)} className="rounded text-accent" />
              <span>Extract GLSL Shaders</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={detectAnimations} onChange={(e) => setDetectAnimations(e.target.checked)} className="rounded text-accent" />
              <span>Detect Animations & GSAP</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={detectSections} onChange={(e) => setDetectSections(e.target.checked)} className="rounded text-accent" />
              <span>Detect Visual Sections</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-border bg-background-subtle cursor-pointer hover:bg-background-hover">
              <input type="checkbox" checked={extractComponents} onChange={(e) => setExtractComponents(e.target.checked)} className="rounded text-accent" />
              <span>Classify Component Candidates</span>
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
};
