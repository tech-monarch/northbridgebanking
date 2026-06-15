import { useState, useEffect } from 'react';
import api, { type AdminSettings } from '@/services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    email_notifications: true, push_notifications: false, maintenance_mode: false,
    api_rate_limit: 100, webhook_url: '', deposit_wallet_eth: '', deposit_wallet_btc: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminSettings>('/admin/settings')
      .then(data => { if (data) setSettings(s => ({ ...s, ...data })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      const res: any = await api.put('/admin/settings', settings);
      setMsg(res.message || 'Settings saved');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' as const, outline: 'none' };
  const toggleStyle = (on: boolean) => ({ width: '44px', height: '24px', borderRadius: '12px', background: on ? '#22c55e' : 'rgba(255,255,255,0.1)', position: 'relative' as const, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 });
  const knobStyle = (on: boolean) => ({ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute' as const, top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s' });

  const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Admin Settings</h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Manage platform-wide configuration</p>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,200,83,0.1)', color: '#22c55e', fontSize: '13px' }}>{msg}</div>}
      {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '13px' }}>{error}</div>}

      {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
        <>
          {/* Notifications */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '4px' }}>Notifications</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Control how you receive platform alerts</p>
            <SettingRow label="Email Notifications" desc="Receive alerts for deposits, withdrawals, and KYC">
              <div style={toggleStyle(settings.email_notifications)} onClick={() => setSettings(s => ({ ...s, email_notifications: !s.email_notifications }))}>
                <div style={knobStyle(settings.email_notifications)} />
              </div>
            </SettingRow>
            <SettingRow label="Push Notifications" desc="Browser push notifications">
              <div style={toggleStyle(settings.push_notifications)} onClick={() => setSettings(s => ({ ...s, push_notifications: !s.push_notifications }))}>
                <div style={knobStyle(settings.push_notifications)} />
              </div>
            </SettingRow>
          </div>

          {/* Platform */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '4px' }}>Platform</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Core platform settings</p>
            <SettingRow label="Maintenance Mode" desc="Disable user access during maintenance">
              <div style={{ ...toggleStyle(settings.maintenance_mode), background: settings.maintenance_mode ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                onClick={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}>
                <div style={knobStyle(settings.maintenance_mode)} />
              </div>
            </SettingRow>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>API Rate Limit (requests/min)</label>
              <input type="number" value={settings.api_rate_limit} onChange={e => setSettings(s => ({ ...s, api_rate_limit: parseInt(e.target.value) }))} style={inputStyle} />
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Webhook URL</label>
              <input type="url" value={settings.webhook_url} onChange={e => setSettings(s => ({ ...s, webhook_url: e.target.value }))} placeholder="https://…" style={inputStyle} />
            </div>
          </div>

          {/* Wallet addresses */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '4px' }}>Default Deposit Addresses</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Fallback addresses — prefer per-network addresses in Wallets</p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>ETH / ERC-20 Address</label>
              <input type="text" value={settings.deposit_wallet_eth} onChange={e => setSettings(s => ({ ...s, deposit_wallet_eth: e.target.value }))} placeholder="0x…" style={{ ...inputStyle, fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>BTC Address</label>
              <input type="text" value={settings.deposit_wallet_btc} onChange={e => setSettings(s => ({ ...s, deposit_wallet_btc: e.target.value }))} placeholder="bc1…" style={{ ...inputStyle, fontFamily: 'monospace' }} />
            </div>
          </div>

          <button onClick={save} disabled={saving}
            style={{ padding: '12px 32px', borderRadius: '10px', background: '#1565C0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', alignSelf: 'flex-start' }}>
            {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </>
      )}
    </div>
  );
}
