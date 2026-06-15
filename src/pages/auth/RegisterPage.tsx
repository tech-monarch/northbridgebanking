import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import styles from './auth.module.css';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', agree: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = (pw: string): { level: number; label: string; color: string } => {
    if (pw.length === 0) return { level: 0, label: '', color: '' };
    if (pw.length < 6) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (pw.length < 10) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return { level: 4, label: 'Strong', color: '#22c55e' };
    return { level: 3, label: 'Good', color: '#3b82f6' };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.agree) { setError('Please agree to the Terms of Service.'); return; }
    setError('');
    setLoading(true);
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      await register(name, form.email, form.password, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link to="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to home
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="firstName">First name</label>
            <input id="firstName" type="text" className={styles.input} placeholder="John" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required autoComplete="given-name" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lastName">Last name</label>
            <input id="lastName" type="text" className={styles.input} placeholder="Doe" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required autoComplete="family-name" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email address</label>
          <input id="email" type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required autoComplete="email" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithIcon}`}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button type="button" className={styles.inputIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {strength.level > 0 && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} style={{ flex: 1, height: '3px', borderRadius: '2px', background: lvl <= strength.level ? strength.color : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        <label className={styles.checkLabel} style={{ marginBottom: '16px' }}>
          <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} />
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>

        <button type="submit" className={styles.submitBtn} disabled={loading || !form.agree}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
