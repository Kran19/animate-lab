import React from 'react';
import styles from './ContactDetails.module.css';

export interface ContactDetailsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ className = '', style }) => {
  return (
    <section className={`${styles.root} ${className}`} style={style}>
      <div className="contact-details">
                            <h4>Headquarters</h4>
                            <p>2nd floor 202 ,Shiti Ratna, Commercial, Panchavati Rd, Ellisbridge, Ahmedabad, Gujarat 380006</p>
                        </div>
    </section>
  );
};

export default ContactDetails;
