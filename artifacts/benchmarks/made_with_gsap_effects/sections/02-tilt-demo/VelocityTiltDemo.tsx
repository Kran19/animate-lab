import React from 'react';
import styles from './VelocityTiltDemo.module.css';

export const VelocityTiltDemo: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="eff-tilt"><div className="tilt-card" id="tilt-box"><h3>3D VELOCITY TILT</h3><p>Move cursor over card</p></div></section>
    </div>
  );
};
