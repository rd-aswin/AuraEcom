'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export default function ContactUsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Contact Us</h1>
        <div className={styles.meta}>We are here to help you with your order and queries</div>

        <div className={styles.content}>
          <p>
            Have questions about our botanical collections, order shipments, or refund processes? Reach out to us, and our customer support team will get back to you within 24 to 48 business hours.
          </p>

          <div className={styles.contactCard}>
            <h2>Operational Address & Details</h2>
            
            <div className={styles.contactField}>
              <span className={styles.label}>Legal Entity Name</span>
              <span className={styles.value}>R.D. Aswin</span>
            </div>

            <div className={styles.contactField}>
              <span className={styles.label}>Registered & Operational Address</span>
              <span className={styles.value} style={{ lineHeight: '1.6' }}>
                Kanjiramvila Veedu, Sithara Junction, Kottiyam P O, Adichanalloor, Thazhuthala, Kollam, Kerala, 691571
              </span>
            </div>

            <div className={styles.contactField}>
              <span className={styles.label}>Support Email</span>
              <span className={styles.value}>
                <a href="mailto:aswinsithara@gmail.com" style={{ color: 'var(--secondary)' }}>
                  aswinsithara@gmail.com
                </a>
              </span>
            </div>

            <div className={styles.contactField}>
              <span className={styles.label}>Support Phone / Helpline</span>
              <span className={styles.value}>+91 8075483385</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
