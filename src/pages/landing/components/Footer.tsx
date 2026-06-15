import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const COLS = [
  {
    title: "Product",
    links: [
      "Checking account",
      "Savings account",
      "Investments",
      "Debit cards",
      "Business banking",
    ],
  },
  {
    title: "Company",
    links: ["About us", "Careers", "Press", "Security", "Contact"],
  },
  {
    title: "Legal",
    links: [
      "Terms of service",
      "Privacy policy",
      "Cookie policy",
      "Regulatory disclosures",
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand} data-aos="fade-right">
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="1.5"
                    rx=".75"
                    fill="white"
                  />
                  <rect
                    x="2"
                    y="7"
                    width="12"
                    height="1.5"
                    rx=".75"
                    fill="white"
                    opacity=".7"
                  />
                  <rect
                    x="2"
                    y="11"
                    width="7"
                    height="1.5"
                    rx=".75"
                    fill="white"
                    opacity=".45"
                  />
                </svg>
              </div>
              <span className={styles.logoName}>North Bridge Banking</span>
            </Link>
            <p className={styles.tagline}>
              Banking built for how money moves today.
            </p>
            <div className={styles.badges}>
              <span className={styles.badge}>FDIC</span>
              <span className={styles.badge}>Member FDIC</span>
              <span className={styles.badge}>Equal Housing Lender</span>
            </div>
          </div>

          <div className={styles.cols}>
            {COLS.map((col, i) => (
              <div
                key={col.title}
                className={styles.col}
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <div className={styles.colTitle}>{col.title}</div>
                <ul>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2025 North Bridge Bank N.A. Member FDIC. All rights reserved.
          </p>
          <div className={styles.social}>
            {["Twitter", "LinkedIn"].map((s) => (
              <a key={s} href="#" className={styles.socialLink}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
