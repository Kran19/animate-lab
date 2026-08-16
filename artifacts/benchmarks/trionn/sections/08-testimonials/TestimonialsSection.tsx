import React from 'react';
import styles from './TestimonialsSection.module.css';

export const TestimonialsSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="testi-sec"><blockquote>"TRIONN delivered a masterclass in digital storytelling."</blockquote><cite>VP Design, Aether Systems</cite></section>
    </div>
  );
};
