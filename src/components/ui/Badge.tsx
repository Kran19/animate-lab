import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  icon,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md tracking-wide uppercase';

  const variants = {
    default: 'bg-background-muted text-text-secondary border border-border',
    accent: 'bg-accent/15 text-accent-light border border-accent/30',
    success: 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30',
    warning: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    error: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30',
    info: 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
    purple: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30',
    outline: 'bg-transparent text-text-muted border border-border-subtle',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
