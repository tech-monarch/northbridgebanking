import { useState } from 'react';
import styles from './MarketOverview.module.css';

// Static fintech rate overview — no live crypto price dependency
interface RateItem {
  flag: string;
  pair: string;
  name: string;
  rate: string;
  change: number;
  color: string;
}

const RATES: RateItem[] = [
  { flag: '🇪🇺', pair: 'EUR/USD', name: 'Euro', rate: '$1.0820', change: 0.31, color: '#f59e0b' },
  { flag: '🇬🇧', pair: 'GBP/USD', name: 'British Pound', rate: '$1.2700', change: -0.18, color: '#1565C0' },
  { flag: '🇨🇦', pair: 'CAD/USD', name: 'Canadian Dollar', rate: '$0.7300', change: -0.09, color: '#ef4444' },
  { flag: '🇦🇺', pair: 'AUD/USD', name: 'Australian Dollar', rate: '$0.6600', change: 0.57, color: '#9945ff' },
  { flag: '🇨🇭', pair: 'CHF/USD', name: 'Swiss Franc', rate: '$1.1300', change: 0.12, color: '#26a17b' },
];

function MiniBar({ positive }: { positive: boolean }) {
  const bars = [4, 7, 5, 9, 6, 8, 10, 7, 12];
  const color = positive ? '#22c55e' : '#ef4444';
  return (
    <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
      {bars.map((h, i) => (
        <rect key={i} x={i * 7} y={28 - h * 2.2} width="5" height={h * 2.2} rx="1.5" fill={color} opacity={0.6 + i * 0.04} />
      ))}
    </svg>
  );
}

export default function MarketOverview() {
  const [lastUpdated] = useState(() => new Date().toLocaleTimeString());

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>FX Rates</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: '#6b7280' }}>Updated {lastUpdated}</span>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>Currency</span>
          <span>USD Rate</span>
          <span>24h</span>
          <span>Source</span>
          <span>Trend</span>
        </div>
        {RATES.map((item) => {
          const positive = item.change >= 0;
          return (
            <div key={item.pair} className={styles.tableRow}>
              <div className={styles.coinCell}>
                <div className={styles.coinIcon} style={{ color: item.color, background: `${item.color}18`, fontSize: '16px' }}>
                  {item.flag}
                </div>
                <div>
                  <div className={styles.coinName}>{item.name}</div>
                  <div className={styles.coinSymbol}>{item.pair}</div>
                </div>
              </div>
              <div className={styles.priceCell}>
                <div className={styles.price}>{item.rate}</div>
              </div>
              <div className={`${styles.changeCell} ${positive ? styles.positive : styles.negative}`}>
                {positive ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
              </div>
              <div className={styles.capCell} style={{ fontSize: '11px', color: '#9ca3af' }}>Open Market</div>
              <div className={styles.sparkCell}>
                <MiniBar positive={positive} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
