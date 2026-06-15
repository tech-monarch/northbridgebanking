import { useState, useEffect, useCallback } from 'react';
import styles from './AdminDeposits.module.css';
import api, { type Deposit, type PaginatedResponse } from '@/services/api';
import { formatUSD } from '@/services/prices';

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function CubeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>; }

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDeposits = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    api.get<PaginatedResponse<Deposit>>(`/admin/deposits?${params}`)
      .then((res) => { setDeposits(res.data || []); setLastPage(res.last_page || 1); setTotal(res.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, search, page]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const approve = async (id: number) => {
    setActionLoading(id); setMsg('');
    try {
      const res: any = await api.post(`/admin/deposits/${id}/approve`);
      setMsg(res.message || 'Deposit approved');
      fetchDeposits();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(null); }
  };

  const reject = async (id: number) => {
    setActionLoading(id); setMsg('');
    try {
      const res: any = await api.post(`/admin/deposits/${id}/reject`, { reason: rejectReason });
      setMsg(res.message || 'Deposit rejected');
      setRejectModal(null); setRejectReason('');
      fetchDeposits();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(null); }
  };

  const confirmed = deposits.filter(d => d.status === 'confirmed');
  const pending = deposits.filter(d => d.status === 'pending');
  const totalConfirmedUsd = confirmed.reduce((s, d) => s + Number(d.usd_amount || d.amount), 0);

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Deposits', value: total, clr: '#1565C0', bg: 'rgba(21,101,192,0.1)' },
          { label: 'Confirmed Volume', value: formatUSD(totalConfirmedUsd), clr: '#22c853', bg: 'rgba(34,200,83,0.1)' },
          { label: 'Pending', value: pending.length, clr: '#d97706', bg: 'rgba(217,119,6,0.1)' },
          { label: 'Page Total', value: deposits.length, clr: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: s.bg, color: s.clr }}><CubeIcon /></div>
            <div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue} style={{ color: s.clr }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px', marginBottom: '12px' }}>{msg}</div>}

      <div className={styles.card}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}><SearchIcon /><input placeholder="Search hash, user…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} /></div>
          <div className={styles.tabs}>
            {['all', 'pending', 'confirmed', 'rejected'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
        </div>

        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>User</span><span>Amount</span><span>Network</span><span>TX Hash</span><span>Status</span><span>Date</span><span>Actions</span>
            </div>
            {deposits.map(dep => {
              const statusColor = { confirmed: '#22c55e', pending: '#f59e0b', rejected: '#ef4444' }[dep.status] || '#9ca3af';
              return (
                <div key={dep.id} className={styles.tableRow}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e5e7eb', fontWeight: 500 }}>{dep.user?.name || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{dep.user?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{dep.usd_amount ? formatUSD(Number(dep.usd_amount)) : `${Number(dep.amount).toFixed(6)} ${dep.currency}`}</div>
                    {dep.usd_amount && <div style={{ fontSize: '11px', color: '#6b7280' }}>{Number(dep.amount).toFixed(6)} {dep.currency}</div>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{dep.network?.name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>{dep.transaction_hash ? `${dep.transaction_hash.slice(0, 12)}…` : '—'}</div>
                  <div><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: statusColor, background: `${statusColor}18`, textTransform: 'capitalize' }}>● {dep.status}</span></div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(dep.created_at).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {dep.status === 'pending' && (
                      <>
                        <button onClick={() => approve(dep.id)} disabled={actionLoading === dep.id} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(34,200,83,0.12)', color: '#22c55e', border: '1px solid rgba(34,200,83,0.3)', fontSize: '11px', cursor: 'pointer' }}>
                          {actionLoading === dep.id ? '…' : '✓ Approve'}
                        </button>
                        <button onClick={() => { setRejectModal({ id: dep.id }); setRejectReason(''); }} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', cursor: 'pointer' }}>✗ Reject</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ padding: '6px 12px', color: '#9ca3af', fontSize: '13px' }}>Page {page} of {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>Next →</button>
          </div>
        )}
      </div>

      {rejectModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} onClick={() => setRejectModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '380px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', marginBottom: '12px' }}>Reject Deposit</h3>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Enter rejection reason…" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => reject(rejectModal.id)} disabled={actionLoading === rejectModal.id} style={{ flex: 2, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: 600 }}>
                {actionLoading === rejectModal.id ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
