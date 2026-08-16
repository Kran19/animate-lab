import React from 'react';
import styles from './HorizontalWorksRail.module.css';

export const HorizontalWorksRail: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nib-rail"><div className="rail"><div className="box">CAMPAIGN 01</div><div className="box">CAMPAIGN 02</div></div></section>
    </div>
  );
};
