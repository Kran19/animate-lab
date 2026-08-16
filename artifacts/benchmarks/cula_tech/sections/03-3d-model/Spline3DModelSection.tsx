import React from 'react';
import styles from './Spline3DModelSection.module.css';

export const Spline3DModelSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="cula-3d"><canvas id="spline-canvas"></canvas><p>Interactive Reactor Core</p></section>
    </div>
  );
};
