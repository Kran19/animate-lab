import React from 'react';
import styles from './InteractiveGallerySection.module.css';

export interface InteractiveGallerySectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const InteractiveGallerySection: React.FC<InteractiveGallerySectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="gallery-wrapper">
        <div className="gallery-head">
          <h2>R&D EXPERIMENTS</h2>
          <p>Drag or swipe horizontally to explore prototypes</p>
        </div>
        <div className="gallery-rail">
          <div className="gallery-card"><span className="card-num">01</span><h4>FLUID SHADERS</h4></div>
          <div className="gallery-card"><span className="card-num">02</span><h4>SPATIAL AUDIO</h4></div>
          <div className="gallery-card"><span className="card-num">03</span><h4>AI WORKFLOWS</h4></div>
          <div className="gallery-card"><span className="card-num">04</span><h4>MICRO KINETICS</h4></div>
        </div>
      </div>
    
    </section>
  );
};

export default InteractiveGallerySection;
