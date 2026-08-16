import React from 'react';
import styles from './HeaderNavSection.module.css';

export const HeaderNavSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <header className="noth-nav"><span>NOTH.IN</span><nav><a href="#">ARCHIVE</a><a href="#">INDEX</a></nav></header>
    </div>
  );
};
