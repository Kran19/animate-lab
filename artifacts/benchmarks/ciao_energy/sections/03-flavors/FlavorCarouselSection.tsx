import React from 'react';
import styles from './FlavorCarouselSection.module.css';

export const FlavorCarouselSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="ciao-flav"><div className="carousel"><div className="can">YUZU</div><div className="can">MATCHA</div><div className="can">ORANGE</div></div></section>
    </div>
  );
};
