import React from 'react';
import styles from './VeroFooter.module.css';

export const VeroFooter: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="vero-foot"><p>© 2026 Vero Studio. All Rights Reserved.</p></footer>
    </div>
  );
};
