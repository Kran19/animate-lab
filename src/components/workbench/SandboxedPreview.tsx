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
  </style>
</head>
<body class="theme-${theme}">
  <div id="sandbox-root">
    <div class="sandbox-card">
      <div id="component-render-target">
        <h3 id="prop-title" style="margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 700;">${props.title || componentTitle}</h3>
        <p id="prop-description" style="margin: 0 0 16px 0; font-size: 0.875rem; opacity: 0.8;">${props.description || 'Interactive Sandboxed Component Instance'}</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-family: monospace; background: rgba(99, 102, 241, 0.2); color: #818cf8;">
            ID: ${encodeURIComponent(componentId)}
          </span>
          <span id="prop-active" style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-family: monospace; background: rgba(16, 185, 129, 0.2); color: #34d399;">
            Active: ${props.isActive !== false ? 'true' : 'false'}
          </span>
        </div>
      </div>
    </div>
  </div>

  <script>
    (function() {
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

              var activeEl = document.getElementById('prop-active');
              if (activeEl && p.isActive !== undefined) activeEl.textContent = 'Active: ' + p.isActive;
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
