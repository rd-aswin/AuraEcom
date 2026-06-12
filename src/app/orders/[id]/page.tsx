'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, Package, CreditCard, Truck, Home, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import styles from '../orders.module.css';

interface ProductInfo {
  id: string;
  title: string;
  image_url: string;
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: ProductInfo | null;
}

interface OrderDetail {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment_gateway: string;
  payment_transaction_id: string | null;
  order_items: OrderItem[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrderDetails() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            shipping_address,
            payment_gateway,
            payment_transaction_id,
            order_items (
              quantity,
              price_at_purchase,
              products (
                id,
                title,
                image_url
              )
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        if (data) {
          // Cast address from JSONB
          const address = typeof data.shipping_address === 'string' 
            ? JSON.parse(data.shipping_address) 
            : data.shipping_address;

          setOrder({
            id: data.id,
            created_at: data.created_at,
            status: data.status,
            total_amount: Number(data.total_amount),
            shipping_address: address,
            payment_gateway: data.payment_gateway || 'razorpay',
            payment_transaction_id: data.payment_transaction_id,
            order_items: (data.order_items || []) as any[],
          });
        }
      } catch (err) {
        console.error('Failed to load order tracking details:', err);
      } finally {
        setLoading(false);
      }
    }

    setTimeout(() => {
      fetchOrderDetails();
    }, 0);
  }, [orderId, supabase]);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`container ${styles.main}`}>
          <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '20px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', marginTop: '20px' }}>
            <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`container ${styles.main}`} style={{ textAlign: 'center', padding: '100px 0' }}>
          <AlertTriangle size={48} className="text-accent" style={{ marginBottom: '16px' }} />
          <h2 className={styles.emptyTitle}>Order Not Found</h2>
          <p className={styles.emptyText}>We couldn&apos;t retrieve the tracking information for this order. It may not exist or belongs to another user.</p>
          <Link href="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to My Orders
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper to determine timeline step status
  const getStepStatus = (stepName: 'ordered' | 'paid' | 'shipped' | 'delivered') => {
    const current = order.status.toLowerCase();
    
    if (current === 'cancelled') {
      return 'pending';
    }

    switch (stepName) {
      case 'ordered':
        return ['pending', 'paid', 'shipped', 'delivered'].includes(current) ? 'done' : 'pending';
      case 'paid':
        return ['paid', 'shipped', 'delivered'].includes(current) ? 'done' : 'pending';
      case 'shipped':
        return ['shipped', 'delivered'].includes(current) ? 'done' : 'pending';
      case 'delivered':
        return current === 'delivered' ? 'done' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStepClass = (stepName: 'ordered' | 'paid' | 'shipped' | 'delivered') => {
    const status = getStepStatus(stepName);
    const current = order.status.toLowerCase();
    
    if (current === 'cancelled') {
      return styles.timelineStepPending;
    }
    
    if (status === 'done') {
      // Check if this is the active (most advanced) step
      if (stepName === 'delivered' && current === 'delivered') return styles.timelineStepActive;
      if (stepName === 'shipped' && current === 'shipped') return styles.timelineStepActive;
      if (stepName === 'paid' && current === 'paid') return styles.timelineStepActive;
      if (stepName === 'ordered' && current === 'pending') return styles.timelineStepActive;
      
      return styles.timelineStepDone;
    }
    
    return styles.timelineStepPending;
  };

  const formatStepDate = (stepName: 'ordered' | 'paid' | 'shipped' | 'delivered') => {
    const status = getStepStatus(stepName);
    if (status !== 'done') return '';
    return new Date(order.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={`container ${styles.main}`}>
        <Link href="/orders" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        <h1 className={styles.title} style={{ fontSize: '2.2rem', marginBottom: '24px' }}>
          Track Order #{order.id.substring(0, 8).toUpperCase()}
        </h1>

        {order.status === 'cancelled' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', marginBottom: '24px', fontSize: '0.95rem', fontWeight: 500 }}>
            <AlertTriangle size={20} />
            <span>This order was cancelled. Please contact customer support if you have questions.</span>
          </div>
        )}

        <div className={styles.detailGrid}>
          {/* Left Column: Timeline & Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            
            {/* Timeline Progress Card */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>Delivery Progress</h2>
              
              <div className={styles.timeline}>
                {/* Step 1: Ordered */}
                <div className={`${styles.timelineStep} ${getStepClass('ordered')}`}>
                  <div className={styles.timelineNode}>
                    {getStepStatus('ordered') === 'done' ? <Check size={12} /> : <Package size={12} />}
                  </div>
                  <span className={styles.stepTitle}>Order Placed</span>
                  <span className={styles.stepDesc}>
                    {getStepStatus('ordered') === 'done' 
                      ? `Your order was received on ${formatStepDate('ordered')}` 
                      : 'Awaiting order registration'}
                  </span>
                </div>

                {/* Step 2: Paid */}
                <div className={`${styles.timelineStep} ${getStepClass('paid')}`}>
                  <div className={styles.timelineNode}>
                    {getStepStatus('paid') === 'done' ? <Check size={12} /> : <CreditCard size={12} />}
                  </div>
                  <span className={styles.stepTitle}>Payment Confirmed</span>
                  <span className={styles.stepDesc}>
                    {getStepStatus('paid') === 'done' 
                      ? 'Payment verified. Preparing your botanical essentials.' 
                      : 'Awaiting payment verification'}
                  </span>
                </div>

                {/* Step 3: Shipped */}
                <div className={`${styles.timelineStep} ${getStepClass('shipped')}`}>
                  <div className={styles.timelineNode}>
                    {getStepStatus('shipped') === 'done' ? <Check size={12} /> : <Truck size={12} />}
                  </div>
                  <span className={styles.stepTitle}>Dispatched</span>
                  <span className={styles.stepDesc}>
                    {getStepStatus('shipped') === 'done' 
                      ? 'Your package is in transit with our logistics partner.' 
                      : 'Awaiting shipping fulfillment'}
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className={`${styles.timelineStep} ${getStepClass('delivered')}`}>
                  <div className={styles.timelineNode}>
                    {getStepStatus('delivered') === 'done' ? <Check size={12} /> : <Home size={12} />}
                  </div>
                  <span className={styles.stepTitle}>Delivered</span>
                  <span className={styles.stepDesc}>
                    {getStepStatus('delivered') === 'done' 
                      ? 'Order completed. Enjoy your organic self-care ritual!' 
                      : 'Parcel has not yet reached delivery destination'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment details Info */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>Delivery Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Shipping Address</span>
                  <span className={styles.infoVal}>
                    <strong>{order.shipping_address?.fullName}</strong><br />
                    {order.shipping_address?.street}<br />
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}<br />
                    {order.shipping_address?.country}
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Payment Details</span>
                  <span className={styles.infoVal}>
                    Method: <strong style={{ textTransform: 'capitalize' }}>{order.payment_gateway}</strong><br />
                    Transaction ID: {order.payment_transaction_id ? (
                      <code style={{ fontSize: '0.85rem' }}>{order.payment_transaction_id}</code>
                    ) : (
                      <em style={{ color: 'var(--text-muted)' }}>Pending</em>
                    )}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Items & Pricing Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              
              {/* Item List */}
              <div className={styles.itemList}>
                {order.order_items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    {item.products?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.products.image_url} alt={item.products.title} className={styles.itemImage} />
                    ) : (
                      <div className={styles.itemImage} style={{ backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} className="text-secondary" />
                      </div>
                    )}
                    
                    <div className={styles.itemInfo}>
                      {item.products ? (
                        <Link href={`/products/${item.products.id}`} className={styles.itemName}>
                          {item.products.title}
                        </Link>
                      ) : (
                        <span className={styles.itemName} style={{ color: 'var(--text-muted)' }}>Botanical Product</span>
                      )}
                      <span className={styles.itemMeta}>Qty: {item.quantity}</span>
                    </div>

                    <span className={styles.itemPrice}>
                      ₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Free</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
