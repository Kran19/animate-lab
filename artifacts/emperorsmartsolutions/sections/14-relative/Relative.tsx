import React from 'react';
import styles from './Relative.module.css';

export interface RelativeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Relative: React.FC<RelativeProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div className="relative about-img-mask overflow-hidden rounded-2xl"><div className="absolute inset-0 bg-gradient-to-tr from-royal-900/80 to-transparent z-10"></div><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80" alt="Team" className="w-full h-full object-cover grayscale opacity-80 hover:scale-105 transition-transform duration-700 about-reveal" style=""></div>
    </section>
  );
};

export default Relative;
