import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./DashboardLayout.module.css";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: HomeIcon, end: true },
  { path: "/dashboard/wallet", label: "Wallet", icon: WalletIcon, end: false },
  { path: "/dashboard/deposit", label: "Fund Account", icon: DepositIcon, end: false },
  { path: "/dashboard/withdraw", label: "Withdraw", icon: WithdrawIcon, end: false },
  { path: "/dashboard/invest", label: "Invest", icon: InvestIcon, end: false },
  { path: "/dashboard/transactions", label: "Transactions", icon: TransactionsIcon, end: false },
  { path: "/dashboard/markets", label: "FX Rates", icon: MarketsIcon, end: false },
  { path: "/dashboard/academy", label: "Academy", icon: AcademyIcon, end: false },
  { path: "/dashboard/settings", label: "Settings", icon: SettingsIcon, end: false },
  { path: "/dashboard/support", label: "Support", icon: SupportIcon, end: false },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarInner}>
          <div className={styles.logo}>
            {/* <div className={styles.logoIcon}>
              <img
                src="/def167e0-80fb-45ae-81a0-633728502489.jpg"
                alt="North Bridge Logo"
                className={styles.logoImage}
              />
            </div> */}
            <span className={styles.logoText}>
              <span className={styles.logoBridge}>North Bridge</span>
            </span>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className={styles.navDivider} />

            <button
              className={styles.navItem}
              onClick={handleLogout}
              style={{ background: "none", border: "none", width: "100%", cursor: "pointer", textAlign: "left" }}
            >
              <LogoutIcon />
              <span>Logout</span>
            </button>
          </nav>

          {/* Sidebar promo card — updated to fintech context */}
          <div className={styles.inviteCard}>
            <div className={styles.inviteRocket}>💼</div>
            <div className={styles.inviteContent}>
              <h4>Grow Your Money</h4>
              <p>Explore investment plans with competitive returns</p>
            </div>
            <a
              href="/dashboard/invest"
              className={styles.inviteBtn}
              style={{ textDecoration: "none" }}
            >
              Invest Now →
            </a>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </button>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userProfile}>
              <div className={styles.avatar} style={{ background: "#1565C0" }}>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>
                  {initials}
                </span>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || "User"}</span>
                <span className={styles.userVerified}>
                  <span style={{ color: user?.kyc_status === "approved" ? "#22c55e" : "#9ca3af" }}>
                    {user?.kyc_status === "approved" ? "● Verified" : "● Unverified"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function WalletIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>; }
function MarketsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function InvestIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2m7-7l3-3 3 3m0 10l-3 3-3-3"/></svg>; }
function DepositIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }
function WithdrawIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function TransactionsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function AcademyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>; }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function SupportIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function LogoutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
