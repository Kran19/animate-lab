import React from 'react';
import styles from './ServiceCard.module.css';

export interface ServiceCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div className="service-card group p-1 gradient-border rounded-2xl transition-transform duration-300 hover:-translate-y-2" style=""><div className="bg-midnight h-full w-full rounded-xl p-8 relative overflow-hidden"><div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/20 blur-[50px] group-hover:bg-purple-600/30 transition-all duration-500"></div><div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white mb-6 border border-white/10 group-hover:border-gold-500/50 group-hover:text-gold-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24" data-icon="lucide:layout" data-width="24" className="iconify iconify--lucide"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M9 21V9"></path></g></svg></div><h4 className="text-xl font-display font-semibold text-white mb-3">Web Development</h4><p className="text-sm text-slate-400 leading-relaxed">Scalable, high-performance web applications built with modern architectures.</p></div></div>
    </section>
  );
};

export default ServiceCard;
