import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './RecentTransactions.module.css';
import api, { type Transaction } from '@/services/api';
import { formatUSD } from '@/services/prices';

// Method label mapping — covers both bank transfer and crypto channels
function getMethodLabel(tx: Transaction): string {
  const network = tx.network?.toLowerCase() ?? '';
  if (network === 'bank_transfer' || network === 'bank transfer' || network === 'bank') {
    return 'Bank Transfer';
  }
  if (network === 'ussd') return 'USSD';
  if (network === 'card') return 'Card';
  // crypto networks fall through with their own name
  return tx.network ?? 'Transfer';
}

function getMethodIcon(tx: Transaction) {
  const network = tx.network?.toLowerCase() ?? '';
  if (network === 'bank_transfer' || network === 'bank transfer' || network === 'bank') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    );
  }
  if (network === 'ussd') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    );
  }
  // default / crypto
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Transaction[] }>('/user/transactions?per_page=5')
      .then((res) => { setTransactions(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
        <Link to="/dashboard/transactions" className={styles.viewAll}>View all →</Link>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Loading…</div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          No transactions yet.<br />
          <Link to="/dashboard/deposit" style={{ color: '#1565C0', fontSize: '13px' }}>Fund your account →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {transactions.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            const statusColors: Record<string, string> = { confirmed: '#22c55e', pending: '#f59e0b', failed: '#ef4444' };
            const methodLabel = getMethodLabel(tx);
            // Show USD amount when available, fallback to raw amount
            const displayAmount = tx.usd_amount
              ? formatUSD(Number(tx.usd_amount))
              : `${Number(tx.amount).toFixed(tx.currency?.toUpperCase() === 'USD' ? 2 : 6)} ${tx.currency ?? ''}`;

            return (
              <div key={tx.id} className={styles.txRow}>
                <div className={styles.txIconWrap}>
                  <div
                    className={styles.txTypeIcon}
                    style={{
                      background: isDeposit ? '#22c85320' : '#ef444420',
                      color: isDeposit ? '#22c853' : '#ef4444',
                    }}
                  >
                    {isDeposit ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 10 12 5 7 10"/><line x1="12" y1="5" x2="12" y2="15"/></svg>
                    )}
                  </div>
                </div>
                <div className={styles.txMain}>
                  <div className={styles.txTitle}>{isDeposit ? 'Deposit' : 'Withdrawal'}</div>
                  <div className={styles.txMeta} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getMethodIcon(tx)}
                    {methodLabel} · {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.txRight}>
                  <div className={styles.txAmount} style={{ color: isDeposit ? '#22c55e' : '#ef4444' }}>
                    {isDeposit ? '+' : '-'}{displayAmount}
                  </div>
                  <div className={styles.txStatus} style={{ color: statusColors[tx.status] || '#9ca3af' }}>
                    ● {tx.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
