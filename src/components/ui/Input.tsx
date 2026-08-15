import React from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className, icon, ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          {icon}
        </div>
      )}
      <input
        className={clsx(
          'w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50',
          icon ? 'pl-9' : 'pl-3',
          className
        )}
        {...props}
      />
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = (props) => (
  <Input icon={<Search className="w-4 h-4 text-text-muted" />} placeholder="Search..." {...props} />
);
