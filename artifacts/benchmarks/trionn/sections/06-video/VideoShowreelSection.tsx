import React from 'react';
import styles from './VideoShowreelSection.module.css';

export const VideoShowreelSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="video-sec"><video loop muted playsinline poster="assets/poster.webp"><source src="assets/reel.mp4" type="video/mp4" /></video></section>
    </div>
  );
};
