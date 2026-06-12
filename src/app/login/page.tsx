'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/';

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        router.push(redirectPath);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // If email confirmation is enabled in Supabase, data.session will be null
        if (data.user && !data.session) {
          setSuccessMsg('Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          setFullName('');
        } else {
          // Email confirmation disabled, logged in immediately
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push(redirectPath);
            router.refresh();
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <Leaf className={styles.logoIcon} size={32} fill="currentColor" />
              <span>Aura</span>
            </div>
            <p className={styles.tagline}>Curating pure and conscious botanical essentials.</p>
          </div>

          {/* Login/Signup Tabs */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'signin' ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              Create Account
            </button>
          </div>

          {/* Feedback boxes */}
          {errorMsg && (
            <div className={styles.errorBox}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className={styles.successBox}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form className={styles.form} onSubmit={handleAuth}>
            {activeTab === 'signup' && (
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
            )}

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

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Register'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <div className="skeleton" style={{ width: '400px', height: '480px', borderRadius: '16px' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
