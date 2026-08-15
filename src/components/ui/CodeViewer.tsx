import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { clsx } from 'clsx';

export interface CodeFile {
  filename: string;
  language: string;
  code: string;
}

export interface CodeViewerProps {
  files: CodeFile[];
  className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ files, className }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!files || files.length === 0) {
    return (
      <div className="bg-background-card border border-border rounded-xl p-8 text-center text-text-muted font-mono text-xs">
        No source code available for this element.
      </div>
    );
  }

  const activeFile = files[activeFileIndex] || files[0];
  const lines = activeFile.code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx('bg-background-card border border-border rounded-xl overflow-hidden font-mono text-xs shadow-xl', className)}>
      {/* Header with Tabs & Copy Button */}
      <div className="flex items-center justify-between bg-background-subtle border-b border-border px-4 py-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFileIndex(idx)}
              className={clsx(
                'flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors',
                activeFileIndex === idx
                  ? 'bg-background-muted text-accent-light border border-border-subtle font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-background-muted border border-border hover:bg-background-hover text-text-secondary text-[11px] transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3 text-text-muted" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="p-4 overflow-x-auto max-h-[480px] bg-background-subtle/50 font-mono text-text-primary leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-background-muted/40 transition-colors">
                <td className="w-10 select-none text-right pr-4 text-text-muted/40 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre text-text-primary">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
