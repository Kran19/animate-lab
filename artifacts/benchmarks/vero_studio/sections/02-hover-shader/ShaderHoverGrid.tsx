import React from 'react';
import styles from './ShaderHoverGrid.module.css';

export const ShaderHoverGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="vero-shader"><div className="canvas-box"><canvas id="ripple-canvas"></canvas><p>Hover project to distort water surface.</p></div></section>
    </div>
  );
};
