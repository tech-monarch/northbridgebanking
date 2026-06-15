import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PortfolioAllocation.module.css';
import { useAuth } from '@/context/AuthContext';
import { formatUSD } from '@/services/prices';

// Fintech account overview — replaces crypto portfolio allocation
const ACCOUNT_TIERS = [
  { label: 'Basic', color: '#9ca3af', minBalance: 0, maxBalance: 999 },
  { label: 'Standard', color: '#1565C0', minBalance: 1000, maxBalance: 9999 },
  { label: 'Premium', color: '#f59e0b', minBalance: 10000, maxBalance: 49999 },
  { label: 'Elite', color: '#22c55e', minBalance: 50000, maxBalance: Infinity },
];

function getTier(balance: number) {
  return ACCOUNT_TIERS.find((t) => balance >= t.minBalance && balance <= t.maxBalance) ?? ACCOUNT_TIERS[0];
}

export default function PortfolioAllocation() {
  const { user } = useAuth();
  const balance = user ? Number(user.balance) : 0;
  const kycStatus = user?.kyc_status;
  const tier = getTier(balance);

  const nextTier = ACCOUNT_TIERS[ACCOUNT_TIERS.indexOf(tier) + 1];
  const progressPct = nextTier
    ? Math.min(100, ((balance - tier.minBalance) / (nextTier.minBalance - tier.minBalance)) * 100)
    : 100;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Account Overview</h3>

      <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Available Balance</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          {formatUSD(balance)}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${tier.color}15`, border: `1px solid ${tier.color}40`, borderRadius: '20px', padding: '3px 12px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tier.color }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: tier.color }}>{tier.label} Tier</span>
        </div>
      </div>

      {nextTier && (
        <div style={{ padding: '0 4px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Progress to {nextTier.label}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: '6px', background: '#f0f2f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: tier.color, borderRadius: '4px', transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
            {formatUSD(nextTier.minBalance - balance)} more to reach {nextTier.label}
          </div>
        </div>
      )}

      <div style={{ padding: '0 4px' }}>
        {[
          { label: 'KYC Status', value: kycStatus || 'none', color: kycStatus === 'approved' ? '#22c55e' : kycStatus === 'pending' ? '#f59e0b' : '#9ca3af' },
          { label: 'Account Status', value: user?.account_status || 'active', color: user?.account_status === 'active' ? '#22c55e' : '#ef4444' },
          { label: 'Account Tier', value: tier.label, color: tier.color },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f2f5' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>{item.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: item.color, textTransform: 'capitalize' }}>
              ● {item.value}
            </span>
          </div>
        ))}
      </div>

      {kycStatus !== 'approved' && (
        <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#d97706' }}>Complete KYC to unlock withdrawals</span>
          <Link to="/dashboard/settings" style={{ fontSize: '12px', color: '#1565C0', fontWeight: 600, textDecoration: 'none' }}>Verify →</Link>
        </div>
      )}
    </div>
  );
}
