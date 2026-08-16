import React from 'react';
import styles from './EffectsHero.module.css';

export const EffectsHero: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="eff-hero"><h1>EFFECTS PLAYGROUND</h1><p>Interactive velocity, tilt, and morph parameters.</p></section>
    </div>
  );
};
