import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { CodeViewer } from '../ui/CodeViewer';
import { useApp } from '../../store/appStore';
import { Download, Copy, Check, ShieldCheck, FolderCheck, AlertTriangle, FileCode } from 'lucide-react';
import { ExportFormat } from '../../domain/types';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  componentTitle: string;
  reactCode?: string;
  cssCode?: string;
  manifestJson?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  componentTitle,
  reactCode = '// React TSX Code',
  cssCode = '/* Scoped CSS */',
  manifestJson = '{\n  "version": "1.0.0"\n}',
}) => {
  const { exportComponentPackage } = useApp();

  const [activeTab, setActiveTab] = useState<'code' | 'export'>('code');
  const [activeCodeFile, setActiveCodeFile] = useState<'tsx' | 'css' | 'manifest'>('tsx');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('react_tailwind');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);

    try {
      // INVARIANT 5: Thin Export UI — calls backend component.export IPC method
      const result = await exportComponentPackage(candidateId, {
        exportFormat,
      });
      setExportResult(result);
      setActiveTab('export');
    } catch (err: any) {
      setExportError(err?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-accent" />
          <span>Export Component: {componentTitle}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 text-xs text-text-muted font-mono">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <span>Phase 9 Deterministic Export Engine</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteExport}
              loading={isExporting}
              icon={<FolderCheck className="w-3.5 h-3.5" />}
            >
              Export to Workspace
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Format Selector */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background-subtle border border-border">
          <div className="space-y-0.5">
            <label className="text-xs font-semibold text-text-primary">Target Export Format</label>
            <p className="text-[11px] text-text-muted">Choose your preferred framework and styling bundle.</p>
          </div>

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-1.5 text-xs font-mono bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="react_tailwind">React 18 + Tailwind CSS</option>
            <option value="react_css_modules">React 18 + Scoped CSS Modules</option>
            <option value="vanilla_html_css">Vanilla HTML / CSS Web Component</option>
          </select>
        </div>

        {/* View Tabs */}
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          tabs={[
            { id: 'code', label: 'Source Files & Clipboard', icon: <FileCode className="w-4 h-4" /> },
            { id: 'export', label: 'Workspace Package Details', icon: <FolderCheck className="w-4 h-4" /> },
          ]}
        />

        {activeTab === 'code' && (
          <div className="space-y-3">
            {/* File Switcher & Quick Copy */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveCodeFile('tsx')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeCodeFile === 'tsx' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Component.tsx
                </button>
                <button
                  onClick={() => setActiveCodeFile('css')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeCodeFile === 'css' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Component.module.css
                </button>
                <button
                  onClick={() => setActiveCodeFile('manifest')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeCodeFile === 'manifest' ? 'bg-accent text-white font-semibold' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  manifest.json
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = activeCodeFile === 'tsx' ? reactCode : activeCodeFile === 'css' ? cssCode : manifestJson;
                  handleCopy(text, activeCodeFile);
                }}
                icon={copiedKey === activeCodeFile ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedKey === activeCodeFile ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>

            {/* Code Display */}
            <div className="h-[340px] rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
              <CodeViewer
                code={activeCodeFile === 'tsx' ? reactCode : activeCodeFile === 'css' ? cssCode : manifestJson}
                language={activeCodeFile === 'tsx' ? 'typescript' : activeCodeFile === 'css' ? 'css' : 'json'}
                filename={activeCodeFile === 'tsx' ? 'Component.tsx' : activeCodeFile === 'css' ? 'Component.module.css' : 'manifest.json'}
              />
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4 min-h-[340px]">
            {exportResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 space-y-1">
                  <div className="flex items-center space-x-2 text-accent-emerald font-semibold text-xs">
                    <Check className="w-4 h-4" />
                    <span>Component Package Successfully Generated!</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Destination directory: <span className="font-mono text-text-primary">{exportResult.packageDir || 'workspaces/exports'}</span>
                  </p>
                </div>

                {/* Generated Files Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-background-subtle border-b border-border text-[10px] font-mono uppercase text-text-muted">
                      <tr>
                        <th className="p-2.5">File Path</th>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5">SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {(exportResult.files || []).map((file: any) => (
                        <tr key={file.relativePath} className="hover:bg-background-subtle/50">
                          <td className="p-2.5 text-accent-light">{file.relativePath}</td>
                          <td className="p-2.5 text-text-muted">{file.sizeBytes} B</td>
                          <td className="p-2.5 text-[10px] text-text-muted truncate max-w-[200px]">
                            {file.contentHash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg bg-background-subtle border border-border/60">
                <FolderCheck className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-text-primary">No Export Package Generated Yet</p>
                <p className="text-[11px] text-text-muted mt-1">
                  Click &quot;Export to Workspace&quot; below to generate a self-contained, portable component package.
                </p>
              </div>
            )}

            {exportError && (
              <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg text-xs font-mono text-accent-rose flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{exportError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
