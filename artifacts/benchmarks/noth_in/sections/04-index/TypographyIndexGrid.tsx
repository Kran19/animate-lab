import React from 'react';
import styles from './TypographyIndexGrid.module.css';

export const TypographyIndexGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="noth-idx"><table><tr><th>YEAR</th><th>TITLE</th></tr><tr><td>2026</td><td>Mono Form</td></tr><tr><td>2025</td><td>Silence Book</td></tr></table></section>
    </div>
  );
};
