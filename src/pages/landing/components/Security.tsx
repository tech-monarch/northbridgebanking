import styles from "./Security.module.css";

const ITEMS = [
  {
    title: "256-bit AES encryption",
    body: "Every transaction and data record is encrypted at rest and in transit using bank-grade standards.",
  },
  {
    title: "Biometric authentication",
    body: "Face ID and fingerprint login with device-level key storage. No passwords stored on our servers.",
  },
  {
    title: "Real-time fraud monitoring",
    body: "AI-powered detection flags suspicious activity and freezes accounts in under 200ms.",
  },
  {
    title: "FDIC insured to $250,000",
    body: "Your deposits are federally insured per depositor, per account category. Always.",
  },
];

const ORNAMENTS = [
  {
    id: "s1",
    svg: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    top: "10%",
    right: "2%",
    delay: "0s",
    dur: "4.2s",
  },
  {
    id: "s2",
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    bottom: "12%",
    right: "3%",
    delay: "1.5s",
    dur: "3.6s",
  },
  {
    id: "s3",
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2.2S9.5 13 9.5 14.5c0 1.1 1 2 2.5 2s2.5-.9 2.5-2" />
      </svg>
    ),
    top: "45%",
    left: "1%",
    delay: "0.8s",
    dur: "3.9s",
  },
];

export default function Security() {
  return (
    <section className={styles.section}>
      {ORNAMENTS.map((o) => (
        <div
          key={o.id}
          className={styles.ornament}
          style={
            {
              top: o.top,
              bottom: o.bottom,
              left: o.left,
              right: o.right,
              animationDelay: o.delay,
              animationDuration: o.dur,
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          {o.svg}
        </div>
      ))}

      <div className={styles.container}>
        <div className={styles.left} data-aos="fade-right">
          <p className="label">Security</p>
          <h2 className={styles.h2}>
            Built to the same standard as the banks that built the internet.
          </h2>
          <p className={styles.body}>
            We don't treat security as a feature. It's the foundation. North
            Bridge runs on the same infrastructure used by the world's largest
            financial institutions — audited quarterly, monitored continuously.
          </p>
          <div className={styles.certRow}>
            {["SOC 2 Type II", "PCI DSS", "ISO 27001", "FINRA"].map((c) => (
              <span key={c} className={styles.cert}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className={styles.item}
              data-aos="fade-left"
              data-aos-delay={i * 80}
            >
              <div className={styles.itemNum}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{item.title}</div>
                <div className={styles.itemBody}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
