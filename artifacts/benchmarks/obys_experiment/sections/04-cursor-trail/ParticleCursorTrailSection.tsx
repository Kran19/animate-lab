import React from 'react';
import styles from './ParticleCursorTrailSection.module.css';

export const ParticleCursorTrailSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="obys-cursor"><p>Move cursor to spawn kinetic trails.</p></section>
    </div>
  );
};
