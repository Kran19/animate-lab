import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={clsx(
          'w-full bg-background-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          maxWidths[maxWidth]
        )}
      >
        {/* Modal Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-subtle">
            <div className="text-base font-semibold text-text-primary">{title}</div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border bg-background-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
