import React from 'react';
import styles from './VeroHero.module.css';

export const VeroHero: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="vero-hero"><h1>VERO STUDIO</h1><p>Architecture of light and mass.</p></section>
    </div>
  );
};
