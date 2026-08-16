import React from 'react';
import styles from './CulaFooterSection.module.css';

export const CulaFooterSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="cula-foot"><p>© 2026 Cula Technologies Inc.</p></footer>
    </div>
  );
};
