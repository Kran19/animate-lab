import React from 'react';
import styles from './OrganicIngredientsGrid.module.css';

export const OrganicIngredientsGrid: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="ciao-ingr"><h2>CLEAN INGREDIENTS</h2><p>Ginseng • Guayusa • Lion's Mane</p></section>
    </div>
  );
};
