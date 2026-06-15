import { useState, useEffect } from 'react';
import { fetchMarketData, type MarketCoin, formatUSD } from '@/services/prices';

export default function AdminMarkets() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = () => {
    fetchMarketData().then(data => { setCoins(data); setLastUpdated(new Date()); setLoading(false); });
  };

  useEffect(() => { load(); const i = setInterval(load, 60_000); return () => clearInterval(i); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Live Market Data</h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Live</span>
          <button onClick={load} style={{ marginLeft: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(21,101,192,0.15)', color: '#1565C0', border: '1px solid rgba(21,101,192,0.3)', cursor: 'pointer', fontSize: '12px' }}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading market data…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {coins.map(coin => {
            const positive = coin.change24h >= 0;
            return (
              <div key={coin.symbol} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${coin.color}20`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${coin.color}18`, color: coin.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                      {coin.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{coin.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{coin.symbol}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{formatUSD(coin.price)}</div>
                    <div style={{ fontSize: '12px', color: positive ? '#22c55e' : '#ef4444', marginTop: '2px' }}>
                      {positive ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#6b7280' }}>Market Cap</span>
                  <span style={{ color: '#9ca3af' }}>{coin.marketCap}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
