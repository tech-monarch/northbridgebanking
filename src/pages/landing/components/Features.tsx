import { useState } from "react";
import styles from "./Features.module.css";

const TABS = [
  {
    id: "accounts",
    label: "Accounts",
    heading: "Everything your money needs in one place.",
    body: "High-yield savings at 5.2% APY. Zero-fee checking. Automatic round-ups. One dashboard for all your balances — live, always in sync.",
    items: [
      "High-yield savings · 5.2% APY",
      "FDIC-insured checking account",
      "Automatic savings round-ups",
      "Instant balance visibility",
      "No minimum balance required",
    ],
    visual: <AccountsVisual />,
  },
  {
    id: "payments",
    label: "Payments",
    heading: "Send money anywhere. Arrive in seconds.",
    body: "Domestic and international transfers at real exchange rates. Batch payments for businesses. No wire fees, no SWIFT markup, no surprises.",
    items: [
      "190+ countries supported",
      "Real mid-market FX rates",
      "Same-day ACH & wire",
      "Batch payroll transfers",
      "Instant transfer confirmation",
    ],
    visual: <PaymentsVisual />,
  },
  {
    id: "cards",
    label: "Cards & Invest",
    heading: "Spend globally. Invest automatically.",
    body: "Physical and virtual debit cards that work everywhere. Spend in any currency, get real-time alerts. Pair with auto-invest rules to grow wealth passively.",
    items: [
      "Virtual + physical debit card",
      "Real-time spending alerts",
      "No foreign transaction fees",
      "Auto-invest from balance",
      "ETF & stock portfolios",
    ],
    visual: <CardsVisual />,
  },
];

function AccountsVisual() {
  return (
    <div className={styles.visual}>
      <div className={styles.visRow}>
        <div className={styles.visCard}>
          <div className={styles.visCardLabel}>Savings</div>
          <div className={styles.visCardValue}>$48,200</div>
          <div className={styles.visTag} style={{ color: "var(--green)" }}>
            +5.2% APY
          </div>
        </div>
        <div className={styles.visCard}>
          <div className={styles.visCardLabel}>Checking</div>
          <div className={styles.visCardValue}>$12,440</div>
          <div className={styles.visTag}>Available</div>
        </div>
      </div>
      <div className={styles.visBar}>
        <div className={styles.visBarLabel}>
          <span>Savings goal</span>
          <span>82%</span>
        </div>
        <div className={styles.visBarTrack}>
          <div className={styles.visBarFill} style={{ width: "82%" }} />
        </div>
      </div>
    </div>
  );
}

function PaymentsVisual() {
  const txs = [
    { to: "Maria L.", country: "🇩🇪", amt: "$1,200", status: "Delivered" },
    { to: "Kwame A.", country: "🇬🇭", amt: "$340", status: "Delivered" },
    { to: "Jin Park", country: "🇰🇷", amt: "$880", status: "Processing" },
  ];
  return (
    <div className={styles.visual}>
      {txs.map((t) => (
        <div key={t.to} className={styles.txRow}>
          <div className={styles.txFlag}>{t.country}</div>
          <div className={styles.txTo}>{t.to}</div>
          <div className={styles.txAmt}>{t.amt}</div>
          <div
            className={`${styles.txStatus} ${t.status === "Delivered" ? styles.txDone : styles.txPending}`}
          >
            {t.status}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsVisual() {
  return (
    <div className={styles.visual}>
      <div className={styles.miniCard}>
        <div className={styles.miniCardTop}>
          <span className={styles.miniCardName}>North Bridge</span>
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
            <circle cx="11" cy="10" r="9" fill="#EF4444" opacity=".85" />
            <circle cx="21" cy="10" r="9" fill="#F59E0B" opacity=".85" />
          </svg>
        </div>
        <div className={styles.miniCardNum}>•••• •••• •••• 4821</div>
        <div className={styles.miniCardFoot}>
          <span>Alexandra K.</span>
          <span>09/31</span>
        </div>
      </div>
      <div className={styles.investRow}>
        <div className={styles.investItem}>
          <span>S&amp;P 500 ETF</span>
          <span className={styles.pos}>+18.4%</span>
        </div>
        <div className={styles.investItem}>
          <span>Bond portfolio</span>
          <span className={styles.pos}>+4.1%</span>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section id="services" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header} data-aos="fade-up">
          <p className="label">Services</p>
          <h2 className={styles.h2}>One platform. Every financial need.</h2>
        </div>

        <div className={styles.tabRow} data-aos="fade-up" data-aos-delay="80">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              className={`${styles.tab} ${i === active ? styles.tabActive : ""}`}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          <div
            className={styles.tabLeft}
            data-aos="fade-right"
            data-aos-delay="120"
          >
            <h3 className={styles.tabHeading}>{tab.heading}</h3>
            <p className={styles.tabBody}>{tab.body}</p>
            <ul className={styles.itemList}>
              {tab.items.map((item, i) => (
                <li
                  key={item}
                  className={styles.itemLine}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={styles.tabRight}
            data-aos="fade-left"
            data-aos-delay="160"
          >
            {tab.visual}
          </div>
        </div>
      </div>
    </section>
  );
}
