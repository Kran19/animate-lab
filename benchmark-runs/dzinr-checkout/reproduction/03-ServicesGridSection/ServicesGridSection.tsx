import React from 'react';
import styles from './ServicesGridSection.module.css';

export interface ServicesGridSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ServicesGridSection: React.FC<ServicesGridSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-services">
          <div className="services-container">
            <div className="sec-head">
              <span className="sub-label">SERVICES</span>
              <h2>END-TO-END CREATIVE EXPERTISE</h2>
            </div>
            <div className="services-grid">
              <div className="svc-card">
                <span className="svc-num">01</span>
                <h3>Brand Identity & Strategy</h3>
                <p>Strategic positioning, brand architecture, visual identity systems, and comprehensive style guides.</p>
              </div>
              <div className="svc-card">
                <span className="svc-num">02</span>
                <h3>UI/UX & Product Design</h3>
                <p>User research, wireframing, high-fidelity prototypes, conversion-rate optimization, and design systems.</p>
              </div>
              <div className="svc-card">
                <span className="svc-num">03</span>
                <h3>Web & App Development</h3>
                <p>Full-stack React, Next.js, headless CMS architectures, dynamic WebGL animations, and mobile applications.</p>
              </div>
              <div className="svc-card">
                <span className="svc-num">04</span>
                <h3>Motion & 3D Graphics</h3>
                <p>Kinetic typography, 3D product visualizations, interactive WebGL shaders, and social campaign assets.</p>
              </div>
            </div>
          </div>
        </section>
      
    </section>
  );
};

export default ServicesGridSection;
