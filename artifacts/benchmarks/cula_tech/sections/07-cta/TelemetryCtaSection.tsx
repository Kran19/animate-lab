import React from 'react';
import styles from './TelemetryCtaSection.module.css';

export const TelemetryCtaSection: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="cula-cta"><h2>CONNECT SENSOR INFRASTRUCTURE</h2><button>REQUEST API ACCESS</button></section>
    </div>
  );
};
