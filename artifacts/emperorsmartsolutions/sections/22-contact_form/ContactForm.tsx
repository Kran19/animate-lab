import React from 'react';
import styles from './ContactForm.module.css';

export interface ContactFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ContactForm: React.FC<ContactFormProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
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
    </section>
  );
};

export default ContactForm;
