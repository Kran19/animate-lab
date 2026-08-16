import React from 'react';
import styles from './CallToActionSection.module.css';

export interface CallToActionSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-cta">
          <div className="cta-box">
            <span className="cta-mini">LET'S COLLABORATE</span>
            <h2>HAVE A NEW PROJECT?</h2>
            <p>We are currently accepting new client partnerships for Q3/Q4.</p>
            <a href="mailto:hello@dzinr.in" className="cta-button">START A CONVERSATION →</a>
          </div>
        </section>
      
    </section>
  );
};

export default CallToActionSection;
