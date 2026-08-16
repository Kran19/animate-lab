import React from 'react';
import styles from './MwgMasonryGrid.module.css';

export const MwgMasonryGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="mwg-grid"><div className="grid"><div className="card"><h3>Spatial Canvas</h3><p>GSAP + Three.js</p></div><div className="card"><h3>Kinetic Type</h3><p>SplitText + ScrollTrigger</p></div></div></section>
    </div>
  );
};
