import { useState, useEffect } from 'react';
import styles from './DepositPage.module.css';
import api, { type Network } from '@/services/api';
import { fetchAllPrices, formatUSD, usdToCrypto } from '@/services/prices';

// ─── Types ────────────────────────────────────────────────────────────────────
type DepositMethod = 'bank_transfer' | 'crypto';
type Step = 'method' | 'select' | 'amount' | 'details' | 'confirm' | 'processing' | 'done';

// ─── Static bank accounts configured by admin ────────────────────────────────
// In production these come from /api/bank-accounts or are embedded in admin settings
const BANK_ACCOUNTS = [
  {
    id: 1,
    bank_name: 'First Bank of Nigeria',
    account_name: 'NorthBridge Finance Ltd',
    account_number: '3012345678',
    sort_code: '011',
  },
  {
    id: 2,
    bank_name: 'GTBank',
    account_name: 'NorthBridge Finance Ltd',
    account_number: '0123456789',
    sort_code: '058',
  },
];

const COIN_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: '⬥', SOL: '◎', XRP: '✕', USDC: '$', TRX: '⚡',
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function BankIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/>
      <line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/>
      <polygon points="12 2 20 7 4 7"/>
    </svg>
  );
}

function CryptoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 8h4a2 2 0 010 4H9v4h4a2 2 0 010 4"/>
      <line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="18" x2="12" y2="20"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DepositPage() {
  // Method selection
  const [method, setMethod] = useState<DepositMethod | null>(null);

  // Crypto-specific state
  const [networks, setNetworks] = useState<Network[]>([]);
  const [networksLoading, setNetworksLoading] = useState(false);
  const [networksError, setNetworksError] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);

  // Bank transfer state
  const [selectedBank, setSelectedBank] = useState<typeof BANK_ACCOUNTS[0] | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [bankCopied, setBankCopied] = useState<number | null>(null);

  // Shared state
  const [step, setStep] = useState<Step>('method');
  const [usdAmount, setUsdAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load crypto networks when method = crypto
  useEffect(() => {
    if (method !== 'crypto') return;
    setNetworksLoading(true);
    api.get<Network[]>('/networks')
      .then(async (data) => {
        const active = data.filter((n) => n.is_active);
        setNetworks(active);
        const syms = active.map((n) => n.symbol);
        const p = await fetchAllPrices(syms);
        setPrices(p);
        setNetworksLoading(false);
      })
      .catch((e) => { setNetworksError(e.message); setNetworksLoading(false); });
  }, [method]);

  // Helpers
  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setBankCopied(id);
    setTimeout(() => setBankCopied(null), 2500);
  };

  const handleCryptoCopy = () => {
    if (!selectedNetwork?.deposit_address) return;
    navigator.clipboard.writeText(selectedNetwork.deposit_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async () => {
    setSubmitError('');
    setSubmitLoading(true);
    setStep('processing');
    try {
      if (method === 'bank_transfer') {
        await api.post('/user/deposits', {
          method: 'bank_transfer',
          usd_amount: parseFloat(usdAmount),
          bank_account_id: selectedBank?.id,
          sender_name: senderName,
          sender_bank: senderBank,
          payment_reference: paymentReference,
        });
      } else if (method === 'crypto' && selectedNetwork) {
        await api.post('/user/deposits', {
          method: 'crypto',
          network_id: selectedNetwork.id,
          usd_amount: parseFloat(usdAmount),
          transaction_hash: txHash || undefined,
        });
      }
      setStep('done');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Deposit submission failed.');
      setStep('confirm');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setStep('method'); setMethod(null); setSelectedNetwork(null); setUsdAmount('');
    setTxHash(''); setCopied(false); setConfirmed(false); setSubmitError('');
    setSelectedBank(null); setSenderName(''); setSenderBank(''); setPaymentReference('');
  };

  const coinIcon = selectedNetwork ? (COIN_ICONS[selectedNetwork.symbol] ?? selectedNetwork.symbol.slice(0, 1)) : '';
  const price = selectedNetwork ? (prices[selectedNetwork.symbol] || selectedNetwork.usd_rate || 1) : 1;
  const cryptoAmount = usdAmount ? usdToCrypto(parseFloat(usdAmount), price).toFixed(8) : '0';
  const minDepositUsd = selectedNetwork ? (selectedNetwork.min_deposit_usd || selectedNetwork.min_deposit * price) : 10;

  // Progress steps per method
  const BANK_STEPS: Step[] = ['method', 'select', 'amount', 'details', 'confirm'];
  const CRYPTO_STEPS: Step[] = ['method', 'select', 'amount', 'details', 'confirm'];
  const allSteps = method === 'bank_transfer' ? BANK_STEPS : CRYPTO_STEPS;
  const stepIndex = allSteps.indexOf(step);

  const bankDetailsValid =
    parseFloat(usdAmount) >= 1 &&
    !!selectedBank &&
    senderName.trim().length > 2 &&
    senderBank.trim().length > 2;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Fund Account</h1>
            <p>Add money via bank transfer or cryptocurrency</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {step !== 'processing' && step !== 'done' && step !== 'method' && (
          <div className={styles.progressRow}>
            {['Method', method === 'bank_transfer' ? 'Select Bank' : 'Select Coin', 'Amount', 'Details', 'Confirm'].map((label, i) => (
              <div key={i} className={styles.progressStep}>
                <div className={`${styles.progressDot} ${i < stepIndex ? styles.dotDone : i === stepIndex ? styles.dotActive : ''}`}>
                  {i < stepIndex ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (<span>{i + 1}</span>)}
                </div>
                <span className={`${styles.progressLabel} ${i === stepIndex ? styles.progressLabelActive : ''}`}>{label}</span>
                {i < 4 && <div className={`${styles.progressLine} ${i < stepIndex ? styles.lineDone : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP: Choose Method
        ════════════════════════════════════════ */}
        {step === 'method' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>How do you want to fund your account?</h2>
            <p className={styles.cardSubtitle}>Choose your preferred deposit method</p>
            <div className={styles.coinGrid} style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '480px', margin: '24px auto' }}>
              {/* Bank Transfer */}
              <button
                className={`${styles.coinCard} ${method === 'bank_transfer' ? styles.coinCardActive : ''}`}
                style={method === 'bank_transfer' ? { borderColor: '#1565C0' } : {}}
                onClick={() => setMethod('bank_transfer')}
              >
                <div className={styles.coinIconWrap} style={{ color: '#1565C0', background: '#1565C018' }}>
                  <BankIcon />
                </div>
                <div className={styles.coinCardName}>Bank Transfer</div>
                <div className={styles.coinCardSymbol}>NGN / USD</div>
                <div className={styles.coinCardNetwork} style={{ color: '#1565C0' }}>Instant · Free</div>
                {method === 'bank_transfer' && (
                  <div className={styles.coinCheck} style={{ background: '#1565C0' }}>✓</div>
                )}
              </button>

              {/* Crypto */}
              <button
                className={`${styles.coinCard} ${method === 'crypto' ? styles.coinCardActive : ''}`}
                style={method === 'crypto' ? { borderColor: '#f59e0b' } : {}}
                onClick={() => setMethod('crypto')}
              >
                <div className={styles.coinIconWrap} style={{ color: '#f59e0b', background: '#f59e0b18' }}>
                  <CryptoIcon />
                </div>
                <div className={styles.coinCardName}>Cryptocurrency</div>
                <div className={styles.coinCardSymbol}>BTC · ETH · USDT</div>
                <div className={styles.coinCardNetwork} style={{ color: '#f59e0b' }}>10–30 min</div>
                {method === 'crypto' && (
                  <div className={styles.coinCheck} style={{ background: '#f59e0b' }}>✓</div>
                )}
              </button>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!method} onClick={() => setStep('select')}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Select Bank
        ════════════════════════════════════════ */}
        {step === 'select' && method === 'bank_transfer' && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('method')}>← Back</button>
            <h2 className={styles.cardTitle}>Select destination bank account</h2>
            <p className={styles.cardSubtitle}>Choose the account you'll be transferring to</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {BANK_ACCOUNTS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  style={{
                    background: selectedBank?.id === bank.id ? 'rgba(21,101,192,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedBank?.id === bank.id ? '#1565C0' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{bank.bank_name}</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{bank.account_name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: 'monospace' }}>
                      {bank.account_number}
                    </div>
                  </div>
                  {selectedBank?.id === bank.id && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!selectedBank} onClick={() => setStep('amount')}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Amount
        ════════════════════════════════════════ */}
        {step === 'amount' && method === 'bank_transfer' && selectedBank && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('select')}>← Back</button>
            <div className={styles.selectedCoinBadge}>
              <span style={{ color: '#1565C0' }}>🏦</span>
              {selectedBank.bank_name} · {selectedBank.account_number}
            </div>
            <h2 className={styles.cardTitle}>How much do you want to deposit?</h2>
            <p className={styles.cardSubtitle}>Enter the USD equivalent of your transfer — minimum $10</p>
            <div className={styles.amountInputWrap}>
              <div className={styles.amountInputBox}>
                <span style={{ color: '#9ca3af', fontSize: '20px', paddingLeft: '14px' }}>$</span>
                <input
                  type="number"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  min="10"
                  step="0.01"
                />
                <span className={styles.amountSymbol}>USD</span>
              </div>
            </div>
            <div className={styles.infoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Your account is credited once the transfer is confirmed by our team (usually within 1–2 hours on business days).
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!usdAmount || parseFloat(usdAmount) < 10}
                onClick={() => setStep('details')}
              >
                Next: Transfer Details →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Payment Details
        ════════════════════════════════════════ */}
        {step === 'details' && method === 'bank_transfer' && selectedBank && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('amount')}>← Back</button>
            <h2 className={styles.cardTitle}>Transfer to this account</h2>
            <p className={styles.cardSubtitle}>Send exactly <strong style={{ color: '#fff' }}>{formatUSD(parseFloat(usdAmount))}</strong> to the account below, then fill in your payment details.</p>

            {/* Bank account details card */}
            <div style={{ background: 'rgba(21,101,192,0.06)', border: '1px solid rgba(21,101,192,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Details</div>
              {[
                { label: 'Bank Name', value: selectedBank.bank_name },
                { label: 'Account Name', value: selectedBank.account_name },
                { label: 'Account Number', value: selectedBank.account_number },
                { label: 'Sort Code', value: selectedBank.sort_code },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: row.label === 'Account Number' ? 700 : 400, fontFamily: row.label === 'Account Number' ? 'monospace' : 'inherit' }}>
                      {row.value}
                    </span>
                    {(row.label === 'Account Number') && (
                      <button
                        onClick={() => handleCopy(row.value, selectedBank.id)}
                        style={{ background: 'rgba(21,101,192,0.2)', border: '1px solid rgba(21,101,192,0.3)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', color: bankCopied === selectedBank.id ? '#22c55e' : '#1565C0', fontSize: '11px' }}
                      >
                        {bankCopied === selectedBank.id ? '✓ Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sender details form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Your Name (as it appears on your bank account) *</label>
                <input
                  type="text"
                  placeholder="e.g. John Adeyemi"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Your Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Access Bank"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Payment Reference / Transaction ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FT2506140001"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!bankDetailsValid}
                onClick={() => setStep('confirm')}
              >
                I've Made the Transfer →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Confirm
        ════════════════════════════════════════ */}
        {step === 'confirm' && method === 'bank_transfer' && selectedBank && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('details')}>← Back</button>
            <h2 className={styles.cardTitle}>Confirm your deposit</h2>
            <p className={styles.cardSubtitle}>Review before submitting</p>
            {submitError && (
              <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{submitError}</div>
            )}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Method</span><span className={styles.summaryValue}>🏦 Bank Transfer</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>To Bank</span><span className={styles.summaryValue}>{selectedBank.bank_name}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Account No.</span><span className={styles.summaryValue} style={{ fontFamily: 'monospace' }}>{selectedBank.account_number}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Amount (USD)</span><span className={`${styles.summaryValue} ${styles.summaryAmount}`}>{formatUSD(parseFloat(usdAmount))}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Sender Name</span><span className={styles.summaryValue}>{senderName}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Sender Bank</span><span className={styles.summaryValue}>{senderBank}</span></div>
              {paymentReference && <div className={styles.summaryRow}><span className={styles.summaryLabel}>Reference</span><code className={styles.summaryAddress}>{paymentReference}</code></div>}
            </div>
            <div className={styles.checkRow}>
              <button className={`${styles.checkbox} ${confirmed ? styles.checkboxChecked : ''}`} onClick={() => setConfirmed(!confirmed)}>
                {confirmed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <span className={styles.checkLabel}>
                I confirm I have transferred <strong>{formatUSD(parseFloat(usdAmount))}</strong> to {selectedBank.bank_name} and provided accurate sender details.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!confirmed || submitLoading} onClick={handleConfirmPayment}>
                {submitLoading ? 'Submitting…' : 'Submit Deposit'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Select Coin
        ════════════════════════════════════════ */}
        {step === 'select' && method === 'crypto' && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('method')}>← Back</button>
            <h2 className={styles.cardTitle}>Choose cryptocurrency to deposit</h2>
            <p className={styles.cardSubtitle}>Select the network you want to deposit on</p>
            {networksLoading && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>Loading networks…</div>}
            {networksError && <div style={{ color: '#f87171', textAlign: 'center', padding: '20px' }}>{networksError}</div>}
            {!networksLoading && !networksError && (
              <div className={styles.coinGrid}>
                {networks.map((net) => {
                  const p = prices[net.symbol] || net.usd_rate || 0;
                  return (
                    <button
                      key={net.id}
                      className={`${styles.coinCard} ${selectedNetwork?.id === net.id ? styles.coinCardActive : ''}`}
                      style={selectedNetwork?.id === net.id ? { borderColor: net.color } : {}}
                      onClick={() => setSelectedNetwork(net)}
                    >
                      <div className={styles.coinIconWrap} style={{ color: net.color, background: `${net.color}18` }}>
                        <span className={styles.coinIcon}>{COIN_ICONS[net.symbol] ?? net.symbol.slice(0, 1)}</span>
                      </div>
                      <div className={styles.coinCardName}>{net.symbol}</div>
                      <div className={styles.coinCardSymbol}>{net.name}</div>
                      {p > 0 && <div className={styles.coinCardNetwork} style={{ color: net.color }}>{formatUSD(p)}</div>}
                      {selectedNetwork?.id === net.id && (
                        <div className={styles.coinCheck} style={{ background: net.color }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!selectedNetwork} onClick={() => setStep('amount')}>Continue →</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Amount
        ════════════════════════════════════════ */}
        {step === 'amount' && method === 'crypto' && selectedNetwork && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('select')}>← Back</button>
            <div className={styles.selectedCoinBadge}>
              <span style={{ color: selectedNetwork.color }}>{coinIcon}</span>
              {selectedNetwork.symbol} · {selectedNetwork.name}
              {price > 0 && <span style={{ color: '#9ca3af', fontSize: '12px' }}> · {formatUSD(price)}</span>}
            </div>
            <h2 className={styles.cardTitle}>How much do you want to deposit?</h2>
            <p className={styles.cardSubtitle}>Enter amount in USD — minimum {formatUSD(minDepositUsd)}</p>
            <div className={styles.amountInputWrap}>
              <div className={styles.amountInputBox}>
                <span style={{ color: '#9ca3af', fontSize: '20px', paddingLeft: '14px' }}>$</span>
                <input
                  type="number"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <span className={styles.amountSymbol}>USD</span>
              </div>
            </div>
            {usdAmount && parseFloat(usdAmount) > 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
                ≈ <strong style={{ color: '#fff' }}>{cryptoAmount} {selectedNetwork.symbol}</strong> at {formatUSD(price)}/{selectedNetwork.symbol}
              </div>
            )}
            <div className={styles.infoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Requires {selectedNetwork.confirmations} network confirmations. Processing takes 10–30 minutes.
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!usdAmount || parseFloat(usdAmount) < minDepositUsd}
                onClick={() => setStep('details')}
              >
                Get Deposit Address →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Address / Details
        ════════════════════════════════════════ */}
        {step === 'details' && method === 'crypto' && selectedNetwork && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('amount')}>← Back</button>
            <div className={styles.selectedCoinBadge}>
              <span style={{ color: selectedNetwork.color }}>{coinIcon}</span>
              {selectedNetwork.symbol} · {selectedNetwork.name}
            </div>
            <h2 className={styles.cardTitle}>Send to this address</h2>
            <p className={styles.cardSubtitle}>
              Send exactly <strong style={{ color: '#fff' }}>{formatUSD(parseFloat(usdAmount))}</strong> worth of {selectedNetwork.symbol} ({cryptoAmount} {selectedNetwork.symbol}) to:
            </p>
            <div className={styles.qrWrap}>
              <div className={styles.qrCode}>
                <svg viewBox="0 0 80 80" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="24" height="24" rx="3" fill="none" stroke={selectedNetwork.color} strokeWidth="3"/>
                  <rect x="9" y="9" width="14" height="14" rx="1" fill={selectedNetwork.color}/>
                  <rect x="52" y="4" width="24" height="24" rx="3" fill="none" stroke={selectedNetwork.color} strokeWidth="3"/>
                  <rect x="57" y="9" width="14" height="14" rx="1" fill={selectedNetwork.color}/>
                  <rect x="4" y="52" width="24" height="24" rx="3" fill="none" stroke={selectedNetwork.color} strokeWidth="3"/>
                  <rect x="9" y="57" width="14" height="14" rx="1" fill={selectedNetwork.color}/>
                  {[[34,4],[40,4],[46,4],[34,10],[46,10],[40,16],[34,22],[46,22],[4,34],[10,34],[22,34],[34,34],[46,34],[58,34],[70,34],[4,40],[16,40],[28,40],[40,40],[52,40],[64,40],[76,40],[4,46],[10,46],[28,46],[34,46],[52,46],[58,46],[70,46],[34,52],[40,52],[52,52],[64,52],[70,52],[76,52],[34,58],[46,58],[52,58],[64,58],[34,64],[40,64],[58,64],[70,64],[76,64],[34,70],[52,70],[58,70],[70,70],[34,76],[40,76],[46,76],[64,76],[76,76]].map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="5" height="5" rx="1" fill={selectedNetwork.color} opacity="0.85"/>
                  ))}
                </svg>
                <div className={styles.qrCoinLabel} style={{ color: selectedNetwork.color }}>{coinIcon}</div>
              </div>
            </div>
            {selectedNetwork.deposit_address ? (
              <div className={styles.addressBox}>
                <div className={styles.addressLabel}>Deposit Address ({selectedNetwork.name})</div>
                <div className={styles.addressRow}>
                  <code className={styles.addressCode}>{selectedNetwork.deposit_address}</code>
                  <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`} onClick={handleCryptoCopy}>
                    {copied ? (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>) : (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>)}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#f87171', textAlign: 'center', padding: '16px' }}>
                No deposit address configured for this network. Please contact support.
              </div>
            )}
            <div className={styles.warningBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Only send <strong>{selectedNetwork.symbol}</strong> on the <strong>{selectedNetwork.name}</strong>. Wrong coin = permanent loss.
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Transaction Hash (optional — speeds up confirmation)</label>
              <input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} onClick={() => setStep('confirm')}>I've Sent the Payment →</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Confirm
        ════════════════════════════════════════ */}
        {step === 'confirm' && method === 'crypto' && selectedNetwork && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('details')}>← Back</button>
            <h2 className={styles.cardTitle}>Confirm your deposit</h2>
            <p className={styles.cardSubtitle}>Review details before submitting</p>
            {submitError && (
              <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{submitError}</div>
            )}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Method</span><span className={styles.summaryValue}>₿ Cryptocurrency</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Coin</span><span className={styles.summaryValue}><span style={{ color: selectedNetwork.color }}>{coinIcon}</span> {selectedNetwork.symbol}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Network</span><span className={styles.summaryValue}>{selectedNetwork.name}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>USD Amount</span><span className={`${styles.summaryValue} ${styles.summaryAmount}`}>{formatUSD(parseFloat(usdAmount))}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Crypto Amount</span><span className={styles.summaryValue}>{cryptoAmount} {selectedNetwork.symbol}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>To Address</span><code className={styles.summaryAddress}>{(selectedNetwork.deposit_address ?? '').slice(0, 16)}…{(selectedNetwork.deposit_address ?? '').slice(-8)}</code></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Confirmations</span><span className={styles.summaryValue}>{selectedNetwork.confirmations} required</span></div>
              {txHash && <div className={styles.summaryRow}><span className={styles.summaryLabel}>TX Hash</span><code className={styles.summaryAddress}>{txHash.slice(0, 16)}…</code></div>}
            </div>
            <div className={styles.checkRow}>
              <button className={`${styles.checkbox} ${confirmed ? styles.checkboxChecked : ''}`} onClick={() => setConfirmed(!confirmed)}>
                {confirmed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <span className={styles.checkLabel}>
                I confirm I have sent <strong>{formatUSD(parseFloat(usdAmount))}</strong> worth of <strong>{selectedNetwork.symbol}</strong> to the address above.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!confirmed || submitLoading} onClick={handleConfirmPayment}>
                {submitLoading ? 'Submitting…' : 'Confirm Deposit'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            PROCESSING (shared)
        ════════════════════════════════════════ */}
        {step === 'processing' && (
          <div className={styles.fullCard}>
            <div className={styles.processingSpinner} style={{ borderTopColor: method === 'bank_transfer' ? '#1565C0' : (selectedNetwork?.color ?? '#22c55e') }} />
            <h2 className={styles.processingTitle}>Processing Your Deposit</h2>
            <p className={styles.processingText}>Submitting your <strong style={{ color: '#fff' }}>{formatUSD(parseFloat(usdAmount))}</strong> deposit request.</p>
            <div className={styles.processingSteps}>
              {(method === 'bank_transfer'
                ? ['Transfer details received', 'Matching your payment', 'Pending admin review']
                : ['Transaction received', 'Awaiting confirmations', 'Pending admin review']
              ).map((s, i) => (
                <div key={i} className={styles.procStep}>
                  <div className={styles.procDot} style={{ animationDelay: `${i * 0.4}s` }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DONE (shared)
        ════════════════════════════════════════ */}
        {step === 'done' && (
          <div className={styles.fullCard}>
            <div className={styles.doneRing} style={{ borderColor: '#1565C050', background: '#1565C012' }}>
              <div className={styles.doneIcon} style={{ color: '#1565C0' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <h2 className={styles.doneTitle}>Deposit Submitted!</h2>
            <p className={styles.doneText}>
              Your {method === 'bank_transfer' ? 'bank transfer' : 'crypto'} deposit of{' '}
              <strong style={{ color: '#1565C0' }}>{formatUSD(parseFloat(usdAmount))}</strong> is pending admin review.
            </p>
            <div className={styles.doneDetails}>
              <div className={styles.doneRow}><span>Status</span><span className={styles.statusPending}>● Pending</span></div>
              <div className={styles.doneRow}><span>Amount</span><span>{formatUSD(parseFloat(usdAmount))}</span></div>
              <div className={styles.doneRow}><span>Method</span><span>{method === 'bank_transfer' ? '🏦 Bank Transfer' : `₿ ${selectedNetwork?.symbol ?? 'Crypto'}`}</span></div>
              <div className={styles.doneRow}><span>Est. time</span><span>{method === 'bank_transfer' ? '1–2 business hours' : '10–30 minutes'}</span></div>
            </div>
            <div className={styles.doneActions}>
              <button className={styles.btnPrimary} onClick={handleReset}>Make Another Deposit</button>
              <a href="/dashboard/transactions" className={styles.btnSecondary}>View Transaction History</a>
            </div>
          </div>
        )}
      </div>

      {/* Side info panel (replaces TradingView widget) */}
      <div className={styles.widgetSide}>
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Funding Methods</h3>
          {[
            { emoji: '🏦', title: 'Bank Transfer', lines: ['Transfer from any Nigerian bank', 'Credited within 1–2 business hours', 'No deposit fees', 'Minimum: $10'] },
            { emoji: '₿', title: 'Cryptocurrency', lines: ['Supports BTC, ETH, USDT & more', 'Credited after network confirmations', 'Processing: 10–30 minutes', 'Minimum varies by coin'] },
          ].map((m) => (
            <div key={m.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>{m.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{m.title}</div>
              {m.lines.map((l) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1565C0', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{l}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.2)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
              🔒 All deposits are reviewed by our compliance team. Funds appear in your account after verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
