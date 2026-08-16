import React from 'react';
import styles from './CallToActionSection.module.css';

export interface CallToActionSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="cta-wrapper">
        <div className="cta-box">
          <span className="cta-badge">START A PROJECT</span>
          <h2>HAVE A VISION IN MIND?</h2>
          <p>Let's collaborate to build something extraordinary together.</p>
          <a href="mailto:hello@trionn.com" className="big-cta-btn">
            <span>START A CONVERSATION</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </div>
    
    </section>
  );
};

export default CallToActionSection;
