import React from 'react';
import styles from './MwgFooter.module.css';

export const MwgFooter: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="mwg-foot"><p>© 2026 Made With GSAP.</p></footer>
    </div>
  );
};
