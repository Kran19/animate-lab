import React from 'react';
import styles from './MaxW_7xl.module.css';

export interface MaxW_7xlProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MaxW_7xl: React.FC<MaxW_7xlProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <!-- Original Logo Structure -->
                <div className="flex items-center space-x-2 gsap-logo" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                    <a href="index.php" className="font-display text-lg tracking-widest font-semibold text-white flex items-center">
                        <img src="uploads\images\ESS-logo.png" alt="Emperor Logo" className="h-16 w-16">
                    </a>
                </div>

                <!-- Desktop Navigation with Hover Effects -->
                <div className="hidden md:flex items-center space-x-8">
                    <a href="index.php" className="relative text-slate-400 hover:text-white transition-all duration-300 font-medium group nav-item" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        Home
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                    
                    <!-- Services Dropdown for Desktop -->
                    <div className="services-dropdown relative nav-item" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        <a href="services.php" className="relative text-slate-400 hover:text-white transition-all duration-300 font-medium group flex items-center">
                            Services
                            <span className="services-chevron">
                                <i className="fas fa-chevron-down text-xs ml-1"></i>
                            </span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <!-- Dropdown Menu -->
                        <div className="dropdown-menu">
                            <a href="website-development.php" className="mobile-dropdown-item">
                               Web Development
                            </a>
                            <a href="algo-trading.php" className="mobile-dropdown-item">
                                Algo Trading
                            </a>
                            <a href="software-development.php" className="mobile-dropdown-item">
                                Software Development
                            </a>
                            <a href="application-development-service.php" className="mobile-dropdown-item">
                               Application Development
                            </a>
                            <a href="digital-marketing-services.php" className="mobile-dropdown-item">
                               Digital Marketing
                            </a>
                             <a href="ecommerce-website-design.php" className="mobile-dropdown-item">
                               Ecommerce Website Design
                            </a>
                             <a href="mlm-software-services.php" className="mobile-dropdown-item">
                               MLM Software
                            </a>
                             <a href="custom-software-services.php" className="mobile-dropdown-item">
                               Custom Software Development
                            </a>
                        </div>
                    </div>
                    
                    <a href="about.php" className="relative text-slate-400 hover:text-white transition-all duration-300 font-medium group nav-item" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        About
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                    <a href="contact.php" className="relative text-slate-400 hover:text-white transition-all duration-300 font-medium group nav-item" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        Contact
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                    <a href="blog.php" className="relative text-slate-400 hover:text-white transition-all duration-300 font-medium group nav-item" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        Blog
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                    <a href="contact.php" className="gsap-get-started" style="translate: none; rotate: none; scale: none; transform: translate(0px, 0px); opacity: 1;">
                        <button className="magnetic-btn bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full hover:shadow-2xl transition-all duration-300 font-medium relative overflow-hidden group border border-white/10 hover:border-accent/50">
                            <span className="relative z-10">Get Started</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>
                    </a>
                </div>

                <!-- Mobile Menu Button with Animation -->
                <button id="hamburger" className="md:hidden flex flex-col justify-center items-center w-10 h-10 relative z-50 focus:outline-none p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>

            <!-- Mobile Navigation Menu - Positioned absolutely under header -->
            <div id="mobile-menu" className="md:hidden">
                <div className="px-4 pt-2 pb-3 space-y-1">
                    <a href="index.php" className="mobile-menu-link">Home</a>
                    
                    <!-- Services Dropdown for Mobile -->
                    <div className="mobile-services-dropdown">
                        <a href="javascript:void(0)" className="mobile-menu-link flex items-center justify-between mobile-dropdown-trigger">
                            <span>Services</span>
                            <span className="mobile-dropdown-arrow">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </span>
                        </a>
                        <div className="mobile-dropdown-content">
                            <a href="website-development.php" className="mobile-dropdown-item">
                               Web Development
                            </a>
                            <a href="algo-trading.php" className="mobile-dropdown-item">
                                Algo Trading
                            </a>
                            <a href="software-development.php" className="mobile-dropdown-item">
                                Software Development
                            </a>
                            <a href="application-development-service.php" className="mobile-dropdown-item">
                               Application Development
                            </a>
                            <a href="digital-marketing-services.php" className="mobile-dropdown-item">
                               Digital Marketing
                            </a>
                             <a href="ecommerce-website-design.php" className="mobile-dropdown-item">
                               Ecommerce Website Design
                            </a>
                             <a href="mlm-software-services.php" className="mobile-dropdown-item">
                               MLM Software
                            </a>
                             <a href="custom-software-services.php" className="mobile-dropdown-item">
                               Custom Software Development
                            </a>
                        </div>
                    </div>
                    
                    <a href="about.php" className="mobile-menu-link">About</a>
                    <a href="contact.php" className="mobile-menu-link">Contact</a>
                    <a href="internship.php" className="mobile-menu-link">Apply For internship</a>
                    <div className="pt-4">
                        <a href="contact.php" className="block">
                            <button className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all duration-300 font-medium">
                                Get Started
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    </section>
  );
};

export default MaxW_7xl;
