import React from 'react';
import styles from './HorizontalProjectTrack.module.css';

export const HorizontalProjectTrack: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nk-track"><div className="row"><div className="film">FILM A</div><div className="film">FILM B</div><div className="film">FILM C</div></div></section>
    </div>
  );
};
