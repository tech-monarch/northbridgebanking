import { useState, useEffect, useCallback } from 'react';
import styles from './TransactionsPage.module.css';
import api, { type Transaction } from '@/services/api';

const COIN_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', USDT: '#26a17b', SOL: '#9945ff',
  BNB: '#f3ba2f', XRP: '#346aa9', TRX: '#e50915', USDC: '#2775ca',
};

function DepositIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function WithdrawIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 10 12 5 7 10"/><line x1="12" y1="5" x2="12" y2="15"/></svg>;
}
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchTx = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('type', filter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('per_page', '15');

    api.get<{ data: Transaction[]; last_page: number; total: number }>(`/user/transactions?${params}`)
      .then((res) => {
        setTransactions(res.data || []);
        setLastPage(res.last_page || 1);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, statusFilter, search, page]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const statusColors = { confirmed: '#22c55e', pending: '#f59e0b', failed: '#ef4444' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{total} total transactions</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              placeholder="Search by currency, hash…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.tabs}>
            {['all', 'deposit', 'withdrawal'].map((t) => (
              <button
                key={t}
                onClick={() => { setFilter(t as any); setPage(1); }}
                className={`${styles.tab} ${filter === t ? styles.tabActive : ''}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.tabs}>
            {['all', 'confirmed', 'pending', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No transactions found.</div>
        ) : (
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>Type</span>
              <span>Asset</span>
              <span>Amount</span>
              <span>Network</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {transactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const color = COIN_COLORS[tx.currency?.toUpperCase()] || '#1565C0';
              const isExpanded = expanded === tx.id;
              return (
                <div key={tx.id}>
                  <div
                    className={styles.tableRow}
                    onClick={() => setExpanded(isExpanded ? null : tx.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.typeCell}>
                      <div
                        className={styles.typeIcon}
                        style={{
                          background: isDeposit ? '#22c85320' : '#ef444420',
                          color: isDeposit ? '#22c853' : '#ef4444',
                        }}
                      >
                        {isDeposit ? <DepositIcon /> : <WithdrawIcon />}
                      </div>
                      <span>{isDeposit ? 'Deposit' : 'Withdrawal'}</span>
                    </div>
                    <div className={styles.assetCell}>
                      <div className={styles.assetBadge} style={{ background: color, color: '#000' }}>
                        {tx.currency?.slice(0, 3)}
                      </div>
                      <span>{tx.currency}</span>
                    </div>
                    <div className={`${styles.amountCell} ${isDeposit ? styles.amountPos : styles.amountNeg}`}>
                      {isDeposit ? '+' : '-'}{Number(tx.amount).toFixed(6)} {tx.currency}
                    </div>
                    <div className={styles.networkCell}>{tx.network}</div>
                    <div className={styles.statusCell}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          color: statusColors[tx.status] || '#9ca3af',
                          background: `${statusColors[tx.status]}20` || 'rgba(156,163,175,0.1)',
                        }}
                      >
                        ● {tx.status}
                      </span>
                    </div>
                    <div className={styles.dateCell}>
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className={styles.expandedRow}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px 16px', background: 'rgba(21,101,192,0.05)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Transaction ID</div>
                          <div style={{ fontSize: '12px', color: '#e5e7eb', fontFamily: 'monospace' }}>{tx.id}</div>
                        </div>
                        {tx.hash && (
                          <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>TX Hash</div>
                            <div style={{ fontSize: '12px', color: '#e5e7eb', fontFamily: 'monospace' }}>{tx.hash}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Date & Time</div>
                          <div style={{ fontSize: '12px', color: '#e5e7eb' }}>
                            {new Date(tx.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ padding: '6px 12px', color: '#9ca3af', fontSize: '13px' }}>
              Page {page} of {lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === lastPage ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
