import React from 'react';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="trionn-hero"><div className="container"><h1 className="glitch-title">WE ARE TRIONN<br/><span className="sub">CREATIVE AGENCY</span></h1><p className="tagline">Crafting digital experiences that transcend boundaries.</p><div className="cta-row"><button className="btn-primary" id="explore-btn">EXPLORE WORK</button><button className="btn-secondary" id="showreel-btn">PLAY SHOWREEL</button></div></div></section>
    </div>
  );
};
