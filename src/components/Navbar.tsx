'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Leaf } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartCount, toggleDrawer } = useCart();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const pathname = usePathname();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Navbar user check failed:', err);
      }
    }
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload(); // Refresh to trigger middleware checks if on protected route
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <Leaf className={styles.logoIcon} size={24} fill="currentColor" />
          <span>Aura</span>
        </Link>

        <nav>
          <ul className={styles.menuList}>
            <li>
              <Link href="/#shop" className={styles.menuLink} onClick={(e) => handleScroll(e, 'shop')}>
                Shop
              </Link>
            </li>
            <li>
              <Link href="/#story" className={styles.menuLink} onClick={(e) => handleScroll(e, 'story')}>
                Our Story
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <Link href="/orders" className={styles.ordersLink}>
                My Orders
              </Link>
              <span className={styles.userEmail} title={user.email}>
                {user.user_metadata?.full_name || user.email}
              </span>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.authLink}>
              Log In
            </Link>
          )}

          <button 
            type="button" 
            className={styles.cartBtn} 
            onClick={toggleDrawer}
            aria-label="Open shopping bag"
          >
            <ShoppingBag size={20} strokeWidth={2} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
