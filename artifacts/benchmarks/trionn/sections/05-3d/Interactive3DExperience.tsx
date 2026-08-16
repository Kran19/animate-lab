import React from 'react';
import styles from './Interactive3DExperience.module.css';

export const Interactive3DExperience: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="webgl-sec"><canvas id="webgl-sphere"></canvas><h2>SPATIAL DIMENSION</h2></section>
    </div>
  );
};
