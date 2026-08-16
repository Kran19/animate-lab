import React from 'react';
import styles from './FooterSection.module.css';

export const FooterSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <footer className="foot-sec"><p>© 2026 TRIONN Agency. New York • London • Mumbai</p></footer>
    </div>
  );
};
