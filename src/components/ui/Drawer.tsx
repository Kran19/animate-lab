import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    md: 'w-[400px]',
    lg: 'w-[560px]',
    xl: 'w-[720px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={clsx(
          'h-full bg-background-card border-l border-border shadow-2xl flex flex-col',
          widths[width]
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-subtle">
          <div className="text-base font-semibold text-text-primary">{title}</div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
