import React from 'react';
import styles from './TelemetryCardGrid.module.css';

export const TelemetryCardGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="cula-cards"><div className="grid"><div className="card"><h3>99.98%</h3><p>Uptime Verification</p></div><div className="card"><h3>1.2M</h3><p>Tons Captured</p></div></div></section>
    </div>
  );
};
