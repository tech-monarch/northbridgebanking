import { useState, useEffect, useCallback } from 'react';
import api, { type KycSubmission, type PaginatedResponse } from '@/services/api';

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(page));
    api.get<PaginatedResponse<KycSubmission>>(`/admin/kyc?${params}`)
      .then(res => { setSubmissions(res.data || []); setLastPage(res.last_page || 1); setTotal(res.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const approve = async (id: number) => {
    setActionLoading(true); setMsg('');
    try {
      const res: any = await api.post(`/admin/kyc/${id}/approve`);
      setMsg(res.message || 'KYC approved');
      setSelected(null); fetchData();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(false); }
  };

  const reject = async (id: number) => {
    if (!rejectReason.trim()) { setMsg('Please enter a rejection reason.'); return; }
    setActionLoading(true); setMsg('');
    try {
      const res: any = await api.post(`/admin/kyc/${id}/reject`, { reason: rejectReason });
      setMsg(res.message || 'KYC rejected');
      setSelected(null); setRejectReason(''); fetchData();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setActionLoading(false); }
  };

  const kycColors: Record<string, string> = { approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444' };

  const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' };
  const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>KYC Submissions</h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{total} total submissions</p>
        </div>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px' }}>{msg}</div>}

      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '4px', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px',
                background: statusFilter === s ? '#1565C0' : 'rgba(255,255,255,0.04)',
                color: statusFilter === s ? '#fff' : '#9ca3af' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px 80px', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>User</span><span>Document Type</span><span>Country</span><span>Status</span><span>Actions</span>
            </div>
            {submissions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No {statusFilter} submissions.</div>
            ) : submissions.map(sub => {
              const sc = kycColors[sub.status] || '#9ca3af';
              return (
                <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px 80px', gap: '12px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '13px' }}>{sub.first_name} {sub.last_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{sub.user?.email}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>{sub.document_type?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sub.country || '—'}</div>
                  <div>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: sc, background: `${sc}18`, textTransform: 'capitalize' }}>● {sub.status}</span>
                  </div>
                  <button onClick={() => { setSelected(sub); setRejectReason(''); setMsg(''); }}
                    style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(21,101,192,0.15)', color: '#1565C0', border: '1px solid rgba(21,101,192,0.3)', fontSize: '11px', cursor: 'pointer' }}>
                    Review
                  </button>
                </div>
              );
            })}
          </>
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

      {selected && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} onClick={() => setSelected(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px' }}>KYC Review — {selected.first_name} {selected.last_name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            {[
              { label: 'Full Name', value: `${selected.first_name} ${selected.last_name}` },
              { label: 'Email', value: selected.user?.email || '—' },
              { label: 'Document Type', value: selected.document_type?.replace(/_/g, ' ') },
              { label: 'Country', value: selected.country || '—' },
              { label: 'Date of Birth', value: selected.date_of_birth || '—' },
              { label: 'Status', value: selected.status },
              { label: 'Submitted', value: new Date(selected.created_at).toLocaleString() },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>{row.label}</span>
                <span style={{ fontSize: '13px', color: '#e5e7eb', textTransform: 'capitalize' }}>{row.value}</span>
              </div>
            ))}

            {selected.document_image_url && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Document Image</div>
                <img src={selected.document_image_url} alt="Document" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            )}

            {selected.selfie_url && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Selfie</div>
                <img src={selected.selfie_url} alt="Selfie" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            )}

            {selected.status === 'pending' && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Rejection reason (required for rejection)</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} placeholder="Enter reason if rejecting…"
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => reject(selected.id)} disabled={actionLoading || !rejectReason.trim()}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: 600, opacity: !rejectReason.trim() ? 0.5 : 1 }}>
                    {actionLoading ? 'Rejecting…' : '✗ Reject'}
                  </button>
                  <button onClick={() => approve(selected.id)} disabled={actionLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#1565C0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {actionLoading ? 'Approving…' : '✓ Approve'}
                  </button>
                </div>
              </div>
            )}

            {selected.rejection_reason && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', fontSize: '13px', color: '#f87171' }}>
                Rejection reason: {selected.rejection_reason}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
