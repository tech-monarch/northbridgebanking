import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

const BG_IMAGES = ["/hero.jpg", "/hero2.jpg", "/hero3.jpg"];

// Floating ornaments in the hero — white tinted, very subtle
const ORNAMENTS = [
  {
    id: "h1",
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2.2S9.5 13 9.5 14.5c0 1.1 1 2 2.5 2s2.5-.9 2.5-2" />
      </svg>
    ),
    top: "12%",
    left: "2%",
    delay: "0s",
    dur: "3.6s",
  },
  {
    id: "h2",
    svg: (
      <svg
        width="30"
        height="22"
        viewBox="0 0 32 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <polyline points="2 18 10 10 16 14 24 4 30 8" />
        <polyline points="24 4 30 4 30 10" />
      </svg>
    ),
    top: "25%",
    right: "2%",
    delay: "1.2s",
    dur: "4.1s",
  },
  {
    id: "h3",
    svg: (
      <svg
        width="20"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    bottom: "25%",
    left: "1.5%",
    delay: "2.1s",
    dur: "3.3s",
  },
  {
    id: "h4",
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <rect x="4" y="14" width="5" height="3" rx="1" />
      </svg>
    ),
    bottom: "28%",
    right: "1.5%",
    delay: "0.7s",
    dur: "4.4s",
  },
];

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setPrev(slide);
        setSlide((s) => (s + 1) % BG_IMAGES.length);
        setTransitioning(false);
      }, 800);
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  return (
    <section id="home" className={styles.hero}>
      {/* Sliding backgrounds */}
      <div className={styles.bgWrap} aria-hidden="true">
        {BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`${styles.bgSlide} ${
              i === slide
                ? transitioning
                  ? styles.bgCurrent
                  : styles.bgActive
                : i === prev
                  ? styles.bgPrev
                  : styles.bgHidden
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className={styles.bgOverlay} />
      </div>

      {/* Floating ornaments */}
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

      {/* Slide indicators */}
      <div className={styles.slideIndicators} aria-hidden="true">
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            className={`${styles.indicator} ${i === slide ? styles.indicatorActive : ""}`}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles.container}>
        {/* Copy */}
        <div className={styles.copy}>
          <div className={styles.pill} data-aos="fade-down" data-aos-delay="0">
            <span className={styles.pillDot} />
            FDIC Insured · Regulated Institution
          </div>

          <h1 className={styles.h1} data-aos="fade-up" data-aos-delay="80">
            Banking built for
            <br />
            how money moves
            <br />
            <span className={styles.accent}>today.</span>
          </h1>

          <p className={styles.body} data-aos="fade-up" data-aos-delay="160">
            One account for spending, saving, investing and sending money
            anywhere in the world. No branches. No jargon. No hidden fees.
          </p>

          <div
            className={styles.ctaRow}
            data-aos="fade-up"
            data-aos-delay="240"
          >
            <Link to="/register" className={styles.primaryCta}>
              Get started free
            </Link>
            <a
              href="#how"
              className={styles.secondaryCta}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See how it works
            </a>
          </div>

          <div className={styles.trust} data-aos="fade-up" data-aos-delay="320">
            <span>
              <CheckIcon />
              No credit check
            </span>
            <span>
              <CheckIcon />
              Free to open
            </span>
            <span>
              <CheckIcon />
              Insured to $250k
            </span>
          </div>
        </div>

        {/* Right — product UI mockup */}
        <div
          className={styles.mockupWrap}
          data-aos="fade-left"
          data-aos-delay="200"
        >
          <div className={styles.mockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.mockupTitle}>North Bridge — Dashboard</div>
            </div>

            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>Total balance</div>
              <div className={styles.balanceAmount}>
                $124,850<span>.00</span>
              </div>
              <div className={styles.balanceMeta}>
                <span className={styles.balanceUp}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  +$840.00
                </span>
                <span className={styles.balancePeriod}>this month</span>
              </div>
            </div>

            <div className={styles.actions}>
              {[
                {
                  label: "Send",
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  ),
                },
                {
                  label: "Receive",
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="8 17 12 21 16 17" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29" />
                    </svg>
                  ),
                },
                {
                  label: "Cards",
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  ),
                },
                {
                  label: "More",
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  ),
                },
              ].map((a) => (
                <div key={a.label} className={styles.action}>
                  <div className={styles.actionIcon}>{a.icon}</div>
                  <div className={styles.actionLabel}>{a.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.txSection}>
              <div className={styles.txHeader}>
                <span>Recent transactions</span>
                <span className={styles.txSeeAll}>See all</span>
              </div>
              {[
                {
                  name: "Netflix",
                  cat: "Entertainment",
                  amount: "-$15.99",
                  date: "Today",
                },
                {
                  name: "Stripe Inc",
                  cat: "Income",
                  amount: "+$4,200.00",
                  date: "Yesterday",
                  pos: true,
                },
                {
                  name: "Whole Foods",
                  cat: "Groceries",
                  amount: "-$67.40",
                  date: "Mon",
                },
              ].map((tx) => (
                <div key={tx.name} className={styles.tx}>
                  <div className={styles.txAvatar}>{tx.name[0]}</div>
                  <div className={styles.txInfo}>
                    <div className={styles.txName}>{tx.name}</div>
                    <div className={styles.txCat}>
                      {tx.cat} · {tx.date}
                    </div>
                  </div>
                  <div
                    className={`${styles.txAmount} ${tx.pos ? styles.txPos : ""}`}
                  >
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.notification}>
            <div className={styles.notifIcon}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div className={styles.notifTitle}>Transfer complete</div>
              <div className={styles.notifSub}>
                $840.00 received from Stripe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.statsBar}>
        {[
          { value: "$2.4T", label: "Assets managed" },
          { value: "98M+", label: "Customers globally" },
          { value: "190+", label: "Countries supported" },
          { value: "5.2%", label: "High-yield APY" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={styles.stat}
            data-aos="fade-up"
            data-aos-delay={i * 60}
          >
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
