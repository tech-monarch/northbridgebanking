import { useState, useEffect, useCallback } from 'react';
import styles from './AdminWithdrawals.module.css';
import api, { type Withdrawal, type PaginatedResponse } from '@/services/api';
import { formatUSD } from '@/services/prices';

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
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

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    api.get<PaginatedResponse<Withdrawal>>(`/admin/withdrawals?${params}`)
      .then((res) => { setWithdrawals(res.data || []); setLastPage(res.last_page || 1); setTotal(res.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const approve = async (id: number) => {
    setActionLoading(id); setMsg('');
    try {
      const res: any = await api.post(`/admin/withdrawals/${id}/approve`);
      setMsg(res.message || 'Withdrawal approved');
      fetchData();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(null); }
  };

  const reject = async (id: number) => {
    setActionLoading(id); setMsg('');
    try {
      const res: any = await api.post(`/admin/withdrawals/${id}/reject`, { reason: rejectReason });
      setMsg(res.message || 'Withdrawal rejected');
      setRejectModal(null); setRejectReason('');
      fetchData();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(null); }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const totalPendingUsd = pending.reduce((s, w) => s + Number(w.usd_amount || 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        {[
          { label: 'Total', value: total, clr: '#1565C0' },
          { label: 'Pending', value: pending.length, clr: '#f59e0b' },
          { label: 'Pending Value', value: formatUSD(totalPendingUsd), clr: '#ef4444' },
          { label: 'Approved', value: withdrawals.filter(w => w.status === 'approved' || w.status === 'completed').length, clr: '#22c55e' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.clr }}>{s.value}</div>
          </div>
        ))}
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px', marginBottom: '12px' }}>{msg}</div>}

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '12px', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '200px' }}>
            <SearchIcon />
            <input placeholder="Search user, address…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ background: 'none', border: 'none', color: '#e5e7eb', fontSize: '13px', outline: 'none', flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'pending', 'approved', 'rejected', 'completed'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px',
                  background: statusFilter === s ? '#1565C0' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === s ? '#fff' : '#9ca3af' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 180px 80px 100px 160px', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '900px' }}>
              <span>User</span><span>USD Amount</span><span>Crypto</span><span>Address</span><span>Network</span><span>Status</span><span>Actions</span>
            </div>
            {withdrawals.map(w => {
              const statusColor = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444', completed: '#22c55e', processing: '#3b82f6' }[w.status] || '#9ca3af';
              return (
                <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 180px 80px 100px 160px', gap: '12px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', minWidth: '900px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e5e7eb', fontWeight: 500 }}>{w.user?.name || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{w.user?.email}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{w.usd_amount ? formatUSD(Number(w.usd_amount)) : '—'}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {w.crypto_amount ? `${Number(w.crypto_amount).toFixed(6)} ${w.symbol || w.currency || ''}` : '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {w.recipient_address ? `${w.recipient_address.slice(0, 14)}…${w.recipient_address.slice(-6)}` : '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{w.network?.name || '—'}</div>
                  <div>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: statusColor, background: `${statusColor}18`, textTransform: 'capitalize' }}>
                      ● {w.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => approve(w.id)} disabled={actionLoading === w.id}
                          style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(34,200,83,0.12)', color: '#22c55e', border: '1px solid rgba(34,200,83,0.3)', fontSize: '11px', cursor: 'pointer' }}>
                          {actionLoading === w.id ? '…' : '✓ Approve'}
                        </button>
                        <button onClick={() => { setRejectModal({ id: w.id }); setRejectReason(''); }}
                          style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', cursor: 'pointer' }}>
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {w.rejection_reason && (
                      <span style={{ fontSize: '11px', color: '#ef4444' }} title={w.rejection_reason}>⚠</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ padding: '6px 12px', color: '#9ca3af', fontSize: '13px' }}>Page {page} of {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>Next →</button>
          </div>
        )}
      </div>

      {rejectModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} onClick={() => setRejectModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '380px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', marginBottom: '12px' }}>Reject Withdrawal</h3>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Enter rejection reason…"
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => reject(rejectModal.id)} disabled={actionLoading === rejectModal.id}
                style={{ flex: 2, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: 600 }}>
                {actionLoading === rejectModal.id ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
