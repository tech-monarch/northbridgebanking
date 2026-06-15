import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api, { type User, setToken, clearToken, getToken } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getToken(),
    loading: true,
    error: '',
  });

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setState((s) => ({ ...s, user: data.user, loading: false }));
    } catch {
      clearToken();
      setState({ user: null, token: null, loading: false, error: '' });
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      refreshUser();
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, error: '', loading: true }));
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      setToken(data.token);
      setState({ user: data.user, token: data.token, loading: false, error: '' });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Login failed' }));
      throw e;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setState((s) => ({ ...s, error: '', loading: true }));
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/register', {
        name, email, password, password_confirmation,
      });
      setToken(data.token);
      setState({ user: data.user, token: data.token, loading: false, error: '' });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Registration failed' }));
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearToken();
    setState({ user: null, token: null, loading: false, error: '' });
  };

  const clearError = () => setState((s) => ({ ...s, error: '' }));

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth(role?: 'admin' | 'user') {
  const auth = useAuth();
  return {
    ...auth,
    isAuthorized:
      !auth.loading &&
      auth.user !== null &&
      (role ? auth.user.role === role : true),
  };
}
