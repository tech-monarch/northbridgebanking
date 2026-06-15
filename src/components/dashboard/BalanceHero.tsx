import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './BalanceHero.module.css';
import { useAuth } from '@/context/AuthContext';
import { formatUSD } from '@/services/prices';

const CHART_POINTS = [
  { x: 0, y: 200 }, { x: 60, y: 185 }, { x: 120, y: 160 }, { x: 170, y: 140 },
  { x: 220, y: 120 }, { x: 270, y: 90 }, { x: 320, y: 75 }, { x: 370, y: 55 }, { x: 410, y: 20 },
];

const TIME_FILTERS = ['1D', '1W', '1M', '3M', '1Y', 'All'];

function buildPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
}

function buildArea(points: { x: number; y: number }[]) {
  const last = points[points.length - 1];
  const first = points[0];
  const line = buildPath(points);
  return `${line} L${last.x},220 L${first.x},220 Z`;
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export default function BalanceHero() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('1M');
  const [visible, setVisible] = useState(true);

  const balance = user ? Number(user.balance) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.balanceLabel}>
          Total Account Balance
          <button className={styles.eyeBtn} onClick={() => setVisible(!visible)}>
            <EyeIcon />
          </button>
        </div>
        <div className={styles.balanceValue}>
          {visible ? formatUSD(balance) : '••••••••'}
        </div>
        <div className={styles.balanceSubrow}>
          <span className={styles.usd}>Available for withdrawal</span>
          <span className={styles.badge}>USD</span>
        </div>
        <div className={styles.actions}>
          <Link to="/dashboard/deposit" className={styles.btnDeposit} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Fund Account
          </Link>
          <Link to="/dashboard/withdraw" className={styles.btnWithdraw} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 10 12 5 7 10"/><line x1="12" y1="5" x2="12" y2="15"/>
            </svg>
            Withdraw
          </Link>
          <Link to="/dashboard/transactions" className={styles.btnWithdraw} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            History
          </Link>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.timeFilters}>
          {TIME_FILTERS.map((f) => (
            <button key={f} className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ''}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className={styles.chartWrap}>
          <svg viewBox="0 0 420 220" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1565C0" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#1565C0" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={buildArea(CHART_POINTS)} fill="url(#heroGrad)"/>
            <path d={buildPath(CHART_POINTS)} stroke="#1565C0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx={CHART_POINTS[CHART_POINTS.length - 1].x} cy={CHART_POINTS[CHART_POINTS.length - 1].y} r="5" fill="#1565C0"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
