import { useState, useEffect, useRef } from "react";
import styles from "./ActivityToast.module.css";

const EVENTS = [
  { name: "James T.",   action: "opened a savings account",    country: "🇺🇸" },
  { name: "Sophia K.",  action: "sent $1,200 to Germany",      country: "🇩🇪" },
  { name: "Liam R.",    action: "earned $48 in interest",      country: "🇬🇧" },
  { name: "Emma W.",    action: "opened a checking account",   country: "🇦🇺" },
  { name: "Noah B.",    action: "transferred funds to Japan",   country: "🇯🇵" },
  { name: "Olivia M.",  action: "activated their debit card",  country: "🇨🇦" },
  { name: "Ethan H.",   action: "set up auto-invest",          country: "🇫🇷" },
  { name: "Ava D.",     action: "sent $340 to Ghana",          country: "🇬🇭" },
  { name: "Mason C.",   action: "earned 5.2% APY this month",  country: "🇸🇬" },
  { name: "Amara O.",   action: "made a card payment in Tokyo",country: "🇯🇵" },
];

interface Toast {
  id: number;
  ev: typeof EVENTS[number];
  visible: boolean;
  exiting: boolean;
}

let tid = 0;

export default function ActivityToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const queue  = useRef<typeof EVENTS[number][]>([]);
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 340);
  };

  const pop = () => {
    if (!queue.current.length) return;
    const ev = queue.current.shift()!;
    const id = ++tid;
    setToasts(prev => [...prev.slice(-1), { id, ev, visible: false, exiting: false }]);
    // two rAF ticks to ensure element is in DOM before animating in
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t))
      )
    );
    setTimeout(() => dismiss(id), 4800);
  };

  useEffect(() => {
    const schedule = () => {
      const delay = 6500 + Math.random() * 5000;
      timer.current = setTimeout(() => {
        queue.current.push(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
        pop();
        schedule();
      }, delay);
    };
    // First toast after 3.5s
    timer.current = setTimeout(() => {
      queue.current.push(EVENTS[0]);
      pop();
      schedule();
    }, 3500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.portal} aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${t.visible && !t.exiting ? styles.in : styles.out}`}
          role="status"
        >
          <span className={styles.flag}>{t.ev.country}</span>
          <span className={styles.text}>
            <strong>{t.ev.name}</strong> {t.ev.action}
          </span>
          <button
            className={styles.close}
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6"  y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
