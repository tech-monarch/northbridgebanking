import styles from "./SocialProof.module.css";

// Each partner has a brand color for the ticker
const PARTNERS = [
  { name: "Visa",       color: "#1A1F71" },
  { name: "Mastercard", color: "#EB001B" },
  { name: "Swift",      color: "#003087" },
  { name: "Stripe",     color: "#635BFF" },
  { name: "Plaid",      color: "#111111" },
  { name: "Fiserv",     color: "#FF6600" },
  { name: "Moody's",    color: "#0072CE" },
  { name: "Bloomberg",  color: "#F5821F" },
  { name: "Nasdaq",     color: "#0078D4" },
  { name: "Reuters",    color: "#FF8000" },
];

// Duplicate the list for seamless infinite loop
const ITEMS = [...PARTNERS, ...PARTNERS];

export default function SocialProof() {
  return (
    <div className={styles.bar}>
      <div className={styles.label}>Trusted by</div>
      <div className={styles.tickerWrap}>
        {/* Fade masks on left & right */}
        <div className={styles.fadeLeft}  aria-hidden="true"/>
        <div className={styles.fadeRight} aria-hidden="true"/>

        <div className={styles.track}>
          {ITEMS.map((p, i) => (
            <span
              key={i}
              className={styles.item}
              style={{ "--partner-color": p.color } as React.CSSProperties}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
