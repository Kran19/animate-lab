import React from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, className, ...props }) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <select
        className={clsx(
          'bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-background-card text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
