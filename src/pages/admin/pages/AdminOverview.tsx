import { useState, useEffect } from 'react';
import styles from './AdminOverview.module.css';
import api, { type AdminMetrics, type Transaction } from '@/services/api';
import { formatUSD } from '@/services/prices';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function DepositIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function WithdrawIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 10 12 5 7 10"/><line x1="12" y1="5" x2="12" y2="15"/></svg>; }
function TransactionIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>; }

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminMetrics>('/admin/dashboard/metrics')
      .then((data) => { setMetrics(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading dashboard…</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>{error}</div>;
  if (!metrics) return null;

  const kpis = [
    { icon: <UsersIcon />, label: 'Total Users', value: metrics.total_users.toLocaleString(), color: '#1565C0', iconCls: 'kpiIconBlue', badge: '', data: [180,210,195,230,250,240,280] },
    { icon: <DepositIcon />, label: 'Total Deposits', value: formatUSD(metrics.total_deposits_value), color: '#00c853', iconCls: 'kpiIconGreen', badge: metrics.pending_deposits > 0 ? `${metrics.pending_deposits} pending` : '', data: [300,350,320,410,390,450,480] },
    { icon: <WithdrawIcon />, label: 'Pending Withdrawals', value: metrics.pending_withdrawals.toString(), color: '#ef4444', iconCls: 'kpiIconRed', badge: '', data: [200,220,210,260,240,290,310] },
    { icon: <TransactionIcon />, label: 'Total Volume', value: formatUSD(metrics.total_volume), color: '#d97706', iconCls: 'kpiIconYellow', badge: metrics.pending_kyc > 0 ? `${metrics.pending_kyc} KYC pending` : '', data: [900,1100,1050,1300,1250,1400,1600] },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h2 className={styles.greeting}>Admin Dashboard</h2>
          <p className={styles.subtext}>Platform overview and recent activity.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles[kpi.iconCls]}`}>{kpi.icon}</div>
              {kpi.badge && <span className={`${styles.kpiBadge} ${styles.badgeYellow}`}>{kpi.badge}</span>}
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <Sparkline data={kpi.data} color={kpi.color} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
        {/* Pending alerts */}
        <div className={styles.card} style={{ background: 'rgba(21,101,192,0.06)', border: '1px solid rgba(21,101,192,0.15)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '16px' }}>Pending Actions</h3>
          {[
            { label: 'Deposits to review', value: metrics.pending_deposits, color: '#22c55e', link: '/admin/deposits' },
            { label: 'Withdrawals to approve', value: metrics.pending_withdrawals, color: '#ef4444', link: '/admin/withdrawals' },
            { label: 'KYC submissions', value: metrics.pending_kyc, color: '#f59e0b', link: '/admin/kyc' },
          ].map((item) => (
            <a key={item.label} href={item.link} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{item.label}</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: item.value > 0 ? item.color : '#6b7280' }}>
                {item.value}
              </span>
            </a>
          ))}
        </div>

        {/* Recent transactions */}
        <div className={styles.card} style={{ background: 'rgba(21,101,192,0.06)', border: '1px solid rgba(21,101,192,0.15)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '16px' }}>Recent Transactions</h3>
          {metrics.recent_transactions.slice(0, 5).map((tx: Transaction) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{tx.type?.charAt(0).toUpperCase() + (tx.type?.slice(1) || '')}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{tx.currency} · {new Date(tx.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: tx.type === 'deposit' ? '#22c55e' : '#ef4444' }}>
                  {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toFixed(4)} {tx.currency}
                </div>
                <div style={{ fontSize: '11px', color: tx.status === 'confirmed' ? '#22c55e' : tx.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                  ● {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
