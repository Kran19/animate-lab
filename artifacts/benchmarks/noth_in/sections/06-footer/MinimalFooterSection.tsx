import React from 'react';
import styles from './MinimalFooterSection.module.css';

export const MinimalFooterSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="noth-foot"><p>© 2026 NOTH.IN</p></footer>
    </div>
  );
};
