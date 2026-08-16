import React from 'react';
import styles from './ObysFluidText.module.css';

export const ObysFluidText: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="obys-hero"><canvas id="fluid-canvas"></canvas><h1>FLUIDITY</h1></section>
    </div>
  );
};
