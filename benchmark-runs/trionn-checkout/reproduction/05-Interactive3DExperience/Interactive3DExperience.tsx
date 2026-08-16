import React from 'react';
import styles from './Interactive3DExperience.module.css';

export interface Interactive3DExperienceProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Interactive3DExperience: React.FC<Interactive3DExperienceProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="webgl-canvas-box">
        <div className="webgl-bg-mesh"></div>
        <div className="webgl-content">
          <span className="webgl-badge">SPECIALIZED RUNTIME • THREE.JS</span>
          <h2>REAL-TIME 3D SPATIAL PARTICLES</h2>
          <p>Interactive GPU vertex deformation following mouse velocity vector.</p>
          <div className="canvas-mock">
            <div className="orbiting-ring"></div>
            <div className="core-sphere"></div>
          </div>
        </div>
      </div>
    
    </section>
  );
};

export default Interactive3DExperience;
