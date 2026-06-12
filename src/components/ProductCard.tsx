'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useCart, Product } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.category && <span className={styles.category}>{product.category}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>
        
        <div className={styles.footer}>
          <span className={styles.price}>₹{product.price.toFixed(2)}</span>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => addToCart(product, 1)}
            aria-label={`Add ${product.title} to shopping bag`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}
