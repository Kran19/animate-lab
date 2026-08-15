import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-glow-indigo',
    secondary: 'bg-background-muted text-text-primary hover:bg-background-hover border border-border-subtle active:scale-[0.98]',
    outline: 'bg-transparent text-text-primary border border-border-subtle hover:bg-background-muted hover:border-border active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-muted active:scale-[0.98]',
    danger: 'bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25 border border-accent-rose/30 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
    icon: 'p-2 text-sm',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
