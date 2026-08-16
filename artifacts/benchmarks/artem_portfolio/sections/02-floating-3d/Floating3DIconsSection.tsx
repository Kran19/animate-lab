import React from 'react';
import styles from './Floating3DIconsSection.module.css';

export const Floating3DIconsSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="artem-3d"><canvas id="floating-icons"></canvas></section>
    </div>
  );
};
