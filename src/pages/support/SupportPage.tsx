import { useState } from "react";
import styles from "./SupportPage.module.css";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const TELEGRAM_LINK = "https://t.me/northbridgebanking";

const FAQS = [
  {
    q: "How do I make a deposit?",
    a: "Go to the Deposit page, select your cryptocurrency network, and follow the on-screen instructions. Copy the wallet address provided and send your funds from your external wallet. Your deposit will be credited after admin confirmation.",
  },
  {
    q: "How long do withdrawals take?",
    a: "Withdrawals are reviewed by our team and typically processed within 24–48 hours. You will receive a notification once your withdrawal is approved.",
  },
  {
    q: "What are the minimum deposit amounts?",
    a: "Minimum deposits vary by network. Please check the deposit page when selecting your coin for the current minimum requirements.",
  },
  {
    q: "How do I verify my account (KYC)?",
    a: "Go to Settings → KYC tab, fill in your personal details, and upload a valid government-issued ID along with a selfie. Verification is usually completed within 24 hours.",
  },
  {
    q: "Why do I need KYC to withdraw?",
    a: "Identity verification is required to comply with regulations and protect our users. Once your KYC is approved, you can withdraw without restrictions.",
  },
  {
    q: "Is my account secure?",
    a: "Yes. All accounts are protected with secure token authentication. We recommend contacting support immediately if you notice any suspicious activity.",
  },
];

function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill all fields.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await api.post("/user/support/ticket", { subject, message });
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit ticket");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Contact cards */}
      <div className={styles.contactGrid}>
        <div className={styles.card}>
          <div className={styles.contactHeader}>
            <div className={`${styles.contactIcon} ${styles.contactIconBlue}`}>
              <InstagramIcon />
            </div>
            <div>
              <div className={styles.contactPlatform}>Instagram</div>
              <div className={styles.contactHandle}>@North Bridgeofficial</div>
            </div>
          </div>
          <p className={styles.contactDesc}>
            Follow us for updates and DM us for quick support.
          </p>
          <a
            href="https://instagram.com/North Bridgeofficial"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactBtn}
          >
            Follow & DM <ArrowRightIcon />
          </a>
        </div>

        <div className={styles.card}>
          <div className={styles.contactHeader}>
            <div className={`${styles.contactIcon} ${styles.contactIconGreen}`}>
              <TelegramIcon />
            </div>
            <div>
              <div className={styles.contactPlatform}>Telegram Community</div>
              <div className={styles.contactHandle}>@northbridgebanking</div>
            </div>
          </div>
          <p className={styles.contactDesc}>
            Join our Telegram community for support and announcements.
          </p>
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactBtn}
            style={{
              background: "rgba(34,200,83,0.12)",
              borderColor: "rgba(34,200,83,0.3)",
              color: "#22c55e",
            }}
          >
            Join Telegram <ArrowRightIcon />
          </a>
        </div>

        <div className={styles.card}>
          <div className={styles.contactHeader}>
            <div
              className={styles.contactIcon}
              style={{ background: "rgba(21,101,192,0.12)", color: "#1565C0" }}
            >
              <EmailIcon />
            </div>
            <div>
              <div className={styles.contactPlatform}>Email Support</div>
              <div className={styles.contactHandle}>
                support@North Bridge.io
              </div>
            </div>
          </div>
          <p className={styles.contactDesc}>
            Send us an email and we'll respond within 24 hours.
          </p>
          <a
            href="mailto:support@North Bridge.io"
            className={styles.contactBtn}
            style={{
              background: "rgba(21,101,192,0.12)",
              borderColor: "rgba(21,101,192,0.3)",
              color: "#1565C0",
            }}
          >
            Send Email <ArrowRightIcon />
          </a>
        </div>
      </div>

      <div className={styles.splitGrid}>
        {/* FAQ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQ}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <ChevronIcon open={openFaq === i} />
                </button>
                {openFaq === i && <div className={styles.faqA}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Ticket form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Submit a Support Ticket</h2>
          <p
            style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px" }}
          >
            We'll respond within 24 hours. For urgent issues, use Telegram.
          </p>

          {sent ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✓</div>
              <div
                style={{
                  color: "#22c55e",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Ticket Submitted!
              </div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              >
                We'll respond within 24 hours.
              </div>
              <button
                onClick={() => setSent(false)}
                className={styles.submitBtn}
                style={{ width: "auto", padding: "10px 20px" }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="What's the issue?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Message</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Describe your issue in detail…"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={sending}
              >
                {sending ? "Sending…" : "Submit Ticket"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
