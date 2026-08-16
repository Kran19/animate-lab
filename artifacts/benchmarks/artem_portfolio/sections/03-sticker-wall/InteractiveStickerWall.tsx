import React from 'react';
import styles from './InteractiveStickerWall.module.css';

export const InteractiveStickerWall: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="artem-stick"><div className="sticker">★ COOL</div><div className="sticker">⚡ WOW</div></section>
    </div>
  );
};
