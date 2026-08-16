import React from 'react';
import styles from './FeaturedProjectsGrid.module.css';

export const FeaturedProjectsGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="proj-sec"><div className="grid"><div className="card"><h3>Aether Spatial Audio</h3><p>WebGL Experience</p></div><div className="card"><h3>Nova Kinetic Brand</h3><p>3D Identity</p></div></div></section>
    </div>
  );
};
