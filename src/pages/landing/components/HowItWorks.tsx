import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    n: "1",
    title: "Create an account",
    body: "Sign up in 3 minutes. Verify your identity with a government ID — no branch visit required.",
  },
  {
    n: "2",
    title: "Add funds",
    body: "Connect your existing bank via ACH, card, or wire. Funds appear instantly. No minimum deposit.",
  },
  {
    n: "3",
    title: "Start banking",
    body: "Send, save, invest, and spend. Your North Bridge account works wherever your money needs to go.",
  },
];

// Small floating SVGs — subtle, only 3 so it doesn't compete with content
const ORNAMENTS = [
  {
    id: "o1",
    svg: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2.2S9.5 13 9.5 14.5c0 1.1 1 2 2.5 2s2.5-.9 2.5-2" />
      </svg>
    ),
    top: "14%",
    right: "3%",
    delay: "0s",
    dur: "3.4s",
  },
  {
    id: "o2",
    svg: (
      <svg
        width="28"
        height="20"
        viewBox="0 0 32 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <polyline points="2 18 10 10 16 14 24 4 30 8" />
        <polyline points="24 4 30 4 30 10" />
      </svg>
    ),
    bottom: "18%",
    left: "2%",
    delay: "1.1s",
    dur: "4.0s",
  },
  {
    id: "o3",
    svg: (
      <svg
        width="20"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    top: "48%",
    right: "2%",
    delay: "2.0s",
    dur: "3.7s",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className={styles.section}>
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

      <div className={styles.container}>
        <div className={styles.header} data-aos="fade-up">
          <p className="label">How it works</p>
          <h2 className={styles.h2}>Up and running in minutes, not days.</h2>
        </div>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={styles.step}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className={styles.stepTop}>
                <div className={styles.stepNum}>{s.n}</div>
                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>

        <div
          className={styles.footnote}
          data-aos="fade-up"
          data-aos-delay="320"
        >
          No credit check · No fees · Close anytime
        </div>
      </div>
    </section>
  );
}
