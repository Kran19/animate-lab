import React from 'react';
import { Sliders, ShieldCheck, Info } from 'lucide-react';
import { Card } from '../ui/Card';

export interface PropDefinition {
  name: string;
  type: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
}

export interface PropsInspectorProps {
  propsDocumentation?: PropDefinition[];
  values: Record<string, any>;
  onChange: (newValues: Record<string, any>) => void;
}

export const PropsInspector: React.FC<PropsInspectorProps> = ({
  propsDocumentation = [],
  values,
  onChange,
}) => {
  const handlePropChange = (propName: string, value: any) => {
    onChange({
      ...values,
      [propName]: value,
    });
  };

  // MANDATORY INVARIANT 3: No Fabricated Props. If no validated props exist, show explicit empty state.
  if (!propsDocumentation || propsDocumentation.length === 0) {
    return (
      <Card className="p-5 border border-border bg-background-card">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-text-muted uppercase mb-3">
          <Sliders className="w-4 h-4 text-accent" />
          <span>Interactive Props Inspector</span>
        </div>
        <div className="p-4 rounded-lg bg-background-subtle border border-border/60 text-center">
          <Info className="w-5 h-5 text-text-muted mx-auto mb-2 opacity-60" />
          <p className="text-xs font-medium text-text-muted">No validated interactive props</p>
          <p className="text-[11px] text-text-muted/70 mt-1">
            This component operates strictly on self-contained styles and structure.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border border-border bg-background-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-text-muted uppercase">
          <Sliders className="w-4 h-4 text-accent" />
          <span>Props Inspector ({propsDocumentation.length})</span>
        </div>
        <span className="inline-flex items-center text-[10px] font-mono text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Evidence-Derived
        </span>
      </div>

      <div className="space-y-3.5">
        {propsDocumentation.map((prop) => {
          const currentValue = values[prop.name] ?? prop.defaultValue ?? (prop.type === 'boolean' ? false : prop.type === 'number' ? 0 : '');

          return (
            <div key={prop.name} className="space-y-1.5 p-2.5 rounded-lg bg-background-subtle border border-border/50">
              <div className="flex items-center justify-between">
                <label htmlFor={`prop-${prop.name}`} className="text-xs font-mono font-semibold text-text-primary">
                  {prop.name}
                  {prop.required && <span className="text-accent-rose ml-1">*</span>}
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background-card text-accent-light border border-border">
                  {prop.type}
                </span>
              </div>

              {prop.description && (
                <p className="text-[11px] text-text-muted">{prop.description}</p>
              )}

              {/* Render Control Based on Validated Prop Type */}
              {prop.type === 'boolean' ? (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    id={`prop-${prop.name}`}
                    type="checkbox"
                    checked={Boolean(currentValue)}
                    onChange={(e) => handlePropChange(prop.name, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs font-mono text-text-muted">
                    {currentValue ? 'true' : 'false'}
                  </span>
                </div>
              ) : prop.type === 'number' ? (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      id={`prop-${prop.name}`}
                      type="range"
                      min={0}
                      max={100}
                      value={Number(currentValue) || 0}
                      onChange={(e) => handlePropChange(prop.name, Number(e.target.value))}
                      className="w-full h-1.5 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <input
                      type="number"
                      value={Number(currentValue) || 0}
                      onChange={(e) => handlePropChange(prop.name, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs font-mono bg-background-card border border-border rounded text-text-primary text-right"
                    />
                  </div>
                </div>
              ) : prop.type === 'color' ? (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    id={`prop-${prop.name}`}
                    type="color"
                    value={String(currentValue || '#6366f1')}
                    onChange={(e) => handlePropChange(prop.name, e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-text-primary">{String(currentValue || '#6366f1')}</span>
                </div>
              ) : (
                <input
                  id={`prop-${prop.name}`}
                  type="text"
                  value={String(currentValue || '')}
                  onChange={(e) => handlePropChange(prop.name, e.target.value)}
                  placeholder={`Enter ${prop.name}...`}
                  className="w-full px-2.5 py-1.5 text-xs bg-background-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent font-sans"
                />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
