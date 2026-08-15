import React from 'react';
import { ChevronRight, Globe, FileText, Layers, Box, Cpu, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export interface BreadcrumbItem {
  id: string;
  label: string;
  type?: 'website' | 'page' | 'section' | 'component' | 'animation' | 'technology';
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'website': return <Globe className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'page': return <FileText className="w-3.5 h-3.5 text-accent-light" />;
      case 'section': return <Layers className="w-3.5 h-3.5 text-accent-amber" />;
      case 'component': return <Box className="w-3.5 h-3.5 text-accent-purple" />;
      case 'animation': return <Sparkles className="w-3.5 h-3.5 text-accent-rose" />;
      case 'technology': return <Cpu className="w-3.5 h-3.5 text-accent-emerald" />;
      default: return null;
    }
  };

  return (
    <nav className={clsx('flex items-center space-x-2 text-xs font-medium', className)} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.id || idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />}
            <button
              onClick={item.onClick}
              disabled={isLast || !item.onClick}
              className={clsx(
                'inline-flex items-center space-x-1.5 transition-colors rounded px-1.5 py-0.5',
                isLast
                  ? 'text-text-primary font-semibold cursor-default bg-background-card border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary hover:bg-background-muted'
              )}
            >
              {getIcon(item.type)}
              <span className="truncate max-w-[200px]">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
