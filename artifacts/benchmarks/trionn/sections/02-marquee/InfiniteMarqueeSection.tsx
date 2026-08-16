import React from 'react';
import styles from './InfiniteMarqueeSection.module.css';

export const InfiniteMarqueeSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="marquee-sec"><div className="track">STRATEGY • DESIGN • 3D MOTION • DEVELOPMENT • WEBGL •</div></section>
    </div>
  );
};
