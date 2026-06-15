import { useState } from "react";
import styles from "./FAQ.module.css";

const FAQS = [
  {
    q: "Is North Bridge Banking a real bank?",
    a: "Yes. North Bridge Banking is a fully licensed and regulated financial institution. Your deposits are FDIC-insured up to $250,000 per depositor, per account category.",
  },
  {
    q: "Are there any monthly fees?",
    a: "No. Our core checking and savings accounts are completely free — no monthly maintenance fees, no minimum balance requirements, no hidden charges.",
  },
  {
    q: "How quickly can I deposit and withdraw?",
    a: "Most ACH deposits are available within minutes. Wire transfers settle same-day. Withdrawals to linked bank accounts process within 1 business day. No withdrawal fees on standard transfers.",
  },
  {
    q: "How does North Bridge make money?",
    a: "We earn on interchange fees when you use your debit card, on interest from loans and institutional partners, and on optional premium features. We never sell your data.",
  },
  {
    q: "Can I use North Bridge internationally?",
    a: "Yes. Our cards work in 190+ countries. International payments are processed in real time with mid-market exchange rates — no markup, no SWIFT delays.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.left} data-aos="fade-right">
          <p className="label">FAQ</p>
          <h2 className={styles.h2}>Common questions.</h2>
          <p className={styles.body}>
            Can't find what you're looking for?{" "}
            <a href="#" className={styles.link}>
              Contact support →
            </a>
          </p>
        </div>

        <div className={styles.right} data-aos="fade-left" data-aos-delay="80">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`${styles.item} ${open === i ? styles.itemOpen : ""}`}
            >
              <button
                className={styles.q}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <svg
                  className={`${styles.chevron} ${open === i ? styles.chevronOpen : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={`${styles.answer} ${open === i ? styles.answerOpen : ""}`}
              >
                <div className={styles.answerInner}>
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
