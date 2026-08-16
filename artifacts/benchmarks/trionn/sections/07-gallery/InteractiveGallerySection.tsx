import React from 'react';
import styles from './InteractiveGallerySection.module.css';

export const InteractiveGallerySection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="gallery-sec"><div className="track"><div className="slide">01</div><div className="slide">02</div><div className="slide">03</div></div></section>
    </div>
  );
};
