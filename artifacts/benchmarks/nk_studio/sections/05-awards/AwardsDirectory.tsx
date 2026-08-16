import React from 'react';
import styles from './AwardsDirectory.module.css';

export const AwardsDirectory: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nk-awards"><h2>AWARDS</h2><p>5x Cannes Lions • 3x D&AD Yellow Pencils • 8x Awwwards SOTD</p></section>
    </div>
  );
};
