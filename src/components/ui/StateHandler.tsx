import React from 'react';
import { Loader2, AlertCircle, Inbox, SearchX, RefreshCw, Clock } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

export type UIStateMode = 'loading' | 'empty' | 'error' | 'partial' | 'processing' | 'no_results' | 'populated';

export interface StateHandlerProps {
  state: UIStateMode;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  errorMessage?: string;
  onRetry?: () => void;
  actionButton?: React.ReactNode;
  className?: string;
}

export const StateHandler: React.FC<StateHandlerProps> = ({
  state,
  children,
  title,
  description,
  errorMessage,
  onRetry,
  actionButton,
  className,
}) => {
  if (state === 'populated') {
    return <>{children}</>;
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-background-card/50 min-h-[320px]', className)}>
      {state === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'Loading data...'}</h4>
            <p className="text-xs text-text-muted mt-1">{description || 'Fetching metadata & analysis records from local store.'}</p>
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="space-y-4">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto" />
            <Clock className="w-4 h-4 text-accent-light absolute bottom-0 right-1/3 animate-ping" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'Analysis in Progress...'}</h4>
            <p className="text-xs text-text-muted mt-1">{description || 'Browser engine is inspecting runtime DOM & animation triggers.'}</p>
          </div>
        </div>
      )}

      {state === 'empty' && (
        <div className="space-y-4 max-w-md">
          <Inbox className="w-12 h-12 text-text-muted mx-auto opacity-50" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'No items found'}</h4>
            <p className="text-xs text-text-muted mt-1">{description || 'Start by initiating a new website capture project.'}</p>
          </div>
          {actionButton}
        </div>
      )}

      {state === 'no_results' && (
        <div className="space-y-4 max-w-md">
          <SearchX className="w-12 h-12 text-text-muted mx-auto opacity-50" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'No matching results'}</h4>
            <p className="text-xs text-text-muted mt-1">{description || 'Try refining your search query or filter tags.'}</p>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-accent-rose mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'Operation Failed'}</h4>
            <p className="text-xs text-accent-rose/90 mt-1 font-mono">{errorMessage || description || 'An unknown error occurred while fetching resources.'}</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry Operation
            </Button>
          )}
        </div>
      )}

      {state === 'partial' && (
        <div className="space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-accent-amber mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{title || 'Partial Capture Record'}</h4>
            <p className="text-xs text-text-muted mt-1">{description || 'Some sub-pages timed out or failed analysis, but partial results are available.'}</p>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};
