import React from 'react';
import styles from './HeaderNavSection.module.css';

export interface HeaderNavSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HeaderNavSection: React.FC<HeaderNavSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
        <header className="dzinr-header">
          <div className="header-container">
            <div className="logo">DZINR<span className="dot">.</span></div>
            <nav className="nav-menu">
              <a href="#services" className="nav-item">SERVICES</a>
              <a href="#work" className="nav-item">WORK</a>
              <a href="#about" className="nav-item">ABOUT</a>
              <a href="#insights" className="nav-item">INSIGHTS</a>
              <a href="#contact" className="nav-cta">LET'S TALK →</a>
            </nav>
          </div>
        </header>
      
    </section>
  );
};

export default HeaderNavSection;
