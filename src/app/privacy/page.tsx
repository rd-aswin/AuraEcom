'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.meta}>Last Updated: July 5, 2026</div>

        <div className={styles.content}>
          <p>
            At Aura E-Store, operated under the legal entity name <strong>R.D. Aswin</strong>, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, and share information when you visit or make a purchase from our website.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            When you visit the site, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. This includes:
          </p>
          <ul>
            <li>Personal details such as name, email address, shipping address, billing address, phone number, and payment information (processed securely through our payment gateway).</li>
            <li>Usage metrics, IP address, and cookie records to optimize your shopping experiences.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use your personal information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.
          </p>

          <h2>3. Sharing Personal Information</h2>
          <p>
            We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:
          </p>
          <ul>
            <li>We use Supabase to host our database.</li>
            <li>We use secure payment gateways (like Razorpay) to handle transaction routing.</li>
            <li>We may share your Personal Information to comply with applicable laws and regulations.</li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>
            When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to erase this information.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>aswinsithara@gmail.com</strong> or by mail using the details provided below:
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
