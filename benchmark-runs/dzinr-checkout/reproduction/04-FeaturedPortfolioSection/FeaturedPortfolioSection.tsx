import React from 'react';
import styles from './FeaturedPortfolioSection.module.css';

export interface FeaturedPortfolioSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const FeaturedPortfolioSection: React.FC<FeaturedPortfolioSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-portfolio">
          <div className="portfolio-container">
            <div className="port-head">
              <h2>SELECTED PROJECTS</h2>
              <span className="arch-tag">AWARD-WINNING DELIVERABLES</span>
            </div>
            <div className="port-grid">
              <div className="port-item">
                <div className="port-img-box" style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);">
                  <span className="category-tag">E-COMMERCE & BRANDING</span>
                </div>
                <h3>Luxe Artisan Spirits</h3>
                <p>Custom Shopify Plus Architecture & Visual Rebrand</p>
              </div>
              <div className="port-item">
                <div className="port-img-box" style="background: linear-gradient(135deg, #701a75 0%, #3b0764 100%);">
                  <span className="category-tag">SAAS PLATFORM</span>
                </div>
                <h3>Apex Intelligence Cloud</h3>
                <p>Design System & Multi-Tenant React Dashboard</p>
              </div>
            </div>
          </div>
        </section>
      
    </section>
  );
};

export default FeaturedPortfolioSection;
