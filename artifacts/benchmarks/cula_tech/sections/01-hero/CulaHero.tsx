import React from 'react';
import styles from './CulaHero.module.css';

export const CulaHero: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="cula-hero"><h1>TRUSTED CARBON REMOVAL</h1><p>Verifiable physical telemetry for climate finance.</p></section>
    </div>
  );
};
