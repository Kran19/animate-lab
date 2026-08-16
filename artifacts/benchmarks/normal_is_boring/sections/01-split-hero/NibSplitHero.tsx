import React from 'react';
import styles from './NibSplitHero.module.css';

export const NibSplitHero: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nib-hero"><div className="left"><h1>NORMAL</h1></div><div className="right"><h1>IS BORING</h1></div></section>
    </div>
  );
};
