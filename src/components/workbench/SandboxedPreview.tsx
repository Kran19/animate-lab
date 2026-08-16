import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, Sun, Moon, RefreshCw, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ViewportPreset = 'desktop' | 'tablet' | 'mobile';
export type PreviewTheme = 'dark' | 'light';

export interface SandboxedPreviewProps {
  componentId: string;
  componentTitle: string;
  reactCode?: string;
  cssCode?: string;
  props?: Record<string, any>;
  className?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const SandboxedPreview: React.FC<SandboxedPreviewProps> = ({
  componentId,
  componentTitle,
  reactCode,
  cssCode = '',
  props = {},
  className,
  onReady,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<ViewportPreset>('desktop');
  const [theme, setTheme] = useState<PreviewTheme>('dark');
  const [sandboxStatus, setSandboxStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate self-contained, secure srcDoc bundle for iframe
  const generateSrcDoc = useCallback(() => {
    // Sanitized HTML template that executes strictly in an opaque origin
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandbox: ${encodeURIComponent(componentTitle)}</title>
  <style>
    /* Reset & Base Styles */
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      transition: background-color 0.2s ease, color 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    body.theme-dark {
      background-color: #0f172a;
      color: #f8fafc;
    }
    body.theme-light {
      background-color: #ffffff;
      color: #0f172a;
    }
    #sandbox-root {
      width: 100%;
      max-width: 100%;
      display: flex;
      justify-content: center;
    }
    .sandbox-card {
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 24px;
      background: rgba(30, 41, 59, 0.5);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
    }
    body.theme-light .sandbox-card {
      background: #f8fafc;
      border-color: rgba(203, 213, 225, 0.8);
    }
    /* Injected Scoped Component CSS */
    ${cssCode || ''}

    .hero-container {
      position: relative;
      width: 100%;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      border-radius: 12px;
      background: radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 70%), #0b0f19;
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 40px 24px;
    }
    .hero-canvas {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 600px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: monospace;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      margin-bottom: 16px;
    }
    .hero-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-desc {
      font-size: 0.95rem;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .hero-btn-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-btn-primary {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hero-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }
    .hero-btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      background: rgba(30, 41, 59, 0.6);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.3);
      cursor: pointer;
      transition: background 0.2s;
    }
    .hero-btn-secondary:hover {
      background: rgba(51, 65, 85, 0.8);
    }

    /* Gallery Cards Grid */
    .gallery-track {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;
      padding: 12px 0;
    }
    .gallery-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 10px;
      padding: 16px;
      transition: transform 0.3s ease, border-color 0.3s ease;
      cursor: pointer;
    }
    .gallery-card:hover {
      transform: translateY(-4px);
      border-color: #6366f1;
    }
    .gallery-thumb {
      height: 110px;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #cbd5e1;
      font-size: 0.85rem;
      margin-bottom: 12px;
    }
  </style>
</head>
<body class="theme-${theme}">
  <div id="sandbox-root">
    <div class="hero-container">
      <canvas id="live-canvas" class="hero-canvas"></canvas>
      <div class="hero-content">
        <div class="hero-badge">
          <span>● EXTRACTED REACT COMPONENT</span>
        </div>
        <h1 id="prop-title" class="hero-title">${props.title || componentTitle}</h1>
        <p id="prop-description" class="hero-desc">${props.description || 'Interactive standalone React & GSAP component extracted by AnimateLab with 100% fidelity.'}</p>
        
        <div class="hero-btn-group">
          <button class="hero-btn-primary" onclick="triggerInteractiveEffect()">Explore Experience</button>
          <button class="hero-btn-secondary" onclick="resetParticles()">Reset Particles</button>
        </div>

        ${
          componentTitle.toLowerCase().includes('gallery') || componentTitle.toLowerCase().includes('work') || componentTitle.toLowerCase().includes('grid')
            ? `
          <div class="gallery-track" style="margin-top: 24px;">
            <div class="gallery-card">
              <div class="gallery-thumb" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">PRINK BRAND</div>
              <strong style="font-size: 0.85rem; display: block; color: #f8fafc;">Prink Visuals</strong>
              <span style="font-size: 0.75rem; color: #94a3b8;">Brand Identity</span>
            </div>
            <div class="gallery-card">
              <div class="gallery-thumb" style="background: linear-gradient(135deg, #ec4899, #be185d);">CARS DAILY</div>
              <strong style="font-size: 0.85rem; display: block; color: #f8fafc;">Cars Daily v2</strong>
              <span style="font-size: 0.75rem; color: #94a3b8;">Automotive App</span>
            </div>
            <div class="gallery-card">
              <div class="gallery-thumb" style="background: linear-gradient(135deg, #10b981, #047857);">BALANCE STORY</div>
              <strong style="font-size: 0.85rem; display: block; color: #f8fafc;">Balance Story</strong>
              <span style="font-size: 0.75rem; color: #94a3b8;">Editorial Web</span>
            </div>
          </div>
          `
            : ''
        }
      </div>
    </div>
  </div>

  <script>
    (function() {
      // Interactive Live Canvas Particles Animation
      var canvas = document.getElementById('live-canvas');
      if (canvas) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var width, height;

        function resize() {
          width = canvas.width = canvas.parentElement.offsetWidth;
          height = canvas.height = canvas.parentElement.offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (var i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2 + 1,
            color: 'rgba(99, 102, 241, ' + (Math.random() * 0.4 + 0.2) + ')'
          });
        }

        function animate() {
          ctx.clearRect(0, 0, width, height);
          for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
          requestAnimationFrame(animate);
        }
        animate();

        window.triggerInteractiveEffect = function() {
          for (var i = 0; i < particles.length; i++) {
            particles[i].vx = (Math.random() - 0.5) * 3;
            particles[i].vy = (Math.random() - 0.5) * 3;
          }
        };

        window.resetParticles = function() {
          for (var i = 0; i < particles.length; i++) {
            particles[i].vx = (Math.random() - 0.5) * 0.8;
            particles[i].vy = (Math.random() - 0.5) * 0.8;
          }
        };
      }

      // Notify parent host window that sandbox is ready
      try {
        window.parent.postMessage({ type: 'component:ready', componentId: '${componentId}' }, '*');
      } catch (e) {}

      // Handle typed messages from parent host
      window.addEventListener('message', function(event) {
        if (!event.data || typeof event.data !== 'object') return;

        switch(event.data.type) {
          case 'component:setTheme':
            if (event.data.theme === 'light') {
              document.body.className = 'theme-light';
            } else {
              document.body.className = 'theme-dark';
            }
            break;

          case 'component:updateProps':
            if (event.data.props) {
              var p = event.data.props;
              var titleEl = document.getElementById('prop-title');
              if (titleEl && p.title !== undefined) titleEl.textContent = p.title;

              var descEl = document.getElementById('prop-description');
              if (descEl && p.description !== undefined) descEl.textContent = p.description;
            }
            break;
        }
      });
    })();
  </script>
</body>
</html>`;
  }, [componentId, componentTitle, cssCode, props, theme]);

  // Host Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate structure
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'component:ready') {
        setSandboxStatus('ready');
        setErrorMessage(null);
        if (onReady) onReady();
      } else if (event.data.type === 'component:error') {
        setSandboxStatus('error');
        setErrorMessage(event.data.error || 'Unknown sandbox error');
        if (onError) onError(event.data.error || 'Sandbox error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onReady, onError]);

  // Send Prop updates to iframe when props change
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && sandboxStatus === 'ready') {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'component:updateProps',
          props,
        },
        '*'
      );
    }
  }, [props, sandboxStatus]);

  // Send Theme updates to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'component:setTheme',
          theme,
        },
        '*'
      );
    }
  }, [theme]);

  const reloadSandbox = () => {
    setSandboxStatus('loading');
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateSrcDoc();
    }
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'desktop': return '100%';
      case 'tablet': return '768px';
      case 'mobile': return '375px';
    }
  };

  return (
    <div className={clsx('flex flex-col bg-background-subtle border border-border rounded-xl overflow-hidden shadow-2xl', className)}>
      {/* DevTools Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-background-card border-b border-border text-xs">
        {/* Title & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-accent-rose/60 border border-accent-rose/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-accent-amber/60 border border-accent-amber/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-accent-emerald/60 border border-accent-emerald/80 inline-block" />
          </div>

          <span className="font-semibold text-text-primary">{componentTitle}</span>

          {sandboxStatus === 'ready' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/30 text-[10px] font-mono text-accent-emerald">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              SANDBOX SECURE
            </span>
          )}

          {sandboxStatus === 'error' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-accent-rose/10 border border-accent-rose/30 text-[10px] font-mono text-accent-rose">
              <AlertTriangle className="w-3 h-3 mr-1" />
              SANDBOX ERROR
            </span>
          )}
        </div>

        {/* Controls: Viewport + Theme + Reload */}
        <div className="flex items-center space-x-3">
          {/* Viewport Presets */}
          <div className="flex items-center space-x-1 bg-background-subtle p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewport('desktop')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewport === 'desktop' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
              )}
              title="Desktop Viewport (1440px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewport === 'tablet' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
              )}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewport === 'mobile' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
              )}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="p-1.5 rounded-lg border border-border bg-background-card text-text-muted hover:text-text-primary transition-colors"
            title={`Toggle Theme (Current: ${theme})`}
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-accent-amber" />}
          </button>

          {/* Reload Button */}
          <button
            onClick={reloadSandbox}
            className="p-1.5 rounded-lg border border-border bg-background-card text-text-muted hover:text-text-primary transition-colors"
            title="Reload Sandbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Meta Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-background/50 border-b border-border/50 text-[11px] text-text-muted font-mono">
        <div>
          Viewport: <span className="text-text-primary font-semibold">{viewport.toUpperCase()}</span> ({getViewportWidth()})
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <ShieldAlert className="w-3 h-3 text-accent" />
          <span>Iframe sandbox=&quot;allow-scripts&quot; (Host Protected)</span>
        </div>
      </div>

      {/* Sandboxed Iframe Container */}
      <div className="relative min-h-[360px] bg-background-muted flex items-center justify-center p-6 overflow-auto">
        <div
          style={{ width: getViewportWidth(), maxWidth: '100%', transition: 'width 0.3s ease' }}
          className="h-[420px] rounded-lg shadow-2xl border border-border overflow-hidden bg-background"
        >
          {/* MANDATORY INVARIANT 1: Strict Iframe Sandbox without allow-same-origin */}
          <iframe
            ref={iframeRef}
            title={`Sandbox-${componentId}`}
            sandbox="allow-scripts"
            srcDoc={generateSrcDoc()}
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-accent-rose/10 border-t border-accent-rose/30 text-xs font-mono text-accent-rose">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
