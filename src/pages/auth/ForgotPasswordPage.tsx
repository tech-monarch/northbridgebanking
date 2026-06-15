import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import AuthLayout from './AuthLayout';
import styles from './auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <Link to="/login" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to sign in
      </Link>

      {submitted ? (
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Check your inbox</h2>
          <p className={styles.successDesc}>
            We've sent a password reset link to <strong>{email}</strong>.
            <br/><br/>
            Didn't receive it? Check your spam folder or{' '}
            <button
              style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 600, cursor: 'pointer', padding: 0, font: 'inherit' }}
              onClick={() => setSubmitted(false)}
            >
              try again
            </button>.
          </p>
          <Link
            to="/login"
            style={{ display: 'inline-block', marginTop: '20px', color: '#166534', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
          >
            Return to login →
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.subtitle}>
              Enter the email address associated with your account and we'll send you a reset link.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <div className={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Send Reset Link
            </button>

            <p className={styles.helperText} style={{ textAlign: 'center' }}>
              Remember your password? <Link to="/login" style={{ color: '#1e88e5', fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
