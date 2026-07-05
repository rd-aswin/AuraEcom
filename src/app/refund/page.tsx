'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export default function RefundPolicyPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Refund & Cancellation Policy</h1>
        <div className={styles.meta}>Last Updated: July 5, 2026</div>

        <div className={styles.content}>
          <p>
            At Aura E-Store, operated under the legal entity name <strong>R.D. Aswin</strong>, customer satisfaction is our top priority. Please read our policy regarding returns, refunds, and cancellations below.
          </p>

          <h2>1. Return Policy Window</h2>
          <p>
            We offer a standard <strong>5-day return and exchange window</strong> from the date of delivery. If 5 days have passed since your purchase delivery, we unfortunately cannot offer you a refund or exchange.
          </p>
          <p>
            To be eligible for a return, your item must be unused, in the same condition that you received it, and must be in its original packaging with safety seals intact (for botanical oils, clay masks, and teas).
          </p>

          <h2>2. Refunds process</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p>
            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment (credit card, UPI, net banking, etc.) within <strong>5 to 7 business days</strong>.
          </p>

          <h2>3. Cancellations</h2>
          <p>
            You can cancel your order anytime before it has been shipped. Once your order has been dispatched from our warehouse, it cannot be cancelled. In case of cancellation before dispatch, a full refund will be initiated back to your source account.
          </p>

          <h2>4. Contact Us</h2>
          <p>
            For any return queries, please email us at <strong>aswinsithara@gmail.com</strong> or call us at <strong>+91 8075483385</strong>. You can also mail package returns to our operational headquarters address:
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
