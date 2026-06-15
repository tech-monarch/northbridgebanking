import { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

type Tab = 'profile' | 'security' | 'kyc' | 'notifications';

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}>
      <div className={styles.toggleKnob} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function LockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>; }
function ShieldIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>; }

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile',  label: 'Profile',  icon: <UserIcon /> },
  { key: 'security', label: 'Security', icon: <LockIcon /> },
  { key: 'kyc',      label: 'KYC',      icon: <ShieldIcon /> },
  { key: 'notifications', label: 'Notifications', icon: <BellIcon /> },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  // KYC
  const [kycStep, setKycStep] = useState<'status' | 'form'>('status');
  const [kycForm, setKycForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', country: '', address: '',
    document_type: 'passport',
  });
  const [frontDoc, setFrontDoc] = useState<File | null>(null);
  const [backDoc, setBackDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycMsg, setKycMsg] = useState('');

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone || ''); }
  }, [user]);

  const saveProfile = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put('/user/profile', { name, phone });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPassError(''); setPassSaved(false);
    if (newPass !== confirmPass) { setPassError('Passwords do not match.'); return; }
    if (newPass.length < 8) { setPassError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await api.post('/user/password/change', {
        current_password: currentPass,
        password: newPass,
        password_confirmation: confirmPass,
      });
      setPassSaved(true);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      setTimeout(() => setPassSaved(false), 2500);
    } catch (e) {
      setPassError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const submitKyc = async () => {
    if (!frontDoc || !selfie) { setKycMsg('Please upload required documents.'); return; }
    setKycSubmitting(true); setKycMsg('');
    try {
      const fd = new FormData();
      Object.entries(kycForm).forEach(([k, v]) => fd.append(k, v));
      fd.append('front_doc', frontDoc);
      fd.append('selfie', selfie);
      if (backDoc) fd.append('back_doc', backDoc);
      await api.upload('/user/kyc/submit', fd);
      await refreshUser();
      setKycMsg('KYC submitted successfully! We will review within 24 hours.');
      setKycStep('status');
    } catch (e) {
      setKycMsg(e instanceof Error ? e.message : 'KYC submission failed');
    } finally {
      setKycSubmitting(false);
    }
  };

  const kycStatus = user?.kyc_status || 'none';
  const kycBadgeColor = { none: '#9ca3af', pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' }[kycStatus];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Tab sidebar */}
        <div className={styles.sidebar}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.sidebarItem} ${activeTab === tab.key ? styles.sidebarItemActive : ''}`}
            >
              <span className={styles.sidebarIcon}>{tab.icon}</span>
              {tab.label}
              {tab.key === 'kyc' && kycStatus !== 'approved' && (
                <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: kycBadgeColor }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <p className={styles.sectionSubtitle}>Update your personal details</p>
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
              {saved && <div style={{ background: 'rgba(34,200,83,0.1)', color: '#22c55e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>Profile saved successfully!</div>}
              <Field label="Full Name">
                <div className={styles.inputWrap}>
                  <input type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
              </Field>
              <Field label="Email Address">
                <div className={styles.inputWrap}>
                  <input type="email" className={styles.input} value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                </div>
              </Field>
              <Field label="Phone Number">
                <div className={styles.inputWrap}>
                  <input type="tel" className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </Field>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Member since {user ? new Date(user.created_at).toLocaleDateString() : '—'}</div>
              </div>
              <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Security</h2>
                <p className={styles.sectionSubtitle}>Manage your password and account security</p>
              </div>
              {passError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{passError}</div>}
              {passSaved && <div style={{ background: 'rgba(34,200,83,0.1)', color: '#22c55e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>Password changed successfully!</div>}
              <Field label="Current Password">
                <div className={styles.inputWrap}>
                  <input type="password" className={styles.input} value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Enter current password" />
                </div>
              </Field>
              <Field label="New Password">
                <div className={styles.inputWrap}>
                  <input type="password" className={styles.input} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 8 characters" />
                </div>
              </Field>
              <Field label="Confirm New Password">
                <div className={styles.inputWrap}>
                  <input type="password" className={styles.input} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repeat new password" />
                </div>
              </Field>
              <button className={styles.saveBtn} onClick={changePassword} disabled={saving || !currentPass || !newPass}>
                {saving ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Identity Verification (KYC)</h2>
                <p className={styles.sectionSubtitle}>Required for withdrawals</p>
              </div>

              {/* Status banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', background: `${kycBadgeColor}18`, border: `1px solid ${kycBadgeColor}40`, marginBottom: '20px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: kycBadgeColor }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                    KYC {kycStatus === 'none' ? 'Not Submitted' : kycStatus}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {kycStatus === 'none' && 'Submit your documents to enable withdrawals'}
                    {kycStatus === 'pending' && 'Under review — usually completed within 24 hours'}
                    {kycStatus === 'approved' && 'Full access enabled. All features unlocked.'}
                    {kycStatus === 'rejected' && 'Your submission was rejected. Please resubmit.'}
                  </div>
                </div>
              </div>

              {kycMsg && (
                <div style={{ background: kycMsg.includes('success') ? 'rgba(34,200,83,0.1)' : 'rgba(239,68,68,0.1)', color: kycMsg.includes('success') ? '#22c55e' : '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                  {kycMsg}
                </div>
              )}

              {(kycStatus === 'none' || kycStatus === 'rejected') && kycStep === 'status' && (
                <button className={styles.saveBtn} onClick={() => setKycStep('form')}>
                  {kycStatus === 'rejected' ? 'Resubmit KYC' : 'Start KYC Verification'}
                </button>
              )}

              {kycStep === 'form' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'First Name', key: 'first_name', type: 'text', placeholder: 'John' },
                      { label: 'Last Name', key: 'last_name', type: 'text', placeholder: 'Doe' },
                      { label: 'Date of Birth', key: 'date_of_birth', type: 'date', placeholder: '' },
                      { label: 'Country', key: 'country', type: 'text', placeholder: 'United States' },
                    ].map((f) => (
                      <Field key={f.key} label={f.label}>
                        <input
                          type={f.type}
                          className={styles.input}
                          placeholder={f.placeholder}
                          value={(kycForm as any)[f.key]}
                          onChange={(e) => setKycForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        />
                      </Field>
                    ))}
                  </div>

                  <Field label="Address">
                    <input type="text" className={styles.input} placeholder="123 Main St, City, State" value={kycForm.address} onChange={(e) => setKycForm((prev) => ({ ...prev, address: e.target.value }))} />
                  </Field>

                  <Field label="Document Type">
                    <select className={styles.input} value={kycForm.document_type} onChange={(e) => setKycForm((prev) => ({ ...prev, document_type: e.target.value }))}>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="drivers_license">Driver's License</option>
                    </select>
                  </Field>

                  <Field label="Front of Document (Required)">
                    <input type="file" accept="image/*,.pdf" className={styles.input} style={{ padding: '8px' }} onChange={(e) => setFrontDoc(e.target.files?.[0] || null)} />
                  </Field>

                  <Field label="Back of Document (Optional)">
                    <input type="file" accept="image/*,.pdf" className={styles.input} style={{ padding: '8px' }} onChange={(e) => setBackDoc(e.target.files?.[0] || null)} />
                  </Field>

                  <Field label="Selfie with Document (Required)">
                    <input type="file" accept="image/*" className={styles.input} style={{ padding: '8px' }} onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
                  </Field>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button className={styles.saveBtn} style={{ background: 'rgba(255,255,255,0.06)' }} onClick={() => setKycStep('status')}>Cancel</button>
                    <button className={styles.saveBtn} onClick={submitKyc} disabled={kycSubmitting || !frontDoc || !selfie}>
                      {kycSubmitting ? 'Submitting…' : 'Submit KYC'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Notifications</h2>
                <p className={styles.sectionSubtitle}>Manage your notification preferences</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Deposit Confirmed', desc: 'When a deposit is approved and credited', on: true },
                  { label: 'Withdrawal Processed', desc: 'When a withdrawal is approved or rejected', on: true },
                  { label: 'KYC Status Update', desc: 'When your KYC is reviewed', on: true },
                  { label: 'Security Alerts', desc: 'Login from new device or location', on: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <ToggleSwitch on={item.on} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
