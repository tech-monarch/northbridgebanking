import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const NAV = [
  { label: "Home", id: "home" },
  { label: "Services", id: "services" },
  { label: "How it works", id: "how" },
  { label: "FAQ", id: "faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      let cur = NAV[0].id;
      for (const { id } of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 80) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="1.5" rx=".75" fill="white" />
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
          <div>
            <div className={styles.logoName}>North Bridge</div>
            <div className={styles.logoSub}>Banking</div>
          </div>
        </Link>

        {/* Nav links */}
        <ul className={`${styles.navLinks} ${open ? styles.open : ""}`}>
          {NAV.map(({ label, id }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active === id ? styles.active : ""}
                onClick={(e) => go(e, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            <span className={styles.themeBtnInner}>
              {theme === "dark" ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </span>
          </button>
          <Link to="/login" className={styles.signIn}>
            Sign in
          </Link>
          <Link to="/register" className={styles.openAccount}>
            Open account
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={open ? styles.hOpen1 : ""} />
          <span className={open ? styles.hOpen2 : ""} />
          <span className={open ? styles.hOpen3 : ""} />
        </button>
      </div>
    </nav>
  );
}
