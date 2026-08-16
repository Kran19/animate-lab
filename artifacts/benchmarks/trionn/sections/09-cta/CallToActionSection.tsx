import React from 'react';
import styles from './CallToActionSection.module.css';

export const CallToActionSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="cta-sec"><h2>HAVE A PROJECT IN MIND?</h2><a href="#" className="btn">LET'S TALK</a></section>
    </div>
  );
};
