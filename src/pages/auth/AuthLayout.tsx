import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.root}>
      {/* Left panel — branding */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <Link to="/" className={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect
                width="28"
                height="28"
                rx="6"
                fill="white"
                fillOpacity="0.15"
              />
              <path
                d="M8 14C8 10.686 10.686 8 14 8s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z"
                fill="white"
              />
              <path
                d="M14 10v8M10 14h8"
                stroke="#1e88e5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>North Bridge</span>
          </Link>

          <div className={styles.panelContent}>
            <h2 className={styles.panelTitle}>
              Trade Crypto
              <br />
              with Confidence
            </h2>
            <p className={styles.panelSub}>
              Join 7 million+ users investing in digital assets securely and
              effortlessly.
            </p>

            <ul className={styles.perks}>
              {[
                "Bank-level encryption on all accounts",
                "Instant deposits & withdrawals",
                "24/7 live support team",
                "Access 10+ digital assets",
              ].map((perk) => (
                <li key={perk} className={styles.perk}>
                  <span className={styles.perkCheck}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panelFooter}>
            <span>© 2025 North Bridge</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.form}>
        <div className={styles.formInner}>{children}</div>
      </div>
    </div>
  );
}
