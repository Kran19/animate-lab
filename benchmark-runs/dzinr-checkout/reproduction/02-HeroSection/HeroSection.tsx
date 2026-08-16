import React from 'react';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-hero">
          <div className="hero-content">
            <span className="hero-badge">INNOVATION • BRANDING • TECH</span>
            <h1 className="hero-title">
              CRAFTING DISTINCT<br/>
              <span className="highlight">BRAND EXPERIENCES</span>
            </h1>
            <p className="hero-desc">
              We empower ambitious enterprises with bespoke digital identities, conversion-focused interfaces, and high-impact design engineering.
            </p>
            <div className="hero-btns">
              <a href="#work" className="btn-main">VIEW SELECTED WORK</a>
              <a href="#contact" className="btn-outline">START A PROJECT →</a>
            </div>
          </div>
        </section>
      
    </section>
  );
};

export default HeroSection;
