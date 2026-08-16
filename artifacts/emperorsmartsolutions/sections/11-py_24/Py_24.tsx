import React from 'react';
import styles from './Py_24.module.css';

export interface Py_24Props {
  className?: string;
  style?: React.CSSProperties;
}

export const Py_24: React.FC<Py_24Props> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <section className="py-24 px-6"><div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-20 relative overflow-hidden bg-gradient-to-br from-royal-900 via-purple-900 to-midnight border border-white/10 text-center"><div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div><h2 className="text-3xl md:text-5xl font-display font-semibold text-white mb-6">Ready to Scale Your Enterprise?</h2><p className="text-slate-300 max-w-xl mx-auto mb-10">Join industry leaders who have accelerated their digital journey with our bespoke solutions.</p><button className="relative group px-8 py-4 bg-white text-midnight font-bold rounded-lg overflow-hidden"><div className="absolute inset-0 w-full h-full bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div><span className="relative z-10 flex items-center gap-2"> Start Your Project <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="lucide:arrow-right" className="iconify group-hover:translate-x-1 transition-transform iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7l-7 7"></path></svg></span></button></div></section>
    </section>
  );
};

export default Py_24;
