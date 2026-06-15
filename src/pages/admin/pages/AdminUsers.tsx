import { useState, useEffect, useCallback } from 'react';
import styles from './AdminUsers.module.css';
import api, { type User, type PaginatedResponse } from '@/services/api';
import { formatUSD } from '@/services/prices';

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [balanceModal, setBalanceModal] = useState<{ user: User } | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [msg, setMsg] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (kycFilter !== 'all') params.set('kyc_status', kycFilter);
    if (statusFilter !== 'all') params.set('account_status', statusFilter);
    params.set('page', String(page));
    api.get<PaginatedResponse<User>>(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.data || []);
        setLastPage(res.last_page || 1);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, kycFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (action: string, id: number, body?: object) => {
    setActionLoading(true); setMsg('');
    try {
      const res: any = action === 'balance'
        ? await api.put(`/admin/users/${id}/balance`, body)
        : await api.post(`/admin/users/${id}/${action}`);
      setMsg(res.message || 'Done');
      fetchUsers();
      setSelected(null);
      setBalanceModal(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const kycColors = { approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444', none: '#9ca3af' };
  const statusColors = { active: '#22c55e', suspended: '#ef4444' };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.statsRow}>
          {[
            { label: 'Total Users', value: total, color: '#1565C0' },
            { label: 'Active', value: users.filter(u => u.account_status === 'active').length, color: '#22c55e' },
            { label: 'KYC Approved', value: users.filter(u => u.kyc_status === 'approved').length, color: '#f59e0b' },
            { label: 'Suspended', value: users.filter(u => u.account_status === 'suspended').length, color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statNum} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px', marginBottom: '12px' }}>{msg}</div>}

      <div className={styles.card}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input placeholder="Search name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} />
          </div>
          <div className={styles.tabs}>
            {['all', 'active', 'suspended'].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.tabs}>
            {['all', 'approved', 'pending', 'rejected', 'none'].map((s) => (
              <button key={s} onClick={() => { setKycFilter(s); setPage(1); }} className={`${styles.tab} ${kycFilter === s ? styles.tabActive : ''}`}>
                KYC: {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading users…</div>
        ) : (
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>User</span><span>Balance</span><span>KYC</span><span>Status</span><span>Joined</span><span>Actions</span>
            </div>
            {users.map((user) => (
              <div key={user.id} className={styles.tableRow}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '13px' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{user.email}</div>
                </div>
                <div style={{ color: '#e5e7eb', fontSize: '13px' }}>{formatUSD(Number(user.balance))}</div>
                <div>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: kycColors[user.kyc_status], background: `${kycColors[user.kyc_status]}18`, textTransform: 'capitalize' }}>
                    {user.kyc_status}
                  </span>
                </div>
                <div>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: statusColors[user.account_status as keyof typeof statusColors] || '#9ca3af', background: `${statusColors[user.account_status as keyof typeof statusColors] || '#9ca3af'}18`, textTransform: 'capitalize' }}>
                    {user.account_status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(user.created_at).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setSelected(user)} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(21,101,192,0.15)', color: '#1565C0', border: '1px solid rgba(21,101,192,0.3)', fontSize: '11px', cursor: 'pointer' }}>View</button>
                  {user.account_status === 'active' ? (
                    <button onClick={() => doAction('suspend', user.id)} disabled={actionLoading} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', cursor: 'pointer' }}>Suspend</button>
                  ) : (
                    <button onClick={() => doAction('activate', user.id)} disabled={actionLoading} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34,200,83,0.12)', color: '#22c55e', border: '1px solid rgba(34,200,83,0.3)', fontSize: '11px', cursor: 'pointer' }}>Activate</button>
                  )}
                  <button onClick={() => { setBalanceModal({ user }); setBalanceAmount(''); setBalanceNote(''); }} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '11px', cursor: 'pointer' }}>Balance</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ padding: '6px 12px', color: '#9ca3af', fontSize: '13px' }}>Page {page} of {lastPage}</span>
            <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>Next →</button>
          </div>
        )}
      </div>

      {/* View modal */}
      {selected && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} onClick={() => setSelected(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '420px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>{selected.name}</h3>
            {[
              { label: 'Email', value: selected.email },
              { label: 'Role', value: selected.role },
              { label: 'Balance', value: formatUSD(Number(selected.balance)) },
              { label: 'KYC Status', value: selected.kyc_status },
              { label: 'Account Status', value: selected.account_status },
              { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString() },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>{row.label}</span>
                <span style={{ fontSize: '13px', color: '#e5e7eb', textTransform: 'capitalize' }}>{row.value}</span>
              </div>
            ))}
            <button onClick={() => setSelected(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </>
      )}

      {/* Balance modal */}
      {balanceModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} onClick={() => setBalanceModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '380px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', marginBottom: '4px' }}>Adjust Balance</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>{balanceModal.user.name} · Current: {formatUSD(Number(balanceModal.user.balance))}</p>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Amount (positive to add, negative to subtract)</label>
            <input type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} placeholder="e.g. 100 or -50" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px' }} />
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Note (optional)</label>
            <input type="text" value={balanceNote} onChange={(e) => setBalanceNote(e.target.value)} placeholder="Reason for adjustment" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setBalanceModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => doAction('balance', balanceModal.user.id, { amount: parseFloat(balanceAmount), note: balanceNote })} disabled={actionLoading || !balanceAmount} style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#1565C0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {actionLoading ? 'Saving…' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
