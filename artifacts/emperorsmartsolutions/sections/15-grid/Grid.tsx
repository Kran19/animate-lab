import React from 'react';
import styles from './Grid.module.css';

export interface GridProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8 about-reveal" style=""><div><div className="text-3xl md:text-4xl font-display font-bold text-white mb-1"><span>1</span>+</div><div className="text-xs text-slate-500 uppercase tracking-wider">Years Exp</div></div><div><div className="text-3xl md:text-4xl font-display font-bold text-white mb-1"><span>82</span>+</div><div className="text-xs text-slate-500 uppercase tracking-wider">Clients</div></div><div><div className="text-3xl md:text-4xl font-display font-bold text-white mb-1"><span>97</span>+</div><div className="text-xs text-slate-500 uppercase tracking-wider">Projects</div></div></div>
    </section>
  );
};

export default Grid;
