import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHome from "@/pages/home/DashboardHome";
import WalletPage from "@/pages/wallet/WalletPage";
import MarketsPage from "@/pages/markets/MarketsPage";
import InvestPage from "@/pages/invest/InvestPage";
import DepositPage from "@/pages/deposit/DepositPage";
import WithdrawPage from "@/pages/withdraw/WithdrawPage";
import TransactionsPage from "@/pages/transactions/TransactionsPage";
import AcademyPage from "@/pages/academy/AcademyPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import SupportPage from "@/pages/support/SupportPage";

// Admin
import AdminLayout from "@/pages/admin/components/AdminLayout";
import AdminOverview from "@/pages/admin/pages/AdminOverview";
import AdminUsers from "@/pages/admin/pages/AdminUsers";
import AdminTransactions from "@/pages/admin/pages/AdminTransactions";
import AdminDeposits from "@/pages/admin/pages/AdminDeposits";
import AdminWithdrawals from "@/pages/admin/pages/AdminWithdrawals";
import AdminWallets from "@/pages/admin/pages/AdminWallets";
import AdminMarkets from "@/pages/admin/pages/AdminMarkets";
import AdminKyc from "@/pages/admin/pages/AdminKyc";
import AdminSupport from "@/pages/admin/pages/AdminSupport";
import AdminAcademy from "@/pages/admin/pages/AdminAcademy";
import AdminSettings from "@/pages/admin/pages/AdminSettings";

function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin" | "user";
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0a0f1e",
          color: "#fff",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="wallets" element={<AdminWallets />} />
          <Route path="markets" element={<AdminMarkets />} />
          <Route path="kyc" element={<AdminKyc />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="academy" element={<AdminAcademy />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth role="user">
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="markets" element={<MarketsPage />} />
          <Route path="invest" element={<InvestPage />} />
          <Route path="deposit" element={<DepositPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="academy" element={<AcademyPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
