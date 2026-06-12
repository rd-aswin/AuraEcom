'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { 
    cart, 
    cartTotal, 
    isDrawerOpen, 
    closeDrawer, 
    updateQuantity, 
    removeFromCart 
  } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (err) {
        console.warn('CartDrawer auth check failed:', err);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={`${styles.overlay} ${isDrawerOpen ? styles.overlayOpen : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <ShoppingBag size={22} className="text-primary" />
            <span>Shopping Bag</span>
          </h2>
          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={closeDrawer}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div className={styles.itemList}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} className={styles.emptyIcon} strokeWidth={1} />
              <p>Your shopping bag is empty.</p>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={closeDrawer}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className={styles.itemCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.product.image_url} 
                  alt={item.product.title} 
                  className={styles.itemImage} 
                />
                
                <div className={styles.itemDetails}>
                  <div>
                    <h4 className={styles.itemTitle}>{item.product.title}</h4>
                    <span className={styles.itemPrice}>₹{item.product.price.toFixed(2)}</span>
                  </div>

                  <div className={styles.quantityControls}>
                    <button 
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className={styles.qtyVal}>{item.quantity}</span>
                    <button 
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  className={styles.deleteBtn}
                  onClick={() => removeFromCart(item.product.id)}
                  aria-label={`Remove ${item.product.title} from shopping bag`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalPrice}>₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <Link 
              href={isLoggedIn ? "/checkout" : "/login?redirect=/checkout"} 
              className={styles.checkoutLink}
              onClick={closeDrawer}
            >
              <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
                {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
