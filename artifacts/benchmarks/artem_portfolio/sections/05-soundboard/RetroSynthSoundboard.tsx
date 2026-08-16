import React from 'react';
import styles from './RetroSynthSoundboard.module.css';

export const RetroSynthSoundboard: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="artem-sound"><button>BEEP 1</button><button>BOOP 2</button></section>
    </div>
  );
};
