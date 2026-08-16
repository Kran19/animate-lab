import React from 'react';
import styles from './VideoShowreelSection.module.css';

export interface VideoShowreelSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const VideoShowreelSection: React.FC<VideoShowreelSectionProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      
      <div className="video-section-box">
        <div className="video-container">
          <div className="video-poster-layer">
            <div className="reel-center-cta">
              <div className="play-circle">▶</div>
              <span>WATCH SHOWREEL 2026</span>
            </div>
          </div>
        </div>
      </div>
    
    </section>
  );
};

export default VideoShowreelSection;
