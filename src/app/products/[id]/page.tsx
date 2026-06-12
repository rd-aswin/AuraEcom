'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Plus, Minus, ArrowLeft, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { useCart, Product } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import styles from './product.module.css';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Aura Botanical Face Oil',
    description: 'A luxurious blend of organic rosehip, jojoba, and jasmine essential oils to deeply nourish and restore your skin\'s natural glow.',
    price: 48.00,
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600',
    category: 'Skincare'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    title: 'Restorative Green Clay Mask',
    description: 'French green clay infused with botanical extracts of chamomile and calendula to detoxify pores and soothe irritation.',
    price: 36.00,
    stock_quantity: 8,
    image_url: 'https://images.unsplash.com/photo-1567894192231-d22d9c1349db?q=80&w=600',
    category: 'Skincare'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    title: 'Calming Lavender Mist',
    description: 'Pure organic lavender hydrosol distilled from freshly harvested blossoms. Soothes, hydrates, and balances all skin types.',
    price: 24.00,
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600',
    category: 'Wellness'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    title: 'Nourishing Herbal Tea Blend',
    description: 'A calming loose leaf blend of chamomile, sweet peppermint, and lemon balm. Naturally caffeine-free and hand-blended.',
    price: 18.00,
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600',
    category: 'Botanical Teas'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    title: 'Rejuvenating Salt Body Scrub',
    description: 'Exfoliating pink Himalayan salt crystals combined with nourishing sweet almond oil and refreshing eucalyptus leaf oils.',
    price: 32.00,
    stock_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600',
    category: 'Wellness'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    title: 'Cedarwood Botanical Soap Bar',
    description: 'Cold-processed organic olive and coconut oil soap block. Scented with warm cedarwood bark and refreshing sweet orange.',
    price: 12.00,
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1607006342465-b77d6f519504?q=80&w=600',
    category: 'Wellness'
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const productId = params?.id as string;

  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(data);
        } else {
          // Fallback
          const mock = MOCK_PRODUCTS.find((p) => p.id === productId);
          setProduct(mock || null);
        }
      } catch (err) {
        console.warn('Supabase product fetch failed, searching in mock data:', err);
        const mock = MOCK_PRODUCTS.find((p) => p.id === productId);
        setProduct(mock || null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleQtyChange = (val: number) => {
    if (!product) return;
    const stockLimit = product.stock_quantity || 99;
    setQuantity(Math.max(1, Math.min(val, stockLimit)));
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`container ${styles.main}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', marginTop: '40px' }}>
            <div className="skeleton" style={{ width: '100%', paddingTop: '100%', borderRadius: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="skeleton" style={{ width: '30%', height: '20px' }} />
              <div className="skeleton" style={{ width: '80%', height: '48px' }} />
              <div className="skeleton" style={{ width: '40%', height: '32px' }} />
              <div className="skeleton" style={{ width: '100%', height: '100px' }} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={`container ${styles.main}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
          <AlertCircle size={48} className="text-accent" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '8px' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The product you are looking for does not exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <CartDrawer />

      <main className={`container ${styles.main}`}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Shop</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <span className={styles.breadcrumbLink}>{product.category}</span>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{product.title}</span>
        </div>

        {/* Product Details Section */}
        <div className={styles.grid}>
          {/* Left Column: Image */}
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'}
              alt={product.title}
              className={styles.image}
            />
          </div>

          {/* Right Column: Details */}
          <div className={styles.details}>
            <div>
              {product.category && <span className={styles.category}>{product.category}</span>}
              <h1 className={styles.title} style={{ marginTop: '8px' }}>{product.title}</h1>
            </div>

            <div className={styles.price}>₹{product.price.toFixed(2)}</div>

            <p className={styles.description}>{product.description}</p>

            {/* Spec Sheet / Meta info */}
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Availability</span>
                <span className={styles.metaValue}>
                  {product.stock_quantity > 0 ? (
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                      In Stock ({product.stock_quantity} units left)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Out of Stock</span>
                  )}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ingredients</span>
                <span className={styles.metaValue}>100% Organic, vegan, and cruelty-free ingredients.</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Packaging</span>
                <span className={styles.metaValue}>Recyclable amber glass container, biodegradable box.</span>
              </div>
            </div>

            {/* Quantity Selector & Add Button */}
            {product.stock_quantity > 0 ? (
              <div className={styles.purchaseBlock}>
                <div className={styles.qtyWrapper}>
                  <button 
                    type="button" 
                    className={styles.qtyBtn}
                    onClick={() => handleQtyChange(quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qtyVal}>{quantity}</span>
                  <button 
                    type="button" 
                    className={styles.qtyBtn}
                    onClick={() => handleQtyChange(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`btn btn-primary ${styles.addToCartBtn}`}
                  onClick={() => addToCart(product, quantity)}
                >
                  Add to Shopping Bag
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-disabled" style={{ height: '48px' }}>
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
