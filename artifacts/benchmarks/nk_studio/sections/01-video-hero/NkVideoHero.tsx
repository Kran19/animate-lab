import React from 'react';
import styles from './NkVideoHero.module.css';

export const NkVideoHero: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nk-hero"><video loop muted playsinline poster="assets/nk-poster.webp"></video><h1>NK STUDIO</h1></section>
    </div>
  );
};
