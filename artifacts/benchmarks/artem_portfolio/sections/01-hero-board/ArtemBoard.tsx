import React from 'react';
import styles from './ArtemBoard.module.css';

export const ArtemBoard: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="artem-board"><div className="physics-card" id="card-a">WORK</div><div className="physics-card" id="card-b">ABOUT</div></section>
    </div>
  );
};
