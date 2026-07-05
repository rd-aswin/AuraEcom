'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <div className={styles.meta}>Last Updated: July 5, 2026</div>

        <div className={styles.content}>
          <p>
            Please read these Terms & Conditions carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms & Conditions. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
          </p>

          <h2>1. Overview</h2>
          <p>
            This website is operated by <strong>R.D. Aswin</strong>. Throughout the site, the terms "we", "us" and "our" refer to the legal entity <strong>R.D. Aswin</strong>. We offer this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
          </p>

          <h2>2. E-Commerce Terms</h2>
          <p>
            By agreeing to these Terms & Conditions, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
          </p>

          <h2>3. Modifications to the Service and Prices</h2>
          <p>
            Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </p>

          <h2>4. Accuracy of Billing and Account Information</h2>
          <p>
            We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms & Conditions and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India, with jurisdiction in Kollam, Kerala.
          </p>

          <h2>6. Contact Information</h2>
          <p>
            Questions about the Terms & Conditions should be sent to us at <strong>aswinsithara@gmail.com</strong> or using the physical mail details below:
          </p>
          <p style={{ fontStyle: 'italic' }}>
            R.D. Aswin<br />
            Kanjiramvila Veedu, Sithara Junction, Kottiyam P O, Adichanalloor, Thazhuthala, Kollam, Kerala, 691571
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
