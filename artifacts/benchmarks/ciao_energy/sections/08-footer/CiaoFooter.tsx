import React from 'react';
import styles from './CiaoFooter.module.css';

export const CiaoFooter: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="ciao-foot"><p>© 2026 Ciao Energy Inc.</p></footer>
    </div>
  );
};
