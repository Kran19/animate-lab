import React from 'react';
import styles from './SoundInteractiveToggle.module.css';

export const SoundInteractiveToggle: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="nk-sound"><button id="sound-btn">ENABLE AUDIO 🔊</button></section>
    </div>
  );
};
