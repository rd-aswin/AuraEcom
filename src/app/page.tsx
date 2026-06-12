'use client';

import React, { useState, useEffect } from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/context/CartContext';
import styles from './page.module.css';

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback to mock products if table is empty
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Supabase fetch failed or not configured, using fallback mock data:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const defaultCats = ['Skincare', 'Botanical Teas', 'Wellness'];
  const customCats = Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => !!cat)))
    .filter(cat => !defaultCats.includes(cat));
  const categories = ['All', ...defaultCats, ...customCats];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flexGrow: 1 }}>
        {/* Hero Banner Section */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroContent}`}>
            <span className={styles.heroSubtitle}>Ethical. Pure. Botanical.</span>
            <h1 className={styles.heroTitle}>Nourish Your Body with Nature&apos;s Essence</h1>
            <p className={styles.heroText}>
              Carefully curated organic skincare, wellness elixirs, and hand-blended loose leaf teas crafted from sustainably grown botanical ingredients. Pure beauty, zero compromises.
            </p>
            <div className={styles.heroActions}>
              <a href="#shop" className="btn btn-primary">
                Shop Collection
              </a>
              <a href="#story" className="btn btn-secondary">
                Our Story
              </a>
            </div>
          </div>
        </section>

        {/* Catalog Showcase Section */}
        <section id="shop" className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>The Botanical Collection</h2>
              <p className={styles.sectionDesc}>
                Explore our hand-pressed elixirs, natural clay masks, and organic wellness essentials.
              </p>
            </div>

            {/* Category Navigation Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '48px',
              flexWrap: 'wrap'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 20px', borderRadius: '24px', fontSize: '0.88rem' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className={styles.grid}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
                    <div className="skeleton" style={{ width: '100%', paddingTop: '100%' }} />
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                      <div className="skeleton" style={{ width: '60%', height: '24px' }} />
                      <div className="skeleton" style={{ width: '100%', height: '16px' }} />
                      <div className="skeleton" style={{ width: '80%', height: '16px' }} />
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: '30%', height: '28px' }} />
                        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Brand Story / About Section */}
        <section id="story" className={styles.aboutSection}>
          <div className="container">
            <div className={styles.aboutContent}>
              <div className={styles.aboutHeader}>
                <h2 className={styles.aboutTitle}>Formulated with Conscious Intention</h2>
                <div className={styles.aboutText}>
                  <p>
                    Aura was born from a desire to return to the simplicity of natural apothecary. We believe that true wellness and skincare should nourish your skin and soul without costing the earth.
                  </p>
                  <p>
                    Every formulation is hand-pressed, batch-tested, and packaged in fully recyclable amber glass to preserve active plant nutrients.
                  </p>
                </div>
              </div>

              {/* Philosophy Grid */}
              <div className={styles.philosophyGrid}>
                <div className={styles.philosophyCard}>
                  <Leaf className={styles.philosophyIcon} size={28} />
                  <h3 className={styles.philosophyTitle}>100% Organic</h3>
                  <p className={styles.philosophyText}>
                    Distilled from ethically farmed wild plants, completely free of synthetic parabens or fillers.
                  </p>
                </div>

                <div className={styles.philosophyCard}>
                  <ShieldCheck className={styles.philosophyIcon} size={28} />
                  <h3 className={styles.philosophyTitle}>Pure & Safe</h3>
                  <p className={styles.philosophyText}>
                    Hypoallergenic recipes dermatologically checked for sensitive skin types.
                  </p>
                </div>

                <div className={styles.philosophyCard}>
                  <Heart className={styles.philosophyIcon} size={28} />
                  <h3 className={styles.philosophyTitle}>Sustainable</h3>
                  <p className={styles.philosophyText}>
                    Fair trade sourcing and biodegradable packing materials supporting reforestation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
