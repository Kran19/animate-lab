import React from 'react';
import styles from './BgMidnight.module.css';

export interface BgMidnightProps {
  className?: string;
  style?: React.CSSProperties;
}

export const BgMidnight: React.FC<BgMidnightProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <footer className="bg-midnight border-t border-white/5 pt-16 pb-8 relative z-50">
    <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
                <a href="index.php" className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <img src="uploads\images\ESS-logo.png" alt="Emperor Smart Solutions" className="h-16 w-auto object-contain">
                    <span className="iconify text-gold-500"></span>
                    Emperor Smart Solutions
                </a>
                <p className="text-slate-500 max-w-sm">Pioneering the future of enterprise technology through innovation, reliability, and human-centric design.</p>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                    <li><a href="index.php" className="hover:text-gold-500 cursor-pointer transition-colors">Home</a></li>
                    <li><a href="about.php" className="hover:text-gold-500 cursor-pointer transition-colors">About</a></li>
                    <li><a href="contact.php" className="hover:text-gold-500 cursor-pointer transition-colors">Contact</a></li>
                    <li><a href="services.php" className="hover:text-gold-500 cursor-pointer transition-colors">Services</a></li>
                    <li><a href="internship.php" className="hover:text-gold-500 cursor-pointer transition-colors">Apply For Internship</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Socials</h4>
                <div className="flex gap-4">
                    <a href="https://www.facebook.com/profile.php?id=61575906045475" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-midnight transition-all overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="lucide:facebook" className="iconify iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/emperor-smart-solutions/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-midnight transition-all overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="lucide:linkedin" className="iconify iconify--lucide"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></g></svg>
                    </a>
                    <a href="https://www.instagram.com/emperorsmartsolutions?igsh=aXR5YXhxMjZhYXAx" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-midnight transition-all overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="lucide:instagram" className="iconify iconify--lucide"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8A4 4 0 0 1 16 11.37m1.5-4.87h.01"></path></g></svg>
                    </a>
                </div>
            </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© 2025 Emperor Inc. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>
    </section>
  );
};

export default BgMidnight;
