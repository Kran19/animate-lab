import React from 'react';
import styles from './HeaderNavSection.module.css';

export const HeaderNavSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <header className="nothin-header"><div className="nav-left">NOTH.IN</div><nav className="nav-links"><a href="#archive">ARCHIVE</a><a href="#about">ABOUT</a><a href="#contact">INDEX</a></nav></header>
    </div>
  );
};
