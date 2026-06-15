import { useState, useEffect } from 'react';
import styles from './MarketsPage.module.css';
import { fetchMarketData, type MarketCoin, formatUSD } from '@/services/prices';

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 90, h = 36;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const pts = points.map((p, i) => ({ x: i * step, y: h - ((p - min) / range) * (h - 4) - 2 }));
  const d = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const area = `${d} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  const color = positive ? '#22c55e' : '#ef4444';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={area} fill={color} opacity="0.12" />
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COIN_ICONS: Record<string, string> = { BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: '⬥', SOL: '◎', XRP: '✕' };

export default function MarketsPage() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = () => {
    fetchMarketData().then((data) => {
      setCoins(data);
      setLastUpdated(new Date());
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = coins.filter((c) =>
    c.symbol.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Market Overview</h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Live Prices</span>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search coins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={load} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(21,101,192,0.15)', color: '#1565C0', border: '1px solid rgba(21,101,192,0.3)', cursor: 'pointer', fontSize: '13px' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading market data…</div>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableHead}>
            <span>#</span>
            <span>Asset</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Market Cap</span>
            <span>7D Chart</span>
          </div>
          {filtered.map((coin, idx) => {
            const positive = coin.change24h >= 0;
            return (
              <div key={coin.symbol} className={styles.tableRow}>
                <span className={styles.rank}>{idx + 1}</span>
                <div className={styles.assetCell}>
                  <div className={styles.coinIcon} style={{ color: coin.color, background: `${coin.color}18` }}>
                    {COIN_ICONS[coin.symbol] ?? coin.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <div className={styles.coinName}>{coin.name}</div>
                    <div className={styles.coinSymbol}>{coin.symbol}</div>
                  </div>
                </div>
                <div className={styles.priceCell}>{formatUSD(coin.price)}</div>
                <div className={`${styles.changeCell} ${positive ? styles.changePos : styles.changeNeg}`}>
                  {positive ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                </div>
                <div className={styles.capCell}>{coin.marketCap}</div>
                <div className={styles.sparkCell}>
                  <Sparkline points={coin.sparkPoints} positive={positive} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
