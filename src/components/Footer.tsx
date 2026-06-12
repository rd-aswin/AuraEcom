'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to Aura updates!');
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <Leaf className={styles.logoIcon} size={28} fill="currentColor" />
            <span>Aura</span>
          </Link>
          <p className={styles.brandDesc}>
            Curating premium organic products for your skincare, wellness, and lifestyle. Made from natural, ethically sourced botanical ingredients.
          </p>
        </div>

        <div>
          <h3 className={styles.title}>Shop</h3>
          <ul className={styles.list}>
            <li><Link href="/?category=skincare" className={styles.link}>Skincare</Link></li>
            <li><Link href="/?category=teas" className={styles.link}>Botanical Teas</Link></li>
            <li><Link href="/?category=wellness" className={styles.link}>Wellness</Link></li>
            <li><Link href="/?category=new" className={styles.link}>New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Aura</h3>
          <ul className={styles.list}>
            <li><Link href="/#about" className={styles.link}>Our Story</Link></li>
            <li><Link href="/#philosophy" className={styles.link}>Philosophy</Link></li>
            <li><Link href="/#sustainability" className={styles.link}>Sustainability</Link></li>
            <li><Link href="/#careers" className={styles.link}>Careers</Link></li>
          </ul>
        </div>

        <div className={styles.newsletterCol}>
          <h3 className={styles.title}>Newsletter</h3>
          <p className={styles.newsletterText}>
            Subscribe to receive botanical tips, product announcements, and exclusive offers.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.input}
              required
            />
            <button type="submit" className={styles.submitBtn} aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>&copy; {new Date().getFullYear()} Aura E-Store. All rights reserved.</p>
        <p>Crafted for sustainable and healthy living.</p>
      </div>
    </footer>
  );
}
