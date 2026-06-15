// ─── Live Crypto Price Service ──────────────────────────────────────────────
// Fetches from CoinGecko with graceful fallback

const FALLBACK_PRICES: Record<string, number> = {
  BTC: 95420.00,
  ETH: 3180.50,
  BNB: 610.25,
  USDT: 1.00,
  USDC: 1.00,
  SOL: 148.32,
  XRP: 2.15,
  TRX: 0.24,
  LTC: 88.40,
  ADA: 0.44,
};

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
  SOL: 'solana',
  XRP: 'ripple',
  TRX: 'tron',
  LTC: 'litecoin',
  ADA: 'cardano',
};

let priceCache: Record<string, number> = {};
let lastFetch = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function fetchAllPrices(symbols: string[]): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL && Object.keys(priceCache).length > 0) {
    return priceCache;
  }

  const ids = symbols
    .map((s) => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)
    .join(',');

  if (!ids) return { ...FALLBACK_PRICES };

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('CoinGecko error');
    const data = await res.json();

    const result: Record<string, number> = {};
    for (const sym of symbols) {
      const id = COINGECKO_IDS[sym.toUpperCase()];
      if (id && data[id]?.usd) {
        result[sym.toUpperCase()] = data[id].usd;
      } else {
        result[sym.toUpperCase()] = FALLBACK_PRICES[sym.toUpperCase()] ?? 1;
      }
    }
    priceCache = result;
    lastFetch = now;
    return result;
  } catch {
    // Return fallback on any error
    return { ...FALLBACK_PRICES };
  }
}

export async function fetchPrice(symbol: string): Promise<number> {
  const prices = await fetchAllPrices([symbol.toUpperCase()]);
  return prices[symbol.toUpperCase()] ?? FALLBACK_PRICES[symbol.toUpperCase()] ?? 1;
}

export function getFallbackPrice(symbol: string): number {
  return FALLBACK_PRICES[symbol.toUpperCase()] ?? 1;
}

export function usdToCrypto(usdAmount: number, pricePerCoin: number): number {
  if (pricePerCoin <= 0) return 0;
  return usdAmount / pricePerCoin;
}

export function cryptoToUsd(cryptoAmount: number, pricePerCoin: number): number {
  return cryptoAmount * pricePerCoin;
}

export function formatCrypto(amount: number, symbol: string): string {
  const decimals = ['BTC', 'ETH', 'LTC'].includes(symbol.toUpperCase()) ? 6 : 4;
  return `${amount.toFixed(decimals)} ${symbol.toUpperCase()}`;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Market data for dashboard
export interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: string;
  color: string;
  sparkPoints: number[];
}

export async function fetchMarketData(): Promise<MarketCoin[]> {
  const COINS = [
    { symbol: 'BTC', name: 'Bitcoin',  color: '#f7931a', id: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627eea', id: 'ethereum' },
    { symbol: 'USDT',name: 'Tether',   color: '#26a17b', id: 'tether' },
    { symbol: 'BNB', name: 'BNB',      color: '#f3ba2f', id: 'binancecoin' },
    { symbol: 'SOL', name: 'Solana',   color: '#9945ff', id: 'solana' },
    { symbol: 'XRP', name: 'XRP',      color: '#346aa9', id: 'ripple' },
  ];

  try {
    const ids = COINS.map((c) => c.id).join(',');
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) throw new Error('fail');
    const data = await res.json();

    return COINS.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      color: c.color,
      price: data[c.id]?.usd ?? FALLBACK_PRICES[c.symbol] ?? 1,
      change24h: data[c.id]?.usd_24h_change ?? 0,
      marketCap: formatMarketCap(data[c.id]?.usd_market_cap ?? 0),
      sparkPoints: generateSparkPoints(data[c.id]?.usd_24h_change ?? 0),
    }));
  } catch {
    return COINS.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      color: c.color,
      price: FALLBACK_PRICES[c.symbol] ?? 1,
      change24h: (Math.random() - 0.5) * 6,
      marketCap: '—',
      sparkPoints: generateSparkPoints((Math.random() - 0.5) * 6),
    }));
  }
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toFixed(0)}`;
}

function generateSparkPoints(change: number): number[] {
  // Generate plausible 9-point spark based on positive/negative trend
  const points: number[] = [];
  let val = 50;
  for (let i = 0; i < 9; i++) {
    const drift = change > 0 ? -2 : 2; // positive change = downtrend in spark (spark shows from high to now)
    val += drift + (Math.random() - 0.5) * 6;
    val = Math.max(5, Math.min(95, val));
    points.push(val);
  }
  return points;
}
