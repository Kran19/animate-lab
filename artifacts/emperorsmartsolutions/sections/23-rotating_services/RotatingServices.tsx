import React from 'react';
import styles from './RotatingServices.module.css';

export interface RotatingServicesProps {
  className?: string;
  style?: React.CSSProperties;
}

export const RotatingServices: React.FC<RotatingServicesProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div id="rotating-services" className="responsive-rotating-text font-display font-bold"><span className="rotating-text service-app-dev" style="display: inline-block;">Application Develo</span></div>
    </section>
  );
};

export default RotatingServices;
