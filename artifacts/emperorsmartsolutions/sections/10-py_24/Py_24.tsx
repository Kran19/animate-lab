import React from 'react';
import styles from './Py_24.module.css';

export interface Py_24Props {
  className?: string;
  style?: React.CSSProperties;
}

export const Py_24: React.FC<Py_24Props> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <section className="py-24 relative overflow-hidden bg-midnight"><div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-800/20 rounded-full blur-[100px] pointer-events-none"></div><div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-[80px] pointer-events-none"></div><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-16"><h2 className="text-xs font-semibold tracking-widest text-gold-500 uppercase mb-4">Client Feedback</h2><h3 className="font-display text-4xl md:text-5xl tracking-tight text-white mb-6">Trusted by Industry Leaders</h3><p className="text-slate-400 text-lg leading-relaxed max-w-3xl mx-auto"> Discover how our solutions have transformed businesses and applications for top companies worldwide. </p></div><div className="testimonials-carousel relative overflow-hidden py-10"><div className="carousel-container flex transition-transform duration-700 ease-out" id="carouselContainer" style="transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translateX(-300%);">
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Sarah Jenkins" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Sarah Jenkins</h3>
                                        <p className="text-slate-400 text-sm">CTO, TechFlow Solutions</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor transformed our legacy systems into a state-of-the-art digital ecosystem. The efficiency gains were immediate and the ROI exceeded our expectations."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Digital Transformation</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="David Chen" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">David Chen</h3>
                                        <p className="text-slate-400 text-sm">Director of Engineering, Apex Corp</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Their attention to detail and commitment to security standards is unmatched in the industry. Truly a premium partner for enterprise solutions."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Enterprise Security</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Elena Rodriguez" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Elena Rodriguez</h3>
                                        <p className="text-slate-400 text-sm">Product Lead, InnovateTech</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The UI/UX team at Emperor completely reimagined our customer journey, resulting in a 40% increase in conversion rates and improved user satisfaction."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">UI/UX Design</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Michael Thompson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Michael Thompson</h3>
                                        <p className="text-slate-400 text-sm">CEO, FinanceFirst</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's algorithmic trading platform increased our trading efficiency by 60% and reduced operational costs significantly. Outstanding technical expertise."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Algorithmic Trading</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Dr. Priya Sharma" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Dr. Priya Sharma</h3>
                                        <p className="text-slate-400 text-sm">CIO, MedTech Innovations</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The healthcare management system they built handles 50,000+ patients seamlessly. The real-time analytics and compliance features are exceptional."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Healthcare Technology</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="James Wilson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">James Wilson</h3>
                                        <p className="text-slate-400 text-sm">VP Technology, GlobalTrade</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's cloud infrastructure solutions improved our system reliability to 99.9% uptime and reduced our operational overhead by 35%."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Cloud Solutions</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Sarah Jenkins" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Sarah Jenkins</h3>
                                        <p className="text-slate-400 text-sm">CTO, TechFlow Solutions</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor transformed our legacy systems into a state-of-the-art digital ecosystem. The efficiency gains were immediate and the ROI exceeded our expectations."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Digital Transformation</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="David Chen" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">David Chen</h3>
                                        <p className="text-slate-400 text-sm">Director of Engineering, Apex Corp</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Their attention to detail and commitment to security standards is unmatched in the industry. Truly a premium partner for enterprise solutions."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Enterprise Security</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Elena Rodriguez" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Elena Rodriguez</h3>
                                        <p className="text-slate-400 text-sm">Product Lead, InnovateTech</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The UI/UX team at Emperor completely reimagined our customer journey, resulting in a 40% increase in conversion rates and improved user satisfaction."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">UI/UX Design</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Michael Thompson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Michael Thompson</h3>
                                        <p className="text-slate-400 text-sm">CEO, FinanceFirst</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's algorithmic trading platform increased our trading efficiency by 60% and reduced operational costs significantly. Outstanding technical expertise."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Algorithmic Trading</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide center">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Dr. Priya Sharma" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Dr. Priya Sharma</h3>
                                        <p className="text-slate-400 text-sm">CIO, MedTech Innovations</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The healthcare management system they built handles 50,000+ patients seamlessly. The real-time analytics and compliance features are exceptional."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Healthcare Technology</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="James Wilson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">James Wilson</h3>
                                        <p className="text-slate-400 text-sm">VP Technology, GlobalTrade</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's cloud infrastructure solutions improved our system reliability to 99.9% uptime and reduced our operational overhead by 35%."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Cloud Solutions</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Sarah Jenkins" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Sarah Jenkins</h3>
                                        <p className="text-slate-400 text-sm">CTO, TechFlow Solutions</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor transformed our legacy systems into a state-of-the-art digital ecosystem. The efficiency gains were immediate and the ROI exceeded our expectations."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Digital Transformation</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="David Chen" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">David Chen</h3>
                                        <p className="text-slate-400 text-sm">Director of Engineering, Apex Corp</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Their attention to detail and commitment to security standards is unmatched in the industry. Truly a premium partner for enterprise solutions."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Enterprise Security</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Elena Rodriguez" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Elena Rodriguez</h3>
                                        <p className="text-slate-400 text-sm">Product Lead, InnovateTech</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The UI/UX team at Emperor completely reimagined our customer journey, resulting in a 40% increase in conversion rates and improved user satisfaction."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">UI/UX Design</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Michael Thompson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Michael Thompson</h3>
                                        <p className="text-slate-400 text-sm">CEO, FinanceFirst</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's algorithmic trading platform increased our trading efficiency by 60% and reduced operational costs significantly. Outstanding technical expertise."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Algorithmic Trading</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="Dr. Priya Sharma" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">Dr. Priya Sharma</h3>
                                        <p className="text-slate-400 text-sm">CIO, MedTech Innovations</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "The healthcare management system they built handles 50,000+ patients seamlessly. The real-time analytics and compliance features are exceptional."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Healthcare Technology</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className="carousel-slide">
                            <div className="testimonial-card p-8 relative testimonial-content group h-full">
                                <div className="quote-mark">"</div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=300&amp;q=80" alt="James Wilson" className="w-16 h-16 rounded-full object-cover border-4 border-royal-800 shadow-lg">
                                        <div className="verified-badge animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white text-lg">James Wilson</h3>
                                        <p className="text-slate-400 text-sm">VP Technology, GlobalTrade</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 mb-6">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "Emperor's cloud infrastructure solutions improved our system reliability to 99.9% uptime and reduced our operational overhead by 35%."
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-sm text-slate-500">Cloud Solutions</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-800/20 to-gold-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:check" data-width="16" className="iconify text-gold-500 iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div></div></div></section>
    </section>
  );
};

export default Py_24;
