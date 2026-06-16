import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import styles from './auth.module.css';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from || '/dashboard', { replace: true });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link to="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to home
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}
        >
          {error}
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        style={{ marginTop: '24px' }}
      >

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email address
          </label>

          <div className={styles.inputWrap}>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>


        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>

          <div className={styles.inputWrap}>

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithIcon}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={styles.inputIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

          </div>
        </div>


        <div className={styles.extras}>
          <span />
          <Link
            to="/forgot-password"
            className={styles.forgotLink}
          >
            Forgot password?
          </Link>
        </div>


        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>


        <p className={styles.helperText} style={{ textAlign:'center' }}>
          By signing in you agree to our Terms of Use and Privacy Policy.
        </p>

      </form>

    </AuthLayout>
  );
}