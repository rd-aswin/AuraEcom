'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export default function AboutUsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>About Us</h1>
        <div className={styles.meta}>Last Updated: July 5, 2026</div>
        
        <div className={styles.content}>
          <p>
            Welcome to Aura E-Store, your premium destination for sustainable skincare, wellness, and healthy living. We curate only the highest quality organic products, sourced ethically from natural botanical elements.
          </p>
          <p>
            Our mission is to bring harmony and natural wellness into your daily rituals. All our ingredients are handpicked and processed under rigorous quality checks to ensure they provide you with pure, therapeutic care.
          </p>
          
          <h2>Legal Entity Information</h2>
          <p>
            This website and e-commerce platform are owned and operated under the legal entity name <strong>R.D. Aswin</strong>.
          </p>
          <p>
            For any queries regarding our botanical offerings, sustainable shipping practices, or partner programs, please feel free to reach out to our dedicated support channels on the Contact page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
