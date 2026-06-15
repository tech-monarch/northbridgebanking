import { useState } from "react";
import styles from "./Testimonials.module.css";

const QUOTES = [
  {
    quote:
      "Switching to North Bridge cut our payroll processing time from two days to about four minutes. The API is clean, the support is real, and the rates are actually competitive.",
    name: "Margaret Osei",
    role: "CEO, Osei Ventures",
    init: "MO",
  },
  {
    quote:
      "I've used Wise, Revolut, and a handful of others. North Bridge is the only one where the savings rate is genuinely high and the international transfers just work — no delays, no excuses.",
    name: "David Chen",
    role: "Software Engineer, independent",
    init: "DC",
  },
  {
    quote:
      "As a freelancer billing clients in four currencies, I needed a bank that wouldn't eat my margins on FX. North Bridge is the first one that actually delivers on that promise.",
    name: "Fatima Al-Rashid",
    role: "Freelance product designer",
    init: "FA",
  },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const q = QUOTES[idx];

  const goTo = (i: number) => {
    if (i === idx || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setIdx(i);
      setAnimating(false);
    }, 220);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header} data-aos="fade-up">
          <p className="label">Customer stories</p>
          <h2 className={styles.h2}>Trusted by 98 million people.</h2>
        </div>

        <div
          className={`${styles.card} ${animating ? styles.cardOut : styles.cardIn}`}
          data-aos="fade-up"
          data-aos-delay="80"
        >
          <svg
            className={styles.quoteIcon}
            width="32"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
          >
            <path
              d="M0 24V14.4C0 10.56.88 7.36 2.64 4.8 4.48 2.24 7.04.64 10.32 0l1.44 2.4C9.28 3.12 7.6 4.32 6.48 6c-.96 1.6-1.44 3.52-1.44 5.76H10V24H0zm18 0V14.4c0-3.84.88-7.04 2.64-9.6C22.48 2.24 25.04.64 28.32 0l1.44 2.4c-2.48.72-4.16 1.92-5.28 3.6-.96 1.6-1.44 3.52-1.44 5.76H28V24H18z"
              fill="currentColor"
            />
          </svg>
          <blockquote className={styles.blockquote}>"{q.quote}"</blockquote>
          <div className={styles.author}>
            <div className={styles.avatar}>{q.init}</div>
            <div>
              <div className={styles.name}>{q.name}</div>
              <div className={styles.role}>{q.role}</div>
            </div>
          </div>
        </div>

        <div className={styles.dots} data-aos="fade-up" data-aos-delay="160">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
