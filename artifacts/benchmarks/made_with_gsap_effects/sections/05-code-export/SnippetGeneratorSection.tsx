import React from 'react';
import styles from './SnippetGeneratorSection.module.css';

export const SnippetGeneratorSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="eff-code"><pre><code>gsap.to('.target', { x: 100, duration: 1 });</code></pre></section>
    </div>
  );
};
