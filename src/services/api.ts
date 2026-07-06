// ─── API Service ───────────────────────────────────────────────────────────
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

export interface Network {
  id: number;
  name: string;
  slug: string;
  symbol: string;
  color: string;
  confirmations: number;
  min_deposit: number;
  fee: number;
  deposit_address: string;
  is_active: boolean;
  usd_rate?: number;
  min_deposit_usd?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  balance: number;
  wallet_address?: string;
  phone?: string;
  kyc_status: "none" | "pending" | "approved" | "rejected";
  account_status: "active" | "suspended";
  created_at: string;
}

export interface Deposit {
  id: number;
  user_id: number;
  network_id?: number;
  amount: number;
  usd_amount?: number;
  usd_rate?: number;
  currency: string;
  transaction_hash?: string;
  status: "pending" | "confirmed" | "rejected";
  confirmations?: number;
  confirmed_at?: string;
  credited_at?: string;
  created_at: string;
  network?: Network;
  user?: User;
  // Fintech additions
  method?: "crypto" | "bank_transfer" | "card";
  bank_account_id?: number;
  sender_name?: string;
  sender_bank?: string;
  payment_reference?: string;
  payment_intent_id?: string;
  card_brand?: string;
  card_last4?: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  network_id?: number;
  amount?: number;
  usd_amount?: number;
  crypto_amount?: number;
  symbol?: string;
  currency?: string;
  usd_rate?: number;
  fee_usd?: number;
  net_usd?: number;
  recipient_address?: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  network?: Network;
  user?: User;
  // Fintech additions
  method?: "crypto" | "bank_transfer";
  bank_name?: string;
  account_name?: string;
  account_number?: string;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  usd_amount?: number;        // ← NEW: USD equivalent for display
  currency: string;
  status: "pending" | "confirmed" | "failed";
  reference_id: number;
  reference_type: string;
  hash?: string;
  network: string;            // "bank_transfer" | "bank transfer" | crypto network name
  method?: "crypto" | "bank_transfer"; // ← NEW: explicit method flag
  note?: string;
  created_at: string;
  user?: User;
}

export interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  sort_code?: string;
  is_active: boolean;
}

export interface KycSubmission {
  id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  document_type: string;
  document_number?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  country?: string;
  document_image_url?: string;
  selfie_url?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  reviewed_by?: number;
  created_at: string;
  user?: User;
}

export interface AdminMetrics {
  total_users: number;
  total_volume: number;
  pending_withdrawals: number;
  pending_kyc: number;
  pending_deposits: number;
  confirmed_deposits: number;
  total_deposits_value: number;
  recent_transactions: Transaction[];
}

export interface AdminSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  maintenance_mode: boolean;
  api_rate_limit: number;
  webhook_url: string;
  deposit_wallet_eth: string;
  deposit_wallet_btc: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export function getToken(): string | null {
  return localStorage.getItem("coinbridge_token");
}

export function setToken(token: string): void {
  localStorage.setItem("coinbridge_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("coinbridge_token");
}

// Identifies this frontend to the shared Laravel API so it knows which
// database connection to use (mysql for Northbridge, client_mysql for
// Altioda). See DetectTenantConnection middleware on the backend.
const APP_IDENTIFIER = "northbridge";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-App": APP_IDENTIFIER,
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {}
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return res.json();
}

async function uploadForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-App": APP_IDENTIFIER,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  upload: <T>(path: string, formData: FormData) =>
    uploadForm<T>(path, formData),
};

export default api;