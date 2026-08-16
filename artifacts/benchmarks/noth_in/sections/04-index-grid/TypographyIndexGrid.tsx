import React from 'react';
import styles from './TypographyIndexGrid.module.css';

export const TypographyIndexGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="index-grid"><table className="index-table"><thead><tr><th>YEAR</th><th>TITLE</th><th>DISCIPLINE</th></tr></thead><tbody><tr><td>2026</td><td>Mono Form</td><td>Art Direction</td></tr><tr><td>2025</td><td>Silence Book</td><td>Editorial Publication</td></tr><tr><td>2025</td><td>Kinesis Index</td><td>Interactive Type</td></tr></tbody></table></section>
    </div>
  );
};
