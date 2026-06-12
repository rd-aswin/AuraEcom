'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './success.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'unknown';

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Check size={36} strokeWidth={2.5} />
      </div>

      <h1 className={styles.title}>Payment Received</h1>
      
      <p className={styles.message}>
        Thank you for choosing Aura. We have verified your payment, and a confirmation email containing your invoice has been sent to your inbox.
      </p>

      <div className={styles.orderCard}>
        <span className={styles.orderLabel}>Order Reference</span>
        <span className={styles.orderValue}>#{orderId}</span>
      </div>

      <Link href="/" style={{ width: '100%' }}>
        <button type="button" className={`btn btn-primary ${styles.ctaBtn}`}>
          Continue Shopping
        </button>
      </Link>

      <div className={styles.footerNote}>
        <ShieldCheck size={16} />
        <span>Secure Transaction Completed</span>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <main className={styles.main}>
        <Suspense fallback={
          <div className={styles.container}>
            <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: '60%', height: '32px', marginTop: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '48px', marginTop: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '64px', borderRadius: '8px', marginTop: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '16px' }} />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
