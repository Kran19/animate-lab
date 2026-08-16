import React from 'react';
import styles from './MwgHeader.module.css';

export const MwgHeader: React.FC = () => {
  return (
    <div className={styles.root}>
      <header className="mwg-head"><h1>MADE WITH GSAP</h1><p>Curating the web's best animations.</p></header>
    </div>
  );
};
