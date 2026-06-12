'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUserSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          setFullName(user.user_metadata?.full_name || '');
        }
      } catch (err) {
        console.warn('Checkout loadUserSession failed:', err);
      }
    }
    loadUserSession();
  }, [supabase.auth]);

  // If cart is empty, redirect user after a few seconds or show banner
  const isCartEmpty = cart.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCartEmpty) return;

    setLoading(true);

    try {
      // 1. Call api to create order
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerInfo: {
            fullName,
            email,
            street,
            city,
            state,
            zip,
            country,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      const { order, keyId, internalOrderId } = data;

      // 2. Open Razorpay Checkout modal
      // If Razorpay script isn't loaded (e.g. blocked or offline), or keyId is placeholder
      if (typeof window === 'undefined' || !(window as any).Razorpay || !keyId || keyId.includes('your-')) {
        console.warn('Razorpay SDK not loaded or keys are missing. Simulating sandbox success...');
        
        // Simulate webhook call to backend verify
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 9),
            orderId: order?.id || 'order_mock_' + Math.random().toString(36).substring(2, 9),
            signature: 'sig_mock_verified',
            internalOrderId,
            mockCustomer: {
              fullName,
              email,
            },
            mockItems: cart.map((item) => ({
              title: item.product.title,
              quantity: item.quantity,
              price: item.product.price,
            })),
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          router.push(`/checkout/success?orderId=${internalOrderId}`);
        } else {
          throw new Error(verifyData.error || 'Verification failed');
        }
        return;
      }

      // Live Razorpay popup trigger
      const options = {
        key: keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'Aura Organic Store',
        description: 'Thank you for choosing Aura',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                internalOrderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/checkout/success?orderId=${internalOrderId}`);
            } else {
              alert('Signature verification failed: ' + (verifyData.error || 'Unknown error'));
            }
          } catch (err) {
            console.error('Payment verification request failed:', err);
            alert('Failed to contact verification server.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
        },
        theme: {
          color: '#1E352C', // Botanical Forest Green Theme Accent
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Checkout failed to initialize.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={`container ${styles.main}`}>
        {/* Load Razorpay script asynchronously */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload" 
        />
        <h1 className={styles.title}>Checkout</h1>

        {isCartEmpty ? (
          <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <ShoppingBag size={48} className="text-secondary" strokeWidth={1} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Your Bag is Empty</h2>
            <p style={{ color: 'var(--text-muted)' }}>You must add items to your cart before checking out.</p>
            <Link href="/" className="btn btn-primary">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className={styles.formSection}>
              <div>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div>
                <h2 className={styles.sectionTitle}>Shipping Address</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName" className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="street" className={styles.label}>Street Address</label>
                    <input
                      type="text"
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Botanical Ave"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="city" className={styles.label}>City</label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Portland"
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="state" className={styles.label}>State / Province</label>
                      <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Oregon"
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="zip" className={styles.label}>ZIP / Postal Code</label>
                      <input
                        type="text"
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="97201"
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="country" className={styles.label}>Country</label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={styles.input}
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className={styles.sectionTitle}>Payment</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'var(--background)' }}>
                  <CreditCard size={20} className="text-secondary" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    Secure Payment Gateway via Razorpay (Staging)
                  </span>
                </div>
              </div>
            </form>

            {/* Right Column: Order Summary */}
            <div className={styles.summarySection}>
              <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Order Summary</h2>
              
              {/* Product items list */}
              <div className={styles.itemList}>
                {cart.map((item) => (
                  <div key={item.product.id} className={styles.itemRow}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image_url} alt={item.product.title} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.product.title}</div>
                      <div className={styles.itemMeta}>Qty: {item.quantity}</div>
                    </div>
                    <div className={styles.itemPrice}>₹{(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Free</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Taxes (Estimated)</span>
                  <span>$0.00</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalPrice}>₹{cartTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                {loading ? 'Processing...' : `Pay ₹${cartTotal.toFixed(2)}`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
                <ShieldCheck size={16} className="text-secondary" />
                <span>SSL Encrypted Transaction</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
