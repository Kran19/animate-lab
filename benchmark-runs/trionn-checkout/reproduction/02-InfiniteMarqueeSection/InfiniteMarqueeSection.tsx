import React from 'react';
import styles from './InfiniteMarqueeSection.module.css';

export interface InfiniteMarqueeSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const InfiniteMarqueeSection: React.FC<InfiniteMarqueeSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="marquee-wrapper">
        <div className="marquee-track">
          <span className="item">CREATIVE DIRECTION</span><span className="star">✦</span>
          <span className="item">WEBGL & 3D MOTION</span><span className="star">✦</span>
          <span className="item">DIGITAL BRANDING</span><span className="star">✦</span>
          <span className="item">INTERACTIVE DEVELOPMENT</span><span className="star">✦</span>
          <span className="item">SPATIAL COMPUTING</span><span className="star">✦</span>
          <span className="item">CREATIVE DIRECTION</span><span className="star">✦</span>
          <span className="item">WEBGL & 3D MOTION</span><span className="star">✦</span>
        </div>
      </div>
    
    </section>
  );
};

export default InfiniteMarqueeSection;
