import React from 'react';
import styles from './TestimonialsSection.module.css';

export interface TestimonialsSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="testi-wrapper">
        <div className="testi-container">
          <span className="testi-badge">RECOGNITION</span>
          <blockquote className="testi-quote">
            "TRIONN delivered a masterclass in digital storytelling, WebGL performance, and brand transformation."
          </blockquote>
          <div className="testi-author">
            <div className="author-avatar">SL</div>
            <div>
              <div className="author-name">Sarah Lin</div>
              <div className="author-title">VP Design, Aether Systems (San Francisco)</div>
            </div>
          </div>
        </div>
      </div>
    
    </section>
  );
};

export default TestimonialsSection;
