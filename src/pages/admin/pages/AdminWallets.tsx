import { useState, useEffect } from 'react';
import api, { type Network } from '@/services/api';
import { formatUSD } from '@/services/prices';

export default function AdminWallets() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Network | null>(null);
  const [form, setForm] = useState<Partial<Network>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchNetworks = () => {
    setLoading(true);
    api.get<Network[]>('/admin/networks')
      .then(data => { setNetworks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchNetworks(); }, []);

  const openEdit = (net: Network) => {
    setEditModal(net);
    setForm({ ...net });
    setMsg('');
  };

  const saveNetwork = async () => {
    if (!editModal) return;
    setSaving(true); setMsg('');
    try {
      const res: any = await api.put(`/admin/networks/${editModal.id}`, form);
      setMsg(res.message || 'Network updated');
      fetchNetworks();
      setEditModal(null);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (net: Network) => {
    try {
      await api.put(`/admin/networks/${net.id}`, { ...net, is_active: !net.is_active });
      fetchNetworks();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' as const, outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Network Wallets</h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Manage deposit addresses, fees, and network settings</p>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px' }}>{msg}</div>}

      {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {networks.map(net => (
            <div key={net.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${net.is_active ? net.color + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${net.color}18`, color: net.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                    {net.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '15px' }}>{net.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{net.symbol}</div>
                  </div>
                </div>
                <div onClick={() => toggleActive(net)} style={{ width: '36px', height: '20px', borderRadius: '10px', background: net.is_active ? '#22c55e' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: net.is_active ? '19px' : '3px', transition: 'left 0.2s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Deposit Address', value: net.deposit_address ? `${net.deposit_address.slice(0, 18)}…` : 'Not set', mono: true },
                  { label: 'Min Deposit', value: `${net.min_deposit} ${net.symbol}` },
                  { label: 'Fee', value: `${net.fee} ${net.symbol}` },
                  { label: 'Confirmations', value: String(net.confirmations) },
                  ...(net.usd_rate ? [{ label: 'USD Rate', value: formatUSD(net.usd_rate) }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>{row.label}</span>
                    <span style={{ color: '#e5e7eb', fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => openEdit(net)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: `${net.color}18`, color: net.color, border: `1px solid ${net.color}30`, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Edit Network
              </button>
            </div>
          ))}
        </div>
      )}

      {editModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} onClick={() => setEditModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '24px', zIndex: 101, width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px' }}>Edit — {editModal.name}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            {[
              { label: 'Network Name', key: 'name', type: 'text' },
              { label: 'Symbol', key: 'symbol', type: 'text' },
              { label: 'Deposit Address', key: 'deposit_address', type: 'text' },
              { label: 'Min Deposit', key: 'min_deposit', type: 'number' },
              { label: 'Fee (crypto)', key: 'fee', type: 'number' },
              { label: 'Confirmations Required', key: 'confirmations', type: 'number' },
              { label: 'USD Rate (optional override)', key: 'usd_rate', type: 'number' },
              { label: 'Min Deposit (USD)', key: 'min_deposit_usd', type: 'number' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={(form as any)[field.key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Active</label>
              <div onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.is_active ? '#22c55e' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: form.is_active ? '23px' : '3px', transition: 'left 0.2s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveNetwork} disabled={saving}
                style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#1565C0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
