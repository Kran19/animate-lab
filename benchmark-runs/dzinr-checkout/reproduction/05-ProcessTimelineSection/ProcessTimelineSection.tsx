import React from 'react';
import styles from './ProcessTimelineSection.module.css';

export interface ProcessTimelineSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ProcessTimelineSection: React.FC<ProcessTimelineSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <section className="dzinr-process">
          <div className="process-container">
            <span className="process-badge">METHODOLOGY</span>
            <h2>OUR PROVEN DELIVERY FRAMEWORK</h2>
            <div className="steps-row">
              <div className="step-box">
                <span className="step-num">STEP 01</span>
                <h4>Discover & Align</h4>
                <p>Auditing brand equity, user interviews, and defining KPIs.</p>
              </div>
              <div className="step-box">
                <span className="step-num">STEP 02</span>
                <h4>Concept & Prototype</h4>
                <p>Rapid architectural wireframing and motion design validation.</p>
              </div>
              <div className="step-box">
                <span className="step-num">STEP 03</span>
                <h4>Engineer & Polish</h4>
                <p>Clean React component development and performance audits.</p>
              </div>
              <div className="step-box">
                <span className="step-num">STEP 04</span>
                <h4>Scale & Evolve</h4>
                <p>Continuous testing, conversion optimization, and brand governance.</p>
              </div>
            </div>
          </div>
        </section>
      
    </section>
  );
};

export default ProcessTimelineSection;
