import React from 'react';
import styles from './ClientReviewsSection.module.css';

export interface ClientReviewsSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ClientReviewsSection: React.FC<ClientReviewsSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-testimonials">
          <div className="testi-container">
            <span className="quote-symbol">“</span>
            <blockquote className="quote-text">
              DZINR transformed our enterprise presence. Their attention to detail, motion choreography, and design speed exceeded every expectation.
            </blockquote>
            <div className="quote-author">
              <strong>Vikramaditya Shah</strong> — Founder & CEO, Nexus Global
            </div>
          </div>
        </section>
      
    </section>
  );
};

export default ClientReviewsSection;
