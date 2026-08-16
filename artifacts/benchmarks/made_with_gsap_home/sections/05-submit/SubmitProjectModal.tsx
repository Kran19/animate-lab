import React from 'react';
import styles from './SubmitProjectModal.module.css';

export const SubmitProjectModal: React.FC = () => {
  return (
    <div className={styles.root}>
      <section className="mwg-sub"><h2>SUBMIT YOUR PROJECT</h2><button>SUBMIT URL</button></section>
    </div>
  );
};
