import React from 'react';
import styles from './SvgMorphControls.module.css';

export const SvgMorphControls: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="eff-morph"><svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="#0ae448"/></svg></section>
    </div>
  );
};
