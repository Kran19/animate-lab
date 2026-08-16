import React from 'react';
import styles from './PerlinNoiseWarpSection.module.css';

export const PerlinNoiseWarpSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="obys-noise"><canvas id="noise-canvas"></canvas><h2>DEFORMATION</h2></section>
    </div>
  );
};
