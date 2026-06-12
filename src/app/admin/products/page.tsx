'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary-client';
import { Product } from '@/context/CartContext';
import styles from '../admin.module.css';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', title: 'Aura Botanical Face Oil', description: 'Organic elixir.', price: 48.00, stock_quantity: 12, image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600', category: 'Skincare' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', title: 'Restorative Green Clay Mask', description: 'French clay.', price: 36.00, stock_quantity: 8, image_url: 'https://images.unsplash.com/photo-1567894192231-d22d9c1349db?q=80&w=600', category: 'Skincare' }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('Skincare');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Skincare', 'Botanical Teas', 'Wellness']);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const loadProducts = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setProducts(data);
        const uniqueCats = Array.from(new Set(data.map((p) => p.category).filter(Boolean))) as string[];
        setCategories(Array.from(new Set(['Skincare', 'Botanical Teas', 'Wellness', ...uniqueCats])));
      } else {
        const uniqueCats = Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category).filter(Boolean))) as string[];
        setCategories(Array.from(new Set(['Skincare', 'Botanical Teas', 'Wellness', ...uniqueCats])));
      }
    } catch (err) {
      console.warn('Fallback products loaded (Supabase offline/not seeded):', err);
      const uniqueCats = Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category).filter(Boolean))) as string[];
      setCategories(Array.from(new Set(['Skincare', 'Botanical Teas', 'Wellness', ...uniqueCats])));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    setTimeout(() => {
      loadProducts();
    }, 0);
  }, [loadProducts]);

  const handleOpenAddModal = () => {
    setCurrentProduct(null);
    setTitle('');
    setDescription('');
    setPrice(0);
    setStock(0);
    setCategory('Skincare');
    setCustomCategory('');
    setIsCustomCategory(false);
    setImageUrl('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setCurrentProduct(product);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stock_quantity);
    setCategory(product.category || 'Skincare');
    setCustomCategory('');
    setIsCustomCategory(false);
    setImageUrl(product.image_url || '');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Direct browser-to-Cloudinary signed upload
      const secureUrl = await uploadToCloudinary(file);
      setImageUrl(secureUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Cloudinary upload failed. Check environment variables: Cloud name and credentials must be set.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product deleted successfully.');
    } catch (err) {
      // Mock delete
      setProducts(prev => prev.filter(p => p.id !== id));
      console.warn('Fallback deleted product from memory state:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      alert('Please specify a category');
      return;
    }

    const payload = {
      title,
      description,
      price: Number(price),
      stock_quantity: Number(stock),
      category: finalCategory,
      image_url: imageUrl,
    };

    try {
      if (currentProduct?.id) {
        // Edit mode
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', currentProduct.id);

        if (error) throw error;
        
        alert('Product updated successfully.');
        if (isCustomCategory && !categories.includes(finalCategory)) {
          setCategories(prev => [...prev, finalCategory]);
        }
        loadProducts();
      } else {
        // Add mode
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;

        alert('Product created successfully.');
        if (isCustomCategory && !categories.includes(finalCategory)) {
          setCategories(prev => [...prev, finalCategory]);
        }
        loadProducts();
      }
      setModalOpen(false);
    } catch (err: unknown) {
      console.warn('Supabase offline. Saving changes to memory status:', err);
      if (isCustomCategory && !categories.includes(finalCategory)) {
        setCategories(prev => [...prev, finalCategory]);
      }
      if (currentProduct?.id) {
        setProducts(prev =>
          prev.map(p => (p.id === currentProduct.id ? { ...p, ...payload } : p))
        );
      } else {
        const mockNew: Product = {
          id: 'mock_prod_' + Math.random().toString(36).substring(2, 9),
          ...payload,
        };
        setProducts(prev => [mockNew, ...prev]);
      }
      setModalOpen(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Catalog Manager</h1>
        <button type="button" className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className={styles.tableCard}>
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '16px' }} />
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Image</th>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Stock</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={styles.tr}>
                    <td className={styles.td}>
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.title}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--background)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className={styles.td} style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                      {product.title}
                    </td>
                    <td className={styles.td}>{product.category}</td>
                    <td className={styles.td} style={{ fontWeight: 500, color: 'var(--accent)' }}>
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className={styles.td}>
                      <span style={{ color: product.stock_quantity <= 3 ? '#DC2626' : 'inherit', fontWeight: product.stock_quantity <= 3 ? 600 : 'normal' }}>
                        {product.stock_quantity} units
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => handleOpenEditModal(product)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#DC2626' }}
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button type="button" className={styles.modalClose} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Product Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Aura Hydrating Essence"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter botanical specs..."
                    className={styles.input}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  {isCustomCategory ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category name..."
                        className={styles.input}
                        style={{ flexGrow: 1 }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory(categories[0] || 'Skincare');
                        }}
                        style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === 'NEW_CATEGORY') {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className={styles.input}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="NEW_CATEGORY">+ Add Custom Category...</option>
                    </select>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Product Image</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>
                  {imageUrl && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{imageUrl}</span>}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
