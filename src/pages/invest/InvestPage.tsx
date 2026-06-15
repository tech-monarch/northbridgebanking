import { useState, useEffect, useRef, useCallback, memo } from "react";
import styles from "./InvestPage.module.css";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { formatUSD } from "@/services/prices";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coin {
  symbol: string;
  name: string;
  price: number;
  change: number;
  color: string;
  icon: string;
  volume: string;
  high: string;
  low: string;
  tvSymbol: string;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface RecentTrade {
  time: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
}

interface ActiveTrade {
  id: string;
  pair: string;
  side: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  usdValue: number;
  sl: number | null;
  tp: number | null;
  pnl: number;
  pnlPct: number;
  openedAt: string;
  status: "open";
}

interface ClosedTrade {
  id: string;
  pair: string;
  side: "buy" | "sell";
  entryPrice: number;
  closePrice: number;
  amount: number;
  usdValue: number;
  pnl: number;
  pnlPct: number;
  closedAt: string;
  closeReason: "manual" | "sl" | "tp";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COINS: Coin[] = [
  { symbol: "BTC", name: "Bitcoin",   price: 67842.5, change: +2.34, color: "#f7931a", icon: "₿", volume: "$38.2B", high: "$68,910", low: "$65,420", tvSymbol: "BITSTAMP:BTCUSD"   },
  { symbol: "ETH", name: "Ethereum",  price: 3521.8,  change: +1.87, color: "#627eea", icon: "Ξ", volume: "$18.4B", high: "$3,590",  low: "$3,390",  tvSymbol: "BITSTAMP:ETHUSD"   },
  { symbol: "BNB", name: "BNB",       price: 612.4,   change: -0.63, color: "#f0b90b", icon: "⬥", volume: "$2.1B",  high: "$621",    low: "$601",    tvSymbol: "BINANCE:BNBUSDT"   },
  { symbol: "SOL", name: "Solana",    price: 162.75,  change: +4.12, color: "#9945ff", icon: "◎", volume: "$4.8B",  high: "$167",    low: "$154",    tvSymbol: "BINANCE:SOLUSDT"   },
  { symbol: "XRP", name: "XRP",       price: 2.18,    change: +0.92, color: "#00aae4", icon: "✕", volume: "$3.2B",  high: "$2.24",   low: "$2.10",   tvSymbol: "BITSTAMP:XRPUSD"   },
  { symbol: "ADA", name: "Cardano",   price: 0.452,   change: -1.44, color: "#0033ad", icon: "₳", volume: "$0.8B",  high: "$0.468",  low: "$0.438",  tvSymbol: "BINANCE:ADAUSDT"   },
  { symbol: "AVAX",name: "Avalanche", price: 38.92,   change: +3.21, color: "#e84142", icon: "A", volume: "$0.9B",  high: "$40.10",  low: "$37.20",  tvSymbol: "BINANCE:AVAXUSDT"  },
  { symbol: "DOGE",name: "Dogecoin",  price: 0.162,   change: -2.11, color: "#c2a633", icon: "Ð", volume: "$1.2B",  high: "$0.171",  low: "$0.158",  tvSymbol: "BINANCE:DOGEUSDT"  },
];

// ─── TradingView Widget ───────────────────────────────────────────────────────

interface TVWidgetProps { symbol: string; }

const TradingViewWidget = memo(({ symbol }: TVWidgetProps) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!container.current) return;
    // Remove old script
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    // Clear widget div
    const widgetDiv = container.current.querySelector(".tradingview-widget-container__widget");
    if (widgetDiv) widgetDiv.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: "1",
      locale: "en",
      save_image: true,
      style: "1",
      symbol,
      theme: "dark",
      timezone: "Etc/UTC",
      backgroundColor: "#0d1117",
      gridColor: "rgba(255,255,255,0.04)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true,
    });
    scriptRef.current = script;
    container.current.appendChild(script);

    return () => {
      if (scriptRef.current) { scriptRef.current.remove(); scriptRef.current = null; }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
});

// ─── Order Book Live Simulation ───────────────────────────────────────────────

function generateOrderBook(basePrice: number): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];
  for (let i = 0; i < 8; i++) {
    const askPrice = basePrice + (i + 1) * (basePrice * 0.0002) + Math.random() * basePrice * 0.0001;
    const askAmt = +(Math.random() * 1.5 + 0.05).toFixed(4);
    asks.push({ price: +askPrice.toFixed(2), amount: askAmt, total: +(askPrice * askAmt).toFixed(0) });

    const bidPrice = basePrice - (i + 1) * (basePrice * 0.0002) - Math.random() * basePrice * 0.0001;
    const bidAmt = +(Math.random() * 1.5 + 0.05).toFixed(4);
    bids.push({ price: +bidPrice.toFixed(2), amount: bidAmt, total: +(bidPrice * bidAmt).toFixed(0) });
  }
  return { asks, bids };
}

function generateTrade(basePrice: number, symbol: string): RecentTrade {
  const side = Math.random() > 0.5 ? "buy" : "sell";
  const price = basePrice + (Math.random() - 0.5) * basePrice * 0.0008;
  const amount = +(Math.random() * 0.8 + 0.01).toFixed(4);
  const now = new Date();
  return {
    time: `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`,
    price: +price.toFixed(2),
    amount,
    side,
  };
}

// ─── Trade Engine (90% profit bias) ──────────────────────────────────────────

function simulateNextPrice(current: number, entryPrice: number, side: "buy" | "sell"): number {
  // 90% chance of moving in profitable direction
  const profitable = Math.random() < 0.90;
  const magnitude = current * (0.0001 + Math.random() * 0.0008);

  let direction: number;
  if (side === "buy") {
    direction = profitable ? 1 : -1;
  } else {
    direction = profitable ? -1 : 1;
  }
  const noise = (Math.random() - 0.5) * current * 0.0002;
  return +(current + direction * magnitude + noise).toFixed(current < 10 ? 5 : 2);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const balance = user ? Number(user.balance) : 0;

  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[0]);
  const [coinPrices, setCoinPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(COINS.map((c) => [c.symbol, c.price]))
  );

  const [orderSide, setOrderSide]     = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType]     = useState<"market" | "limit" | "stop">("market");
  const [amount, setAmount]           = useState("");
  const [limitPrice, setLimitPrice]   = useState("");
  const [slPrice, setSlPrice]         = useState("");
  const [tpPrice, setTpPrice]         = useState("");
  const [ordersTab, setOrdersTab]     = useState<"active" | "history">("active");
  const [isPlacing, setIsPlacing]     = useState(false);
  const [placeError, setPlaceError]   = useState("");
  const [placeSuccess, setPlaceSuccess] = useState("");

  const [orderBook, setOrderBook]     = useState(() => generateOrderBook(COINS[0].price));

  const [activeTrades, setActiveTrades]   = useState<ActiveTrade[]>([]);
  const [closedTrades, setClosedTrades]   = useState<ClosedTrade[]>([]);
  const [localBalance, setLocalBalance]   = useState(balance);

  // Sync balance from auth
  useEffect(() => { setLocalBalance(Number(user?.balance ?? 0)); }, [user]);

  const currentPrice = coinPrices[selectedCoin.symbol];
  const positive = selectedCoin.change >= 0;
  const estTotal = amount ? (parseFloat(amount) * currentPrice).toFixed(2) : "0.00";

  // ─── Order book simulation ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const base = coinPrices[selectedCoin.symbol];
      setOrderBook(generateOrderBook(base));
    }, 1500);
    return () => clearInterval(interval);
  }, [selectedCoin.symbol, coinPrices]);

  // ─── Coin price drift ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCoinPrices((prev) => {
        const next = { ...prev };
        COINS.forEach((c) => {
          const drift = (Math.random() - 0.48) * c.price * 0.0004;
          next[c.symbol] = +(prev[c.symbol] + drift).toFixed(c.price < 10 ? 5 : 2);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ─── Active trade price simulation + SL/TP/auto-close ─────────────────────
  useEffect(() => {
    if (activeTrades.length === 0) return;
    const interval = setInterval(() => {
      setActiveTrades((prev) => {
        const toClose: ClosedTrade[] = [];
        const remaining = prev.map((trade) => {
          const newPrice = simulateNextPrice(trade.currentPrice, trade.entryPrice, trade.side);
          const rawPnl = trade.side === "buy"
            ? (newPrice - trade.entryPrice) * trade.amount
            : (trade.entryPrice - newPrice) * trade.amount;
          const pnl = +rawPnl.toFixed(2);
          const pnlPct = +((rawPnl / trade.usdValue) * 100).toFixed(2);

          // Check SL / TP
          let closeReason: "sl" | "tp" | null = null;
          if (trade.tp && trade.side === "buy"  && newPrice >= trade.tp) closeReason = "tp";
          if (trade.tp && trade.side === "sell" && newPrice <= trade.tp) closeReason = "tp";
          if (trade.sl && trade.side === "buy"  && newPrice <= trade.sl) closeReason = "sl";
          if (trade.sl && trade.side === "sell" && newPrice >= trade.sl) closeReason = "sl";

          if (closeReason) {
            const closePrice = closeReason === "tp" ? trade.tp! : trade.sl!;
            const finalPnl = trade.side === "buy"
              ? (closePrice - trade.entryPrice) * trade.amount
              : (trade.entryPrice - closePrice) * trade.amount;
            toClose.push({
              id: trade.id, pair: trade.pair, side: trade.side,
              entryPrice: trade.entryPrice, closePrice,
              amount: trade.amount, usdValue: trade.usdValue,
              pnl: +finalPnl.toFixed(2), pnlPct: +((finalPnl / trade.usdValue) * 100).toFixed(2),
              closedAt: new Date().toLocaleTimeString(), closeReason,
            });
            return null;
          }

          return { ...trade, currentPrice: newPrice, pnl, pnlPct };
        }).filter(Boolean) as ActiveTrade[];

        if (toClose.length > 0) {
          setClosedTrades((c) => [...toClose, ...c]);
          const totalPnl = toClose.reduce((sum, t) => sum + t.pnl, 0);
          setLocalBalance((b) => +((b + toClose.reduce((s, t) => s + t.usdValue, 0) + totalPnl).toFixed(2)));
          // Persist to backend
          toClose.forEach((t) => {
            api.post("/trades/close", {
              trade_id: t.id, close_price: t.closePrice, pnl: t.pnl, close_reason: t.closeReason,
            }).catch(() => {});
          });
        }

        return remaining;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activeTrades.length]);

  // ─── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    setPlaceError(""); setPlaceSuccess("");
    const qty = parseFloat(amount);
    if (!qty || qty <= 0) { setPlaceError("Enter a valid amount"); return; }

    const execPrice = orderType === "market" ? currentPrice : parseFloat(limitPrice) || currentPrice;
    const usdCost = qty * execPrice;
    const fee = usdCost * 0.001;

    if (orderSide === "buy" && usdCost + fee > localBalance) {
      setPlaceError("Insufficient balance"); return;
    }

    setIsPlacing(true);
    try {
      // Deduct from local balance immediately for buy
      if (orderSide === "buy") {
        setLocalBalance((b) => +((b - usdCost - fee).toFixed(2)));
      }

      const newTrade: ActiveTrade = {
        id: `T${Date.now()}`,
        pair: `${selectedCoin.symbol}/USD`,
        side: orderSide,
        entryPrice: execPrice,
        currentPrice: execPrice,
        amount: qty,
        usdValue: usdCost,
        sl: slPrice ? parseFloat(slPrice) : null,
        tp: tpPrice ? parseFloat(tpPrice) : null,
        pnl: 0,
        pnlPct: 0,
        openedAt: new Date().toLocaleTimeString(),
        status: "open",
      };

      setActiveTrades((prev) => [newTrade, ...prev]);
      setAmount(""); setLimitPrice(""); setSlPrice(""); setTpPrice("");
      setPlaceSuccess(`${orderSide === "buy" ? "Buy" : "Sell"} order placed — ${qty} ${selectedCoin.symbol} @ $${execPrice.toLocaleString()}`);

      // Fire to backend (non-blocking)
      api.post("/trades/place", {
        symbol: selectedCoin.symbol, pair: newTrade.pair, side: orderSide,
        order_type: orderType, amount: qty, entry_price: execPrice,
        usd_value: usdCost, fee, sl: newTrade.sl, tp: newTrade.tp,
      }).catch(() => {});

    } catch {
      setPlaceError("Order failed. Please try again.");
      if (orderSide === "buy") setLocalBalance((b) => +((b + parseFloat(estTotal) * 1.001).toFixed(2)));
    } finally {
      setIsPlacing(false);
      setTimeout(() => { setPlaceSuccess(""); setPlaceError(""); }, 4000);
    }
  }, [amount, orderSide, orderType, currentPrice, limitPrice, slPrice, tpPrice, localBalance, selectedCoin, estTotal]);

  // ─── Manual close trade ────────────────────────────────────────────────────
  const handleCloseTrade = useCallback((trade: ActiveTrade) => {
    setActiveTrades((prev) => prev.filter((t) => t.id !== trade.id));
    const finalUsd = trade.usdValue + trade.pnl;
    setLocalBalance((b) => +((b + finalUsd).toFixed(2)));
    setClosedTrades((prev) => [{
      id: trade.id, pair: trade.pair, side: trade.side,
      entryPrice: trade.entryPrice, closePrice: trade.currentPrice,
      amount: trade.amount, usdValue: trade.usdValue, pnl: trade.pnl, pnlPct: trade.pnlPct,
      closedAt: new Date().toLocaleTimeString(), closeReason: "manual",
    }, ...prev]);
    api.post("/trades/close", {
      trade_id: trade.id, close_price: trade.currentPrice, pnl: trade.pnl, close_reason: "manual",
    }).catch(() => {});
  }, []);

  const handlePercentage = (pct: number) => {
    const maxBuy = localBalance / currentPrice;
    const demoHolding = activeTrades
      .filter((t) => t.pair === `${selectedCoin.symbol}/USD` && t.side === "sell")
      .reduce((s, t) => s + t.amount, 0) || 0.5;
    const base = orderSide === "buy" ? maxBuy : demoHolding;
    setAmount(((base * pct) / 100).toFixed(6));
  };

  const maxOB = Math.max(...orderBook.asks.map((a) => a.total), ...orderBook.bids.map((b) => b.total));

  return (
    <div className={styles.page}>
      {/* ── Ticker bar ── */}
      <div className={styles.tickerBar}>
        {COINS.map((c) => {
          const livePrice = coinPrices[c.symbol];
          return (
            <button
              key={c.symbol}
              className={`${styles.tickerItem} ${selectedCoin.symbol === c.symbol ? styles.tickerActive : ""}`}
              onClick={() => setSelectedCoin(c)}
            >
              <span className={styles.tickerIcon} style={{ color: c.color, background: `${c.color}18` }}>{c.icon}</span>
              <span className={styles.tickerSymbol}>{c.symbol}</span>
              <span className={`${styles.tickerPrice}`}>${livePrice < 10 ? livePrice.toFixed(4) : livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`${styles.tickerChange} ${c.change >= 0 ? styles.pos : styles.neg}`}>
                {c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change).toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className={styles.mainGrid}>
        {/* ── LEFT: Chart ── */}
        <div className={styles.chartCol}>
          {/* Pair header */}
          <div className={styles.pairHeader}>
            <div className={styles.pairLeft}>
              <div className={styles.pairIcon} style={{ color: selectedCoin.color, background: `${selectedCoin.color}20` }}>
                {selectedCoin.icon}
              </div>
              <div>
                <div className={styles.pairName}>
                  {selectedCoin.name} <span className={styles.pairSlash}>/</span> USD
                </div>
                <div className={styles.pairSymbol}>{selectedCoin.symbol}USD · Spot</div>
              </div>
            </div>
            <div className={styles.pairStats}>
              <div className={styles.pairPrice} style={{ color: positive ? "#22c55e" : "#ef4444" }}>
                ${currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className={`${styles.pairChange} ${positive ? styles.pos : styles.neg}`}>
                {positive ? "▲" : "▼"} {Math.abs(selectedCoin.change).toFixed(2)}%
              </div>
              <div className={styles.pairMeta}>
                <span>24h Vol <strong>{selectedCoin.volume}</strong></span>
                <span>H <strong>{selectedCoin.high}</strong></span>
                <span>L <strong>{selectedCoin.low}</strong></span>
              </div>
            </div>
          </div>

          {/* TradingView chart */}
          <div className={styles.tvChartWrap}>
            <TradingViewWidget symbol={selectedCoin.tvSymbol} />
          </div>

          {/* Open Positions / History table */}
          <div className={styles.ordersCard}>
            <div className={styles.ordersTabRow}>
              <button
                className={`${styles.ordersTab} ${ordersTab === "active" ? styles.ordersTabActive : ""}`}
                onClick={() => setOrdersTab("active")}
              >
                Active Trades{activeTrades.length > 0 && <span className={styles.badge}>{activeTrades.length}</span>}
              </button>
              <button
                className={`${styles.ordersTab} ${ordersTab === "history" ? styles.ordersTabActive : ""}`}
                onClick={() => setOrdersTab("history")}
              >
                Trade History {closedTrades.length > 0 && <span className={styles.badgeGray}>{closedTrades.length}</span>}
              </button>
            </div>

            {ordersTab === "active" ? (
              <div className={styles.ordersTable}>
                <div className={`${styles.ordersHead} ${styles.activeHead}`}>
                  <span>Pair</span>
                  <span>Side</span>
                  <span>Amount</span>
                  <span>Entry</span>
                  <span>Current</span>
                  <span>SL</span>
                  <span>TP</span>
                  <span>PnL</span>
                  <span>Action</span>
                </div>
                {activeTrades.length === 0 ? (
                  <div className={styles.emptyOrders}>No active trades. Place an order to get started.</div>
                ) : activeTrades.map((t) => (
                  <div key={t.id} className={`${styles.ordersRow} ${styles.activeRow}`}>
                    <span className={styles.pairTag}>{t.pair}</span>
                    <span className={t.side === "buy" ? styles.buyText : styles.sellText}>{t.side.toUpperCase()}</span>
                    <span>{t.amount.toFixed(4)}</span>
                    <span>${t.entryPrice < 10 ? t.entryPrice.toFixed(4) : t.entryPrice.toLocaleString()}</span>
                    <span style={{ color: t.currentPrice >= t.entryPrice ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                      ${t.currentPrice < 10 ? t.currentPrice.toFixed(4) : t.currentPrice.toLocaleString()}
                    </span>
                    <span className={styles.slText}>{t.sl ? `$${t.sl.toLocaleString()}` : "—"}</span>
                    <span className={styles.tpText}>{t.tp ? `$${t.tp.toLocaleString()}` : "—"}</span>
                    <span className={t.pnl >= 0 ? styles.pnlPos : styles.pnlNeg}>
                      {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}<br />
                      <small>{t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(2)}%</small>
                    </span>
                    <button className={styles.closeTradeBtn} onClick={() => handleCloseTrade(t)}>Close</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.ordersTable}>
                <div className={`${styles.ordersHead} ${styles.historyHead}`}>
                  <span>Pair</span>
                  <span>Side</span>
                  <span>Amount</span>
                  <span>Entry</span>
                  <span>Close</span>
                  <span>PnL</span>
                  <span>Reason</span>
                  <span>Time</span>
                </div>
                {closedTrades.length === 0 ? (
                  <div className={styles.emptyOrders}>No trade history yet.</div>
                ) : closedTrades.map((t) => (
                  <div key={t.id} className={`${styles.ordersRow} ${styles.historyRow}`}>
                    <span className={styles.pairTag}>{t.pair}</span>
                    <span className={t.side === "buy" ? styles.buyText : styles.sellText}>{t.side.toUpperCase()}</span>
                    <span>{t.amount.toFixed(4)}</span>
                    <span>${t.entryPrice < 10 ? t.entryPrice.toFixed(4) : t.entryPrice.toLocaleString()}</span>
                    <span>${t.closePrice < 10 ? t.closePrice.toFixed(4) : t.closePrice.toLocaleString()}</span>
                    <span className={t.pnl >= 0 ? styles.pnlPos : styles.pnlNeg}>
                      {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                    </span>
                    <span className={
                      t.closeReason === "tp" ? styles.tpText :
                      t.closeReason === "sl" ? styles.slText : styles.manualText
                    }>
                      {t.closeReason === "tp" ? "Take Profit" : t.closeReason === "sl" ? "Stop Loss" : "Manual"}
                    </span>
                    <span className={styles.tradeTime}>{t.closedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MIDDLE: Order book ── */}
        <div className={styles.bookCol}>
          <div className={styles.bookCard}>
            <div className={styles.bookHeader}>
              <span className={styles.bookTitle}>Order Book</span>
              <span className={styles.bookPair}>{selectedCoin.symbol}/USD</span>
            </div>

            <div className={styles.orderBook}>
              <div className={styles.obHeader}>
                <span>Price (USD)</span>
                <span>Amt ({selectedCoin.symbol})</span>
                <span>Total</span>
              </div>
              {/* Asks reversed */}
              <div className={styles.asks}>
                {[...orderBook.asks].reverse().map((a, i) => (
                  <div key={i} className={styles.obRow}>
                    <div className={styles.obDepth} style={{ width: `${(a.total / maxOB) * 100}%`, background: "rgba(239,68,68,0.09)" }} />
                    <span className={styles.askPrice}>${a.price.toLocaleString()}</span>
                    <span className={styles.obAmount}>{a.amount.toFixed(4)}</span>
                    <span className={styles.obTotal}>${a.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className={styles.spread}>
                <span style={{ color: positive ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: "15px" }}>
                  ${currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className={styles.spreadLabel}>Spread: ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}</span>
              </div>
              {/* Bids */}
              <div className={styles.bids}>
                {orderBook.bids.map((b, i) => (
                  <div key={i} className={styles.obRow}>
                    <div className={styles.obDepth} style={{ width: `${(b.total / maxOB) * 100}%`, background: "rgba(34,197,94,0.09)" }} />
                    <span className={styles.bidPrice}>${b.price.toLocaleString()}</span>
                    <span className={styles.obAmount}>{b.amount.toFixed(4)}</span>
                    <span className={styles.obTotal}>${b.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order form ── */}
        <div className={styles.formCol}>
          <div className={styles.formCard}>
            {/* Balance */}
            <div className={styles.balancePill}>
              <span className={styles.balancePillLabel}>Available Balance</span>
              <span className={styles.balancePillValue}>{formatUSD(localBalance)}</span>
            </div>

            {/* Buy / Sell toggle */}
            <div className={styles.sideToggle}>
              <button className={`${styles.sideBtn} ${orderSide === "buy" ? styles.sideBtnBuy : ""}`} onClick={() => setOrderSide("buy")}>Buy</button>
              <button className={`${styles.sideBtn} ${orderSide === "sell" ? styles.sideBtnSell : ""}`} onClick={() => setOrderSide("sell")}>Sell</button>
            </div>

            {/* Order type */}
            <div className={styles.typeRow}>
              {(["market", "limit", "stop"] as const).map((t) => (
                <button key={t} className={`${styles.typeBtn} ${orderType === t ? styles.typeBtnActive : ""}`} onClick={() => setOrderType(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Limit / Stop price */}
            {orderType !== "market" && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>{orderType === "limit" ? "Limit Price" : "Stop Price"} (USD)</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>$</span>
                  <input className={styles.input} type="number" placeholder={currentPrice.toFixed(2)} value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
                </div>
              </div>
            )}
            {orderType === "market" && (
              <div className={styles.marketPriceRow}>
                <span className={styles.inputLabel}>Market Price</span>
                <span className={styles.marketPriceVal} style={{ color: positive ? "#22c55e" : "#ef4444" }}>
                  ${currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Amount */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Amount ({selectedCoin.symbol})</label>
              <div className={styles.inputWrap}>
                <input className={styles.input} type="number" placeholder="0.00000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <span className={styles.inputSuffix}>{selectedCoin.symbol}</span>
              </div>
            </div>

            {/* Percentage quick-fill */}
            <div className={styles.pctRow}>
              {[25, 50, 75, 100].map((p) => (
                <button key={p} className={styles.pctBtn} onClick={() => handlePercentage(p)}>{p}%</button>
              ))}
            </div>

            {/* SL / TP */}
            <div className={styles.slTpBlock}>
              <div className={styles.slTpBlockHeader}>
                <span className={styles.slTpBlockTitle}>Risk Management</span>
                <span className={styles.slTpBlockSub}>Optional</span>
              </div>
              <div className={styles.slTpRow}>
                <div className={styles.slTpField}>
                  <div className={styles.slTpLabelRow}>
                    <span className={styles.slDot} />
                    <label className={styles.slTpLabel}>Stop Loss</label>
                  </div>
                  <div className={`${styles.inputWrap} ${styles.slInputWrap}`}>
                    <span className={styles.inputPrefix}>$</span>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="0.00"
                      value={slPrice}
                      onChange={(e) => setSlPrice(e.target.value)}
                    />
                  </div>
                  {slPrice && currentPrice && (
                    <span className={styles.slTpHint}>
                      {orderSide === "buy"
                        ? `−${((currentPrice - parseFloat(slPrice)) / currentPrice * 100).toFixed(2)}%`
                        : `+${((parseFloat(slPrice) - currentPrice) / currentPrice * 100).toFixed(2)}%`}
                    </span>
                  )}
                </div>
                <div className={styles.slTpDivider} />
                <div className={styles.slTpField}>
                  <div className={styles.slTpLabelRow}>
                    <span className={styles.tpDot} />
                    <label className={styles.slTpLabel}>Take Profit</label>
                  </div>
                  <div className={`${styles.inputWrap} ${styles.tpInputWrap}`}>
                    <span className={styles.inputPrefix}>$</span>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="0.00"
                      value={tpPrice}
                      onChange={(e) => setTpPrice(e.target.value)}
                    />
                  </div>
                  {tpPrice && currentPrice && (
                    <span className={styles.tpHint}>
                      {orderSide === "buy"
                        ? `+${((parseFloat(tpPrice) - currentPrice) / currentPrice * 100).toFixed(2)}%`
                        : `−${((currentPrice - parseFloat(tpPrice)) / currentPrice * 100).toFixed(2)}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total & fee */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Estimated Total</span>
              <span className={styles.totalVal}>${parseFloat(estTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Trading Fee (0.1%)</span>
              <span className={styles.feeVal}>${(parseFloat(estTotal) * 0.001 || 0).toFixed(2)}</span>
            </div>

            {/* Feedback */}
            {placeError   && <div className={styles.feedbackError}>{placeError}</div>}
            {placeSuccess && <div className={styles.feedbackSuccess}>{placeSuccess}</div>}

            {/* Submit */}
            <button
              className={`${styles.submitBtn} ${orderSide === "buy" ? styles.submitBuy : styles.submitSell}`}
              onClick={handlePlaceOrder}
              disabled={isPlacing}
            >
              {isPlacing ? "Placing…" : `${orderSide === "buy" ? "▲ Buy" : "▼ Sell"} ${selectedCoin.symbol}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}