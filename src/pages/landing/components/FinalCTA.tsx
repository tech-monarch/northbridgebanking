import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./FinalCTA.module.css";

const BG_IMAGES = ["/hero.jpg", "/hero2.jpg", "/hero3.jpg"];

// Floating ornaments — money/finance SVGs
const ORNAMENTS = [
  {
    id: "coin1",
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2.2S9.5 13 9.5 14.5c0 1.1 1 2 2.5 2s2.5-.9 2.5-2" />
      </svg>
    ),
    style: {
      top: "12%",
      left: "6%",
      animationDelay: "0s",
      animationDuration: "3.2s",
    },
  },
  {
    id: "chart1",
    svg: (
      <svg
        width="32"
        height="24"
        viewBox="0 0 32 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <polyline points="2 18 10 10 16 14 24 4 30 8" />
        <polyline points="24 4 30 4 30 10" />
      </svg>
    ),
    style: {
      top: "18%",
      right: "8%",
      animationDelay: "0.6s",
      animationDuration: "4.1s",
    },
  },
  {
    id: "shield1",
    svg: (
      <svg
        width="24"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    style: {
      bottom: "20%",
      left: "4%",
      animationDelay: "1.2s",
      animationDuration: "3.7s",
    },
  },
  {
    id: "globe1",
    svg: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
      </svg>
    ),
    style: {
      bottom: "15%",
      right: "5%",
      animationDelay: "1.8s",
      animationDuration: "4.4s",
    },
  },
  {
    id: "card1",
    svg: (
      <svg
        width="32"
        height="22"
        viewBox="0 0 32 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <rect x="1" y="2" width="30" height="18" rx="3" />
        <path d="M1 8h30" />
        <rect x="4" y="13" width="6" height="3" rx="1" />
      </svg>
    ),
    style: {
      top: "55%",
      left: "3%",
      animationDelay: "2.4s",
      animationDuration: "3.5s",
    },
  },
  {
    id: "dollar1",
    svg: (
      <svg
        width="20"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    style: {
      top: "38%",
      right: "4%",
      animationDelay: "0.9s",
      animationDuration: "2.9s",
    },
  },
];

export default function FinalCTA() {
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
    }, 7000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  return (
    <section className={styles.section}>
      {/* Sliding backgrounds — same pattern as Hero */}
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
          style={o.style as React.CSSProperties}
          aria-hidden="true"
        >
          {o.svg}
        </div>
      ))}

      <div className={styles.container}>
        <div className={styles.left} data-aos="fade-right">
          <h2 className={styles.h2}>
            Your financial infrastructure,
            <br />
            starting today.
          </h2>
          <p className={styles.body}>
            Open a North Bridge account in under 3 minutes. No credit check. No
            minimum balance. No fees.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/register" className={styles.primaryCta}>
              Open a free account
            </Link>
            <Link to="/login" className={styles.secondaryCta}>
              Sign in
            </Link>
          </div>
        </div>

        <div className={styles.right} data-aos="fade-left" data-aos-delay="100">
          {[
            ["FDIC insured", "Up to $250,000 per depositor"],
            ["5.2% APY", "On high-yield savings accounts"],
            ["190+ countries", "For international payments"],
            ["$0 in fees", "No monthly, no hidden charges"],
          ].map(([title, desc], i) => (
            <div
              key={title}
              className={styles.featureItem}
              data-aos="fade-up"
              data-aos-delay={i * 70}
            >
              <div className={styles.featureCheck}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
