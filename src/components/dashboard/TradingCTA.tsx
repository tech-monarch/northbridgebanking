import styles from './TradingCTA.module.css';

export default function TradingCTA() {
  return (
    <div className={styles.banner}>
      {/* Left text */}
      <div className={styles.left}>
        <h3 className={styles.heading}>Grow Your Wealth</h3>
        <p className={styles.sub}>
          Invest smarter with our curated plans — capital protection, steady returns, flexible terms.
        </p>
      </div>

      {/* Fintech phone illustration */}
      <div className={styles.phoneIllustration}>
        <FintechIllustration />
      </div>

      {/* Feature items */}
      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <ShieldIcon />
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>Capital Protected</span>
            <span className={styles.featureSub}>Your principal is always safe</span>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <LockIcon />
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>Bank-Grade Security</span>
            <span className={styles.featureSub}>256-bit encryption on all funds</span>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <HeadphonesIcon />
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>24/7 Support</span>
            <span className={styles.featureSub}>Get help anytime you need</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <a
        href="/dashboard/invest"
        className={styles.ctaBtn}
        style={{ textDecoration: 'none' }}
      >
        Explore Investment Plans
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </div>
  );
}

function FintechIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
      {/* Phone body */}
      <rect x="30" y="4" width="36" height="62" rx="5" fill="#1a3a6e" />
      <rect x="33" y="10" width="30" height="44" rx="2" fill="#0d2052" />
      {/* Screen content - USD symbol and balance */}
      <text x="38" y="28" fontSize="8" fill="#9ca3af" fontFamily="Arial">Balance</text>
      <text x="36" y="40" fontSize="9" fontWeight="700" fill="#22c55e" fontFamily="Arial">$15,200.00</text>
      {/* Mini bar chart */}
      <rect x="37" y="46" width="4" height="6" rx="1" fill="#1565C0" opacity="0.7"/>
      <rect x="43" y="43" width="4" height="9" rx="1" fill="#1565C0" opacity="0.85"/>
      <rect x="49" y="44" width="4" height="8" rx="1" fill="#1565C0" opacity="0.7"/>
      <rect x="55" y="41" width="4" height="11" rx="1" fill="#22c55e"/>
      {/* Home button */}
      <circle cx="48" cy="60" r="2" fill="#2a4a8e" />
      {/* Bank card left */}
      <rect x="4" y="44" width="22" height="14" rx="3" fill="#1565C0" />
      <rect x="7" y="48" width="8" height="5" rx="1" fill="#f59e0b" opacity="0.9"/>
      <line x1="7" y1="55" x2="23" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      {/* Currency coin right */}
      <circle cx="92" cy="42" r="10" fill="#22c55e" />
      <text x="86" y="47" fontSize="11" fontWeight="800" fill="white" fontFamily="Arial">$</text>
      {/* Upward arrow trend */}
      <polyline points="80,68 87,58 94,62 101,50 108,46" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="108" cy="46" r="2.5" fill="#22c55e"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
