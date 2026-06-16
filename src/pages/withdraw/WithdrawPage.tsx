import { useState, useRef, memo, useEffect } from "react";
import styles from "./WithdrawPage.module.css";
import api, { type Network } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { fetchAllPrices, formatUSD, usdToCrypto } from "@/services/prices";

// ─── Types ────────────────────────────────────────────────────────────────────
type WithdrawMethod = "bank_transfer" | "crypto";
type Step = "method" | "select" | "details" | "confirm" | "processing" | "done";

const COIN_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  USDT: "₮",
  BNB: "⬥",
  SOL: "◎",
  XRP: "✕",
  USDC: "$",
  TRX: "⚡",
};

const SUPPORTED_BANKS = [
  "Chase Bank",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "HSBC",
  "Barclays",
  "Standard Chartered",
  "Deutsche Bank",
  "BNP Paribas",
  "Santander",
  "Revolut",
  "Wise",
  "N26",
  "Monzo",
  "Other",
];

function BankIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function CryptoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 8h4a2 2 0 010 4H9v4h4a2 2 0 010 4" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="18" x2="12" y2="20" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WithdrawPage() {
  const { user, refreshUser } = useAuth();

  // Method
  const [method, setMethod] = useState<WithdrawMethod | null>(null);

  // Crypto state
  const [networks, setNetworks] = useState<Network[]>([]);
  const [networksLoading, setNetworksLoading] = useState(false);
  const [networksError, setNetworksError] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");

  // Bank transfer state
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankOther, setBankOther] = useState("");

  // Shared state
  const [step, setStep] = useState<Step>("method");
  const [usdAmount, setUsdAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (method !== "crypto") return;
    setNetworksLoading(true);
    api
      .get<Network[]>("/networks")
      .then(async (data) => {
        const active = data.filter((n) => n.is_active);
        setNetworks(active);
        const p = await fetchAllPrices(active.map((n) => n.symbol));
        setPrices(p);
        setNetworksLoading(false);
      })
      .catch((e) => {
        setNetworksError(e.message);
        setNetworksLoading(false);
      });
  }, [method]);

  const handleConfirm = async () => {
    setSubmitError("");
    setSubmitLoading(true);
    setStep("processing");
    try {
      if (method === "bank_transfer") {
        await api.post<any>("/user/withdrawals/submit", {
          method: "bank_transfer",
          usd_amount: parseFloat(usdAmount),
          bank_name: bankName === "Other" ? bankOther : bankName,
          account_name: accountName,
          account_number: accountNumber,
        });
      } else if (method === "crypto" && selectedNetwork) {
        await api.post<any>("/user/withdrawals/submit", {
          method: "crypto",
          network_id: selectedNetwork.id,
          usd_amount: parseFloat(usdAmount),
          recipient_address: recipientAddress,
        });
      }
      await refreshUser();
      setStep("done");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Withdrawal failed.");
      setStep("confirm");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setStep("method");
    setMethod(null);
    setSelectedNetwork(null);
    setUsdAmount("");
    setRecipientAddress("");
    setConfirmed(false);
    setSubmitError("");
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setBankOther("");
  };

  const balance = user ? Number(user.balance) : 0;
  const usdNum = parseFloat(usdAmount) || 0;

  // Crypto calcs
  const price = selectedNetwork
    ? prices[selectedNetwork.symbol] || selectedNetwork.usd_rate || 1
    : 1;
  const cryptoAmount =
    usdNum > 0 && selectedNetwork ? usdToCrypto(usdNum, price).toFixed(8) : "0";
  const feeUsd = selectedNetwork ? selectedNetwork.fee * price : 0;
  const netUsd =
    usdNum > 0 ? Math.max(0, usdNum - (method === "crypto" ? feeUsd : 0)) : 0;

  const coinIcon = selectedNetwork
    ? (COIN_ICONS[selectedNetwork.symbol] ?? selectedNetwork.symbol.slice(0, 1))
    : "";

  const bankDetailsValid =
    usdNum >= 10 &&
    usdNum <= balance &&
    accountNumber.trim().length >= 10 &&
    accountName.trim().length > 2 &&
    (bankName && bankName !== "Other" ? true : bankOther.trim().length > 2);

  const cryptoDetailsValid =
    usdNum > 0 && usdNum <= balance && recipientAddress.trim().length > 10;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Withdraw Funds</h1>
          <p>Send to your bank account or crypto wallet</p>
        </div>

        {/* Balance banner */}
        {user && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: "rgba(21,101,192,0.12)",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>
              Available Balance
            </span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>
              {formatUSD(balance)}
            </span>
          </div>
        )}

        {/* KYC warning */}
        {user?.kyc_status !== "approved" && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#f87171",
            }}
          >
            ⚠️ KYC verification required to withdraw.{" "}
            <a
              href="/dashboard/settings"
              style={{ color: "#1565C0", textDecoration: "underline" }}
            >
              Verify now →
            </a>
          </div>
        )}

        {/* Progress bar */}
        {step !== "processing" && step !== "done" && step !== "method" && (
          <div className={styles.progressRow}>
            {[
              "Method",
              method === "bank_transfer" ? "Details" : "Select Coin",
              "Review",
              "Confirm",
            ].map((label, i) => {
              const STEPS_MAP: Step[] = [
                "method",
                "select",
                "details",
                "confirm",
              ];
              const idx = STEPS_MAP.indexOf(step);
              return (
                <div key={i} className={styles.progressStep}>
                  <div
                    className={`${styles.progressDot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ""}`}
                  >
                    {i < idx ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`${styles.progressLabel} ${i === idx ? styles.progressLabelActive : ""}`}
                  >
                    {label}
                  </span>
                  {i < 3 && (
                    <div
                      className={`${styles.progressLine} ${i < idx ? styles.lineDone : ""}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP: Choose Method
        ════════════════════════════════════════ */}
        {step === "method" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>How do you want to withdraw?</h2>
            <p className={styles.cardSubtitle}>
              Choose your preferred withdrawal method
            </p>
            <div
              className={styles.coinGrid}
              style={{
                gridTemplateColumns: "1fr 1fr",
                maxWidth: "480px",
                margin: "24px auto",
              }}
            >
              <button
                className={`${styles.coinCard} ${method === "bank_transfer" ? styles.coinCardActive : ""}`}
                style={
                  method === "bank_transfer" ? { borderColor: "#1565C0" } : {}
                }
                onClick={() => setMethod("bank_transfer")}
              >
                <div
                  className={styles.coinIconWrap}
                  style={{ color: "#1565C0", background: "#1565C018" }}
                >
                  <BankIcon />
                </div>
                <div className={styles.coinCardName}>Bank Transfer</div>
                <div className={styles.coinCardSymbol}>
                  To any supported bank
                </div>
                <div
                  className={styles.coinCardBalance}
                  style={{ color: "#1565C0" }}
                >
                  1–24 hours
                </div>
                {method === "bank_transfer" && (
                  <div
                    className={styles.coinCheck}
                    style={{ background: "#1565C0" }}
                  >
                    ✓
                  </div>
                )}
              </button>

              <button
                className={`${styles.coinCard} ${method === "crypto" ? styles.coinCardActive : ""}`}
                style={method === "crypto" ? { borderColor: "#f59e0b" } : {}}
                onClick={() => setMethod("crypto")}
              >
                <div
                  className={styles.coinIconWrap}
                  style={{ color: "#f59e0b", background: "#f59e0b18" }}
                >
                  <CryptoIcon />
                </div>
                <div className={styles.coinCardName}>Cryptocurrency</div>
                <div className={styles.coinCardSymbol}>BTC · ETH · USDT</div>
                <div
                  className={styles.coinCardBalance}
                  style={{ color: "#f59e0b" }}
                >
                  10–30 minutes
                </div>
                {method === "crypto" && (
                  <div
                    className={styles.coinCheck}
                    style={{ background: "#f59e0b" }}
                  >
                    ✓
                  </div>
                )}
              </button>
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!method}
                onClick={() =>
                  setStep(method === "bank_transfer" ? "details" : "select")
                }
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Details
        ════════════════════════════════════════ */}
        {step === "details" && method === "bank_transfer" && (
          <div className={styles.card}>
            <button
              className={styles.backBtn}
              onClick={() => setStep("method")}
            >
              ← Back
            </button>
            <div className={styles.balanceBar}>
              <span className={styles.balanceLabel}>Available balance</span>
              <span
                className={styles.balanceValue}
                style={{ color: "#1565C0" }}
              >
                {formatUSD(balance)}
              </span>
            </div>
            <h2 className={styles.cardTitle}>Bank withdrawal details</h2>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Amount (USD)</label>
              <div className={styles.amountInputBox}>
                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: "18px",
                    paddingLeft: "14px",
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  min="10"
                  step="0.01"
                  max={balance}
                />
                <span className={styles.amountSymbol}>USD</span>
              </div>
              {usdNum > balance && (
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "12px",
                    marginTop: "6px",
                  }}
                >
                  Insufficient balance
                </div>
              )}
            </div>

            <div
              className={styles.fieldGroup}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <label className={styles.fieldLabel}>Recipient Bank *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: bankName ? "#fff" : "#6b7280",
                    fontSize: "13px",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="" style={{ color: "#000" }}>
                    Select bank…
                  </option>
                  {SUPPORTED_BANKS.map((b) => (
                    <option key={b} value={b} style={{ color: "#000" }}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              {bankName === "Other" && (
                <div>
                  <label className={styles.fieldLabel}>
                    Specify Bank Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    value={bankOther}
                    onChange={(e) => setBankOther(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
              <div>
                <label className={styles.fieldLabel}>Account Name *</label>
                <input
                  type="text"
                  placeholder="As it appears on your bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label className={styles.fieldLabel}>Account Number *</label>
                <input
                  type="text"
                  placeholder="10-digit NUBAN account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {accountNumber.length}/10 digits
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                Double-check your account details. Incorrect information may
                result in lost funds.
              </span>
            </div>

            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!bankDetailsValid}
                onClick={() => setStep("confirm")}
              >
                Review Withdrawal →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            BANK TRANSFER — Step: Confirm
        ════════════════════════════════════════ */}
        {step === "confirm" && method === "bank_transfer" && (
          <div className={styles.card}>
            <button
              className={styles.backBtn}
              onClick={() => setStep("details")}
            >
              ← Back
            </button>
            <h2 className={styles.cardTitle}>Review your withdrawal</h2>
            <p className={styles.cardSubtitle}>
              Double-check before submitting
            </p>
            {submitError && (
              <div
                style={{
                  color: "#f87171",
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {submitError}
              </div>
            )}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Method</span>
                <span className={styles.summaryValue}>🏦 Bank Transfer</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Bank</span>
                <span className={styles.summaryValue}>
                  {bankName === "Other" ? bankOther : bankName}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Account Name</span>
                <span className={styles.summaryValue}>{accountName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Account Number</span>
                <span
                  className={styles.summaryValue}
                  style={{ fontFamily: "monospace" }}
                >
                  {accountNumber}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Amount (USD)</span>
                <span
                  className={`${styles.summaryValue} ${styles.summaryAmount}`}
                >
                  {formatUSD(usdNum)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>You receive</span>
                <span className={`${styles.summaryValue} ${styles.summaryNet}`}>
                  {formatUSD(netUsd)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Est. time</span>
                <span className={styles.summaryValue}>1–24 business hours</span>
              </div>
            </div>
            <div className={styles.checkRow}>
              <button
                className={`${styles.checkbox} ${confirmed ? styles.checkboxChecked : ""}`}
                onClick={() => setConfirmed(!confirmed)}
              >
                {confirmed && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className={styles.checkLabel}>
                I confirm I want to withdraw{" "}
                <strong>{formatUSD(usdNum)}</strong> to account{" "}
                <strong>{accountNumber}</strong> at{" "}
                <strong>{bankName === "Other" ? bankOther : bankName}</strong>.
                This is irreversible.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!confirmed || submitLoading}
                onClick={handleConfirm}
              >
                {submitLoading ? "Submitting…" : "Submit Withdrawal"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Select Coin
        ════════════════════════════════════════ */}
        {step === "select" && method === "crypto" && (
          <div className={styles.card}>
            <button
              className={styles.backBtn}
              onClick={() => setStep("method")}
            >
              ← Back
            </button>
            <h2 className={styles.cardTitle}>Choose coin to withdraw</h2>
            <p className={styles.cardSubtitle}>
              Select from available networks
            </p>
            {networksLoading && (
              <div
                style={{
                  color: "#9ca3af",
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                Loading networks…
              </div>
            )}
            {networksError && (
              <div
                style={{
                  color: "#f87171",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                {networksError}
              </div>
            )}
            {!networksLoading && !networksError && (
              <div className={styles.coinGrid}>
                {networks.map((net) => {
                  const p = prices[net.symbol] || net.usd_rate || 0;
                  return (
                    <button
                      key={net.id}
                      className={`${styles.coinCard} ${selectedNetwork?.id === net.id ? styles.coinCardActive : ""}`}
                      style={
                        selectedNetwork?.id === net.id
                          ? { borderColor: net.color }
                          : {}
                      }
                      onClick={() => setSelectedNetwork(net)}
                    >
                      <div
                        className={styles.coinIconWrap}
                        style={{
                          color: net.color,
                          background: `${net.color}18`,
                        }}
                      >
                        <span className={styles.coinIcon}>
                          {COIN_ICONS[net.symbol] ?? net.symbol.slice(0, 1)}
                        </span>
                      </div>
                      <div className={styles.coinCardName}>{net.symbol}</div>
                      <div className={styles.coinCardSymbol}>{net.name}</div>
                      <div className={styles.coinCardBalance}>
                        Fee: {net.fee} {net.symbol}
                        {p > 0 && (
                          <span style={{ color: "#9ca3af" }}>
                            {" "}
                            (≈{formatUSD(net.fee * p)})
                          </span>
                        )}
                      </div>
                      {selectedNetwork?.id === net.id && (
                        <div
                          className={styles.coinCheck}
                          style={{ background: net.color }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!selectedNetwork}
                onClick={() => setStep("details")}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Details
        ════════════════════════════════════════ */}
        {step === "details" && method === "crypto" && selectedNetwork && (
          <div className={styles.card}>
            <button
              className={styles.backBtn}
              onClick={() => setStep("select")}
            >
              ← Back
            </button>
            <div className={styles.selectedCoinBadge}>
              <span style={{ color: selectedNetwork.color }}>{coinIcon}</span>
              {selectedNetwork.symbol} · {selectedNetwork.name}
              {price > 0 && (
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {" "}
                  · {formatUSD(price)}
                </span>
              )}
            </div>
            <div className={styles.balanceBar}>
              <span className={styles.balanceLabel}>Available balance</span>
              <span
                className={styles.balanceValue}
                style={{ color: selectedNetwork.color }}
              >
                {formatUSD(balance)}
              </span>
            </div>
            <h2 className={styles.cardTitle}>Withdrawal details</h2>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Amount (USD)</label>
              <div className={styles.amountInputBox}>
                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: "18px",
                    paddingLeft: "14px",
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  max={balance}
                />
                <span className={styles.amountSymbol}>USD</span>
              </div>
              {usdNum > 0 && (
                <div className={styles.feeRow}>
                  <span>
                    ≈ {cryptoAmount} {selectedNetwork.symbol}
                  </span>
                  <span>
                    Fee: <strong>{formatUSD(feeUsd)}</strong>
                  </span>
                  <span>
                    Net:{" "}
                    <strong style={{ color: "#4ade80" }}>
                      {formatUSD(netUsd)}
                    </strong>
                  </span>
                </div>
              )}
              {usdNum > balance && (
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "12px",
                    marginTop: "6px",
                  }}
                >
                  Insufficient balance
                </div>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Recipient wallet address
                <span className={styles.networkTag}>
                  {selectedNetwork.name}
                </span>
              </label>
              <textarea
                className={styles.addressInput}
                placeholder={`Enter ${selectedNetwork.symbol} wallet address…`}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                rows={2}
                spellCheck={false}
              />
            </div>
            <div className={styles.warningBox}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                Only send to a <strong>{selectedNetwork.symbol}</strong>{" "}
                address. Withdrawals are irreversible.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!cryptoDetailsValid}
                onClick={() => setStep("confirm")}
              >
                Review Withdrawal →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CRYPTO — Step: Confirm
        ════════════════════════════════════════ */}
        {step === "confirm" && method === "crypto" && selectedNetwork && (
          <div className={styles.card}>
            <button
              className={styles.backBtn}
              onClick={() => setStep("details")}
            >
              ← Back
            </button>
            <h2 className={styles.cardTitle}>Review your withdrawal</h2>
            <p className={styles.cardSubtitle}>
              Double-check before submitting
            </p>
            {submitError && (
              <div
                style={{
                  color: "#f87171",
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {submitError}
              </div>
            )}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Method</span>
                <span className={styles.summaryValue}>₿ Cryptocurrency</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Coin</span>
                <span className={styles.summaryValue}>
                  <span style={{ color: selectedNetwork.color }}>
                    {coinIcon}
                  </span>{" "}
                  {selectedNetwork.symbol}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Network</span>
                <span className={styles.summaryValue}>
                  {selectedNetwork.name}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Amount (USD)</span>
                <span
                  className={`${styles.summaryValue} ${styles.summaryAmount}`}
                >
                  {formatUSD(usdNum)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Crypto Amount</span>
                <span className={styles.summaryValue}>
                  {cryptoAmount} {selectedNetwork.symbol}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Network fee</span>
                <span className={styles.summaryValue}>{formatUSD(feeUsd)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>You receive</span>
                <span className={`${styles.summaryValue} ${styles.summaryNet}`}>
                  {formatUSD(netUsd)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>To address</span>
                <code className={styles.summaryAddress}>
                  {recipientAddress.slice(0, 14)}…{recipientAddress.slice(-8)}
                </code>
              </div>
            </div>
            <div className={styles.checkRow}>
              <button
                className={`${styles.checkbox} ${confirmed ? styles.checkboxChecked : ""}`}
                onClick={() => setConfirmed(!confirmed)}
              >
                {confirmed && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className={styles.checkLabel}>
                I confirm I want to withdraw{" "}
                <strong>{formatUSD(usdNum)}</strong> to{" "}
                <strong>{recipientAddress.slice(0, 10)}…</strong> — this is
                irreversible.
              </span>
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.btnPrimary}
                disabled={!confirmed || submitLoading}
                onClick={handleConfirm}
              >
                {submitLoading ? "Submitting…" : "Submit Withdrawal"}
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className={styles.fullCard}>
            <div
              className={styles.processingSpinner}
              style={{
                borderTopColor:
                  method === "bank_transfer"
                    ? "#1565C0"
                    : (selectedNetwork?.color ?? "#22c55e"),
              }}
            />
            <h2 className={styles.processingTitle}>Processing Withdrawal</h2>
            <p className={styles.processingText}>
              Submitting your{" "}
              <strong style={{ color: "#fff" }}>{formatUSD(usdNum)}</strong>{" "}
              withdrawal request.
            </p>
            <div className={styles.processingSteps}>
              {[
                "Verifying request",
                "Deducting balance",
                "Queued for approval",
              ].map((s, i) => (
                <div key={i} className={styles.procStep}>
                  <div
                    className={styles.procDot}
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className={styles.fullCard}>
            <div
              className={styles.doneRing}
              style={{ borderColor: "#1565C050", background: "#1565C012" }}
            >
              <div className={styles.doneIcon} style={{ color: "#1565C0" }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2 className={styles.doneTitle}>Withdrawal Submitted!</h2>
            <p className={styles.doneText}>
              Your{" "}
              <strong style={{ color: "#1565C0" }}>{formatUSD(usdNum)}</strong>{" "}
              withdrawal is pending admin approval.
            </p>
            <div className={styles.doneDetails}>
              <div className={styles.doneRow}>
                <span>Status</span>
                <span className={styles.statusPending}>● Pending</span>
              </div>
              <div className={styles.doneRow}>
                <span>Amount</span>
                <span>{formatUSD(usdNum)}</span>
              </div>
              <div className={styles.doneRow}>
                <span>Method</span>
                <span>
                  {method === "bank_transfer"
                    ? "🏦 Bank Transfer"
                    : `₿ ${selectedNetwork?.symbol ?? "Crypto"}`}
                </span>
              </div>
              {method === "bank_transfer" && accountNumber && (
                <div className={styles.doneRow}>
                  <span>To account</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {accountNumber}
                  </span>
                </div>
              )}
              {method === "crypto" && recipientAddress && (
                <div className={styles.doneRow}>
                  <span>To address</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                    {recipientAddress.slice(0, 14)}…{recipientAddress.slice(-8)}
                  </span>
                </div>
              )}
              <div className={styles.doneRow}>
                <span>You receive</span>
                <span style={{ color: "#4ade80" }}>{formatUSD(netUsd)}</span>
              </div>
              <div className={styles.doneRow}>
                <span>Est. time</span>
                <span>
                  {method === "bank_transfer"
                    ? "1–24 business hours"
                    : "10–30 minutes"}
                </span>
              </div>
            </div>
            <div className={styles.doneActions}>
              <button className={styles.btnPrimary} onClick={handleReset}>
                Make Another Withdrawal
              </button>
              <a href="/dashboard/transactions" className={styles.btnSecondary}>
                View Transaction History
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Side info panel */}
      <div className={styles.widgetSide}>
        <div
          style={{
            padding: "24px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "4px",
            }}
          >
            Withdrawal Info
          </h3>
          {[
            {
              emoji: "🏦",
              title: "Bank Transfer",
              lines: [
                "Supports all major banks",
                "Credited in 1–24 business hours",
                "Minimum: $10",
                "KYC required",
              ],
            },
            {
              emoji: "₿",
              title: "Cryptocurrency",
              lines: [
                "Network fee applies",
                "Processing: 10–30 minutes",
                "Double-check your address",
                "KYC required",
              ],
            },
          ].map((m) => (
            <div
              key={m.title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>
                {m.emoji}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                {m.title}
              </div>
              {m.lines.map((l) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#1565C0",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#f87171", lineHeight: "1.6" }}
            >
              ⚠️ Do not share your account details with anyone.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
