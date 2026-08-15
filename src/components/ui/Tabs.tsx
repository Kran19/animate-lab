import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx('flex items-center space-x-1 border-b border-border pb-px', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors relative focus:outline-none',
              isActive
                ? 'border-accent text-accent-light bg-accent/5 font-semibold'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-subtle'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  isActive ? 'bg-accent/20 text-accent-light' : 'bg-background-muted text-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
