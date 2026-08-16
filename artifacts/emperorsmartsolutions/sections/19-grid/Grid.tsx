import React from 'react';
import styles from './Grid.module.css';

export interface GridProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div className="grid md:grid-cols-2 gap-16 contact-container">
            <!-- Contact Information -->
            <div>
                <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-6">Get in Touch</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Want to learn more about how we can help your business thrive?
                    Reach out to us for a free consultation.
                </p>

                <div className="space-y-8">
                    <!-- Address -->
                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 24 24" data-icon="lucide:map-pin" data-width="20" className="iconify iconify--lucide"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></g></svg>
                        </div>
                        <div className="contact-details">
                            <h4>Headquarters</h4>
                            <p>2nd floor 202 ,Shiti Ratna, Commercial, Panchavati Rd, Ellisbridge, Ahmedabad, Gujarat 380006</p>
                        </div>
                    </div>

                    <!-- Email -->
                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 24 24" data-icon="lucide:mail" data-width="20" className="iconify iconify--lucide"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect width="20" height="16" x="2" y="4" rx="2"></rect></g></svg>
                        </div>
                        <div className="contact-details">
                            <h4>Email Us</h4>
                            <a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=emperorsmartsolutions@gmail.com" target="_blank" className="hover:text-gold-500 transition-colors break-all">
                                emperorsmartsolutions@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Form -->
            <div className="contact-form">
                <form id="contactForm" className="space-y-6 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="grid md:grid-cols-2 gap-8">
                        <!-- Name Field -->
                        <div className="form-group">
                            <input type="text" name="name" required="" placeholder=" " className="form-input" id="nameInput" style="">
                            <label htmlFor="nameInput" className="form-label">Name</label>
                            <div className="focus-border"></div>
                        </div>

                        <!-- Email Field -->
                        <div className="form-group">
                            <input type="email" name="email" required="" placeholder=" " className="form-input" id="emailInput" style="">
                            <label htmlFor="emailInput" className="form-label">Email</label>
                            <div className="focus-border"></div>
                        </div>
                    </div>

                    <!-- Message Field - FIXED -->
                    <div className="form-group">
                        <textarea name="message" required="" placeholder=" " className="form-input form-textarea" id="messageInput" rows="4" style=""></textarea>
                        <label htmlFor="messageInput" className="form-label">Message</label>
                        <div className="focus-border"></div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" className="submit-btn">
                        <span className="btn-text">Send Message</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="lucide:loader-2" className="btn-loader iconify animate-spin iconify--lucide"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    </section>
  );
};

export default Grid;
