import React from 'react';
import styles from './SiteOfTheWeekBanner.module.css';

export const SiteOfTheWeekBanner: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="mwg-sotw"><h2>SITE OF THE WEEK: AETHER</h2></section>
    </div>
  );
};
