'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Home, Leaf } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard size={18} />,
      active: pathname === '/admin',
    },
    {
      label: 'Catalog',
      href: '/admin/products',
      icon: <Package size={18} />,
      active: pathname === '/admin/products',
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingBag size={18} />,
      active: pathname === '/admin/orders',
    },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Leaf className={styles.sidebarIcon} size={24} fill="currentColor" />
          <span>Aura Admin</span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.activeLink : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '20px 0', padding: 0 }} />

          <Link href="/" className={styles.navLink}>
            <Home size={18} />
            <span>Storefront</span>
          </Link>
        </nav>
      </aside>

      {/* Viewport Canvas */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
