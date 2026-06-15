import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './WalletPage.module.css';
import { useAuth } from '@/context/AuthContext';
import api, { type Network } from '@/services/api';
import { fetchAllPrices, formatUSD, usdToCrypto } from '@/services/prices';

const COIN_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: '⬥', SOL: '◎', XRP: '✕', USDC: '$', TRX: '⚡',
};

export default function WalletPage() {
  const { user } = useAuth();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Network[]>('/networks').then(async (nets) => {
      const active = (nets || []).filter((n) => n.is_active);
      setNetworks(active);
      // Fetch live prices for all active network symbols
      const syms = active.map((n) => n.symbol);
      const p = await fetchAllPrices(syms);
      setPrices(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const balance = user ? Number(user.balance) : 0;

  // Distribute balance across networks proportionally (demo allocation for display)
  // In reality balance is USD; we show conversion to each crypto
  const getWalletData = (net: Network) => {
    const price = prices[net.symbol] || net.usd_rate || 1;
    // Show what the user's balance would be in this crypto
    const cryptoEquivalent = price > 0 ? balance / price : 0;
    return { price, cryptoEquivalent };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>My Wallets</h1>
          <p>Your balance in supported cryptocurrencies</p>
        </div>
        <Link to="/dashboard/deposit" className={styles.btnCreateWallet} style={{ textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Deposit Funds
        </Link>
      </div>

      {/* Total Balance Card */}
      <div className={styles.totalBalanceCard}>
        <div className={styles.balanceGlow} />
        <div className={styles.totalBalanceLeft}>
          <span className={styles.balanceLabelTop}>Total Portfolio Value (USD)</span>
          <h2 className={styles.balanceAmount}>{formatUSD(balance)}</h2>
          <div className={styles.balanceMeta}>
            <span className={styles.balanceSeparator}>·</span>
            <span className={styles.walletCountLabel}>{networks.length} supported assets</span>
          </div>
        </div>
        <div className={styles.totalBalanceRight}>
          <div className={styles.miniBarChart}>
            {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
              <div key={i} className={styles.bar} style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.35 + i * 0.1 }} />
            ))}
          </div>
          <span className={styles.chartLabel}>Portfolio</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading wallets…</div>
      ) : (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Asset Breakdown</h2>
            <span className={styles.sectionCount}>{networks.length} assets</span>
          </div>
          <div className={styles.walletGrid}>
            {networks.map((net) => {
              const { price, cryptoEquivalent } = getWalletData(net);
              return (
                <div
                  key={net.id}
                  className={styles.walletCard}
                  style={{ '--coin-color': net.color, '--grad-from': `${net.color}18`, '--grad-to': `${net.color}03` } as React.CSSProperties}
                >
                  <div className={styles.cardGlow} />
                  <div className={styles.cardHeader}>
                    <div className={styles.coinInfo}>
                      <div className={styles.coinIconWrap} style={{ color: net.color, background: `${net.color}18` }}>
                        <span className={styles.coinIcon}>{COIN_ICONS[net.symbol] ?? net.symbol.slice(0, 1)}</span>
                      </div>
                      <div>
                        <h3 className={styles.coinName}>{net.name}</h3>
                        <span className={styles.coinSymbol}>{net.symbol}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>1 {net.symbol}</div>
                      <div style={{ fontSize: '13px', color: '#e5e7eb', fontWeight: 600 }}>{formatUSD(price)}</div>
                    </div>
                  </div>
                  <div className={styles.cardBalance}>
                    <div className={styles.balanceCrypto}>
                      {cryptoEquivalent > 0 ? cryptoEquivalent.toFixed(6) : '0.000000'}
                      <span className={styles.balanceTicker}> {net.symbol}</span>
                    </div>
                    <div className={styles.balanceUsd}>{formatUSD(balance)}</div>
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Min Deposit</span>
                      <span className={styles.metaValue}>{net.min_deposit} {net.symbol}</span>
                    </div>
                    <div className={styles.metaDot} />
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Status</span>
                      <span className={styles.metaValueActive}>● Active</span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Link to="/dashboard/deposit" className={styles.btnDeposit} style={{ textDecoration: 'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Deposit
                    </Link>
                    <Link to="/dashboard/withdraw" className={styles.btnSend} style={{ textDecoration: 'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Withdraw
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          {[
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, title: 'Deposit Funds', desc: 'Add crypto to your account', cta: 'Deposit', accent: '#22c853', to: '/dashboard/deposit' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 10 12 5 7 10"/><line x1="12" y1="5" x2="12" y2="15"/></svg>, title: 'Withdraw Funds', desc: 'Send crypto to external wallet', cta: 'Withdraw', accent: '#ef4444', to: '/dashboard/withdraw' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, title: 'Transaction History', desc: 'View all your transactions', cta: 'View History', accent: '#1565C0', to: '/dashboard/transactions' },
          ].map((action, i) => (
            <div key={i} className={styles.actionCard} style={{ '--action-accent': action.accent } as React.CSSProperties}>
              <div className={styles.actionIconWrap} style={{ color: action.accent, background: `${action.accent}18` }}>
                {action.icon}
              </div>
              <div className={styles.actionBody}>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
              </div>
              <Link to={action.to} className={styles.btnAction} style={{ color: action.accent, borderColor: `${action.accent}40`, textDecoration: 'none' }}>
                {action.cta}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
