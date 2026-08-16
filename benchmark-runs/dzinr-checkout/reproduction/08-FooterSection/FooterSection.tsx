import React from 'react';
import styles from './FooterSection.module.css';

export interface FooterSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <footer className="dzinr-footer">
          <div className="footer-wrap">
            <div className="f-col">
              <div className="f-logo">DZINR<span style="color:#f59e0b;">.</span></div>
              <p>© 2026 DZINR Design Studio.<br/>All Rights Reserved.</p>
            </div>
            <div className="f-col">
              <h5>SERVICES</h5>
              <p>Brand Strategy • UI/UX • React Development • 3D Motion</p>
            </div>
            <div className="f-col">
              <h5>CONNECT</h5>
              <p>hello@dzinr.in<br/>Instagram • LinkedIn • Twitter</p>
            </div>
          </div>
        </footer>
      
    </section>
  );
};

export default FooterSection;
