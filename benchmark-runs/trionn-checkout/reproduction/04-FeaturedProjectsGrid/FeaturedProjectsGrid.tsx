import React from 'react';
import styles from './FeaturedProjectsGrid.module.css';

export interface FeaturedProjectsGridProps {
  className?: string;
  style?: React.CSSProperties;
}

export const FeaturedProjectsGrid: React.FC<FeaturedProjectsGridProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="projects-wrapper">
        <div className="projects-container">
          <div className="projects-head">
            <h2>SELECTED WORK</h2>
            <span className="pill-tag">2024–2026 ARCHIVE</span>
          </div>
          <div className="projects-grid">
            <div className="project-card">
              <div className="card-visual" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
                <span className="card-overlay-tag">WEBGL EXPERIENCE</span>
              </div>
              <div className="card-info">
                <h3>AETHER SPATIAL</h3>
                <p>3D Sound & Spatial Architecture Design</p>
              </div>
            </div>
            <div className="project-card">
              <div className="card-visual" style="background: linear-gradient(135deg, #831843 0%, #500724 100%);">
                <span className="card-overlay-tag">BRAND IDENTITY</span>
              </div>
              <div className="card-info">
                <h3>NOVA KINETIC</h3>
                <p>Interactive Design System & Motion Framework</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </section>
  );
};

export default FeaturedProjectsGrid;
