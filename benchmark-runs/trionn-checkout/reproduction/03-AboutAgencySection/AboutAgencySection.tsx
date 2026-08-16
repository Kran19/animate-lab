import React from 'react';
import styles from './AboutAgencySection.module.css';

export interface AboutAgencySectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AboutAgencySection: React.FC<AboutAgencySectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="about-wrapper">
        <div className="about-container">
          <div className="about-label">WHO WE ARE</div>
          <h2 className="about-heading">
            We are a collective of digital craftsmen, designers, and creative engineers. We bridge imagination and performance to create experiences that define industry standards.
          </h2>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num">120+</div>
              <div className="stat-desc">Awwwards & FWA Honors</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">14+</div>
              <div className="stat-desc">Years Crafting Digital Excellence</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">99.4%</div>
              <div className="stat-desc">Client Retention & Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    
    </section>
  );
};

export default AboutAgencySection;
