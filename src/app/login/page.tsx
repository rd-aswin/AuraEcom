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

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(
    searchParams?.get('reset') === 'true' ? 'reset' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      } else if (activeTab === 'signup') {
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
      } else if (activeTab === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/login?reset=true`,
        });

        if (error) throw error;

        setSuccessMsg('Password reset link sent! Please check your email.');
        setEmail('');
      } else if (activeTab === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        setSuccessMsg('Password reset successfully! Redirecting...');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1500);
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
          {(activeTab === 'signin' || activeTab === 'signup') ? (
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
          ) : (
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--primary)' }}>
                {activeTab === 'forgot' ? 'Reset Password' : 'Create New Password'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeTab === 'forgot' 
                  ? 'We will send a secure recovery link to your email address.' 
                  : 'Enter your new secure password below.'}
              </p>
            </div>
          )}

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

            {activeTab !== 'reset' && (
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
            )}

            {activeTab !== 'forgot' && (
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  {activeTab === 'reset' ? 'New Password' : 'Password'}
                </label>
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
            )}

            {activeTab === 'signin' && (
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => {
                  setActiveTab('forgot');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                Forgot Password?
              </button>
            )}

            {activeTab === 'reset' && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {loading ? 'Processing...' : 
               activeTab === 'signin' ? 'Sign In' : 
               activeTab === 'signup' ? 'Register' : 
               activeTab === 'forgot' ? 'Send Reset Link' : 'Update Password'}
            </button>

            {activeTab === 'forgot' && (
              <div className={styles.backLinkContainer}>
                <button
                  type="button"
                  className={styles.backLink}
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
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
