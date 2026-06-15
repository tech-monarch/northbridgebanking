import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './StatsRow.module.css';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { formatUSD } from '@/services/prices';

function WalletIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>;
}
function ArrowsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
}
function FundIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function KycIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

export default function StatsRow() {
  const { user } = useAuth();
  const [totalFunded, setTotalFunded] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>('/user/deposits').catch(() => ({ data: [] })),
      api.get<{ data: any[]; total: number }>('/user/transactions').catch(() => ({ data: [], total: 0 })),
    ]).then(([deps, txs]) => {
      const confirmed = (deps.data || []).filter((d: any) => d.status === 'confirmed');
      const totalUsd = confirmed.reduce((sum: number, d: any) => sum + Number(d.usd_amount || d.amount || 0), 0);
      setTotalFunded(totalUsd);
      setTxCount((txs as any).total || (txs.data || []).length);
      setLoading(false);
    });
  }, []);

  const balance = user ? Number(user.balance) : 0;
  const kycStatus = user?.kyc_status || 'none';

  const kycBadge = {
    none: { label: 'Not Verified', color: '#9ca3af' },
    pending: { label: 'Pending Review', color: '#f59e0b' },
    approved: { label: 'Verified ✓', color: '#22c55e' },
    rejected: { label: 'Rejected', color: '#ef4444' },
  }[kycStatus];

  const STATS = [
    {
      icon: <WalletIcon />,
      label: 'Account Balance',
      value: loading ? '…' : formatUSD(balance),
      sub: 'Available to withdraw',
      positive: balance >= 0,
      iconBg: '#1565C020',
      iconColor: '#1565C0',
    },
    {
      icon: <FundIcon />,
      label: 'Total Funded',
      value: loading ? '…' : formatUSD(totalFunded),
      sub: 'Lifetime confirmed deposits',
      positive: true,
      iconBg: '#22c85320',
      iconColor: '#22c853',
    },
    {
      icon: <ArrowsIcon />,
      label: 'Total Transactions',
      value: loading ? '…' : String(txCount),
      sub: 'Deposits & withdrawals',
      positive: true,
      iconBg: '#f59e0b20',
      iconColor: '#f59e0b',
    },
    {
      icon: <KycIcon />,
      label: 'KYC Status',
      value: kycBadge.label,
      sub: kycStatus === 'none' ? 'Required for withdrawals' : kycStatus === 'approved' ? 'Full access enabled' : '',
      positive: kycStatus === 'approved',
      iconBg: `${kycBadge.color}20`,
      iconColor: kycBadge.color,
      link: kycStatus !== 'approved' ? '/dashboard/settings' : undefined,
    },
  ];

  return (
    <div className={styles.row}>
      {STATS.map((stat, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.iconWrap} style={{ background: stat.iconBg, color: stat.iconColor }}>
            {stat.icon}
          </div>
          <div className={styles.info}>
            <span className={styles.label}>{stat.label}</span>
            <span className={styles.value} style={{ color: stat.iconColor }}>{stat.value}</span>
            <div className={styles.sub}>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{stat.sub}</span>
              {stat.link && <Link to={stat.link} style={{ fontSize: '11px', color: '#1565C0', marginLeft: '6px' }}>Verify →</Link>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
