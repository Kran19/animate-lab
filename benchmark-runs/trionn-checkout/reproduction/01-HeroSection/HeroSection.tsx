import React, { useEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '', style }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const [isPlayingReel, setIsPlayingReel] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const follower = cursorFollowerRef.current;
    if (!hero || !follower) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const animate = () => {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.transform = `translate3d(${followerX - 35}px, ${followerY - 35}px, 0)`;
      rafId = requestAnimationFrame(animate);
    };

    hero.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      hero.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={heroRef} className={`${styles.heroRoot} ${className}`} style={style}>
      {/* Interactive Cursor Light Orb */}
      <div ref={cursorFollowerRef} className={styles.cursorOrb} />

      {/* Atmospheric Ambient Glow Mesh */}
      <div className={styles.ambientGlowPrimary} />
      <div className={styles.ambientGlowSecondary} />
      <div className={styles.noiseOverlay} />

      <div className={styles.container}>
        {/* Top Badge & Recognition Bar */}
        <div className={styles.topBar}>
          <div className={styles.agencyBadge}>
            <span className={styles.pulseDot} />
            <span className={styles.badgeText}>TRIONN // AI-POWERED CREATIVE STUDIO</span>
          </div>
          <div className={styles.awardsHighlight}>
            <span>120+ AWARDS</span>
            <span className={styles.star}>✦</span>
            <span>AWWWARDS SOTD</span>
            <span className={styles.star}>✦</span>
            <span>FWA OF THE DAY</span>
          </div>
        </div>

        {/* Grand Headline with Staggered Kinetic Words */}
        <div className={styles.headlineWrapper}>
          <h1 className={styles.grandTitle}>
            <span className={styles.line}>
              <span className={styles.word}>WE</span>{' '}
              <span className={styles.word}>CRAFT</span>{' '}
              <span className={styles.wordHighlight}>RADICAL</span>
            </span>
            <span className={styles.line}>
              <span className={styles.wordGradient}>DIGITAL</span>{' '}
              <span className={styles.word}>FUTURES</span>
            </span>
          </h1>
        </div>

        {/* Narrative & High-Converting CTA Row */}
        <div className={styles.bottomRow}>
          <p className={styles.leadNarrative}>
            Transcending conventional web design through bespoke 3D motion, WebGL shaders,
            and engineering excellence for visionary brands worldwide.
          </p>

          <div className={styles.ctaGroup}>
            <a href="#projects" className={styles.btnExplore}>
              <span className={styles.btnText}>EXPLORE SELECTED WORK</span>
              <span className={styles.btnIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </span>
            </a>

            <button
              type="button"
              className={styles.btnReel}
              onClick={() => setIsPlayingReel(true)}
            >
              <span className={styles.playIcon}>▶</span>
              <span>PLAY SHOWREEL 2026</span>
            </button>
          </div>
        </div>

        {/* Bottom Coordinates & Live Client Metrics */}
        <div className={styles.footerMetrics}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>LOCATION</span>
            <span className={styles.metricVal}>NY • LDN • MUMBAI</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>SPECIALIZATION</span>
            <span className={styles.metricVal}>WEBGL / 3D / GSAP</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>CLIENT SATISFACTION</span>
            <span className={styles.metricVal}>99.8% VERIFIED</span>
          </div>
          <div className={styles.scrollIndicator}>
            <span>SCROLL TO EXPLORE</span>
            <span className={styles.scrollArrow}>↓</span>
          </div>
        </div>
      </div>

      {/* Cinematic Modal Showreel */}
      {isPlayingReel && (
        <div className={styles.modalOverlay} onClick={() => setIsPlayingReel(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsPlayingReel(false)}>✕</button>
            <div className={styles.videoPlayerBox}>
              <div className={styles.mockVideoGraphic}>
                <div className={styles.filmReelText}>TRIONN CINEMATIC SHOWREEL // 4K 60FPS</div>
                <div className={styles.filmReelPulse}>▶</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
