import React from 'react';
import styles from './StoreLocatorSection.module.css';

export const StoreLocatorSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="ciao-store"><h2>FIND A STORE</h2><input placeholder="Enter zip code..." /></section>
    </div>
  );
};
