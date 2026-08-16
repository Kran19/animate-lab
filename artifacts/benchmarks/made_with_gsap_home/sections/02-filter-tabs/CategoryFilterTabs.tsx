import React from 'react';
import styles from './CategoryFilterTabs.module.css';

export const CategoryFilterTabs: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="mwg-tabs"><button className="active">ALL</button><button>SCROLLTRIGGER</button><button>FLIP</button><button>WEBGL</button></section>
    </div>
  );
};
