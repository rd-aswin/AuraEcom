'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import styles from './orders.module.css';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_gateway: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('id, created_at, status, total_amount, payment_gateway')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
      } finally {
        setLoading(false);
      }
    }

    setTimeout(() => {
      fetchOrders();
    }, 0);
  }, [supabase]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.badgePending;
      case 'paid':
        return styles.badgePaid;
      case 'shipped':
        return styles.badgeShipped;
      case 'delivered':
        return styles.badgeDelivered;
      case 'cancelled':
        return styles.badgeCancelled;
      default:
        return '';
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={`container ${styles.main}`}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>Track your purchases and view order summaries.</p>

        {loading ? (
          <div className={styles.ordersList}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="skeleton" style={{ height: '140px', borderRadius: '16px', marginBottom: '20px' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} className="text-secondary" strokeWidth={1} />
            <h2 className={styles.emptyTitle}>No Orders Yet</h2>
            <p className={styles.emptyText}>
              It looks like you haven&apos;t placed any orders yet. Explore our botanical essentials and find your perfect ritual.
            </p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Shop Catalog
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.colLabel} style={{ display: 'block', marginBottom: '4px' }}>Order Reference</span>
                    <span className={styles.orderId}>#{order.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.orderSummaryGrid}>
                  <div className={styles.summaryCol}>
                    <span className={styles.colLabel}>Date Placed</span>
                    <span className={styles.colValue}>
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className={styles.summaryCol}>
                    <span className={styles.colLabel}>Total Paid</span>
                    <span className={styles.priceValue}>₹{Number(order.total_amount).toFixed(2)}</span>
                  </div>

                  <div className={styles.summaryCol}>
                    <span className={styles.colLabel}>Payment Method</span>
                    <span className={styles.colValue} style={{ textTransform: 'capitalize' }}>
                      {order.payment_gateway}
                    </span>
                  </div>

                  <div className={styles.btnCol}>
                    <Link href={`/orders/${order.id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.88rem' }}>
                      Track Order <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
