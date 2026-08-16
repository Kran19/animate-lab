import React from 'react';
import styles from './FooterSection.module.css';

export interface FooterSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <footer className="footer-wrapper">
        <div className="footer-grid">
          <div className="footer-col col-main">
            <h3>TRIONN</h3>
            <p>© 2026 TRIONN Agency. All rights reserved.<br/>Crafted with precision & passion.</p>
          </div>
          <div className="footer-col">
            <h4>OFFICES</h4>
            <p>New York • London • Mumbai</p>
          </div>
          <div className="footer-col">
            <h4>SOCIALS</h4>
            <p>Twitter/X • Instagram • Awwwards • LinkedIn</p>
          </div>
          <div className="footer-col">
            <h4>INQUIRIES</h4>
            <p>hello@trionn.com<br/>+1 (555) 019-2834</p>
          </div>
        </div>
      </footer>
    
    </section>
  );
};

export default FooterSection;
