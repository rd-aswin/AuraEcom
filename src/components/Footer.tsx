'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, ArrowRight } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to Aura updates!');
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCareersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Thank you for your interest in Aura! We currently have no open positions, but please check back later.');
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
            <li><Link href="/?category=Skincare" className={styles.link}>Skincare</Link></li>
            <li><Link href="/?category=Botanical%20Teas" className={styles.link}>Botanical Teas</Link></li>
            <li><Link href="/?category=Wellness" className={styles.link}>Wellness</Link></li>
            <li><Link href="/?category=All" className={styles.link}>New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Aura</h3>
          <ul className={styles.list}>
            <li><Link href="/#story" className={styles.link} onClick={(e) => handleScroll(e, 'story')}>Our Story</Link></li>
            <li><Link href="/#philosophy" className={styles.link} onClick={(e) => handleScroll(e, 'philosophy')}>Philosophy</Link></li>
            <li><Link href="/#sustainability" className={styles.link} onClick={(e) => handleScroll(e, 'sustainability')}>Sustainability</Link></li>
            <li><Link href="/#careers" className={styles.link} onClick={handleCareersClick}>Careers</Link></li>
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
        <p>&copy; {new Date().getFullYear()} Aura E-Store (R.D. Aswin). All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/refund">Refund Policy</Link>
        </div>
        <p>Crafted for sustainable and healthy living.</p>
      </div>
    </footer>
  );
}

