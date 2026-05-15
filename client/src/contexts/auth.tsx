import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_BASE = 'http://localhost:5000';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('accessToken'),
    loading: true,
    isAuthenticated: false,
  });

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setState({ user: null, token: null, loading: false, isAuthenticated: false });
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        clearAuth();
        return false;
      }
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setState((prev) => ({ ...prev, token: data.accessToken, isAuthenticated: true }));
        return true;
      }
      clearAuth();
      return false;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('accessToken');

      if (savedUser && savedToken) {
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` },
            credentials: 'include',
          });
          if (!res.ok) {
            const refreshed = await refreshSession();
            if (!refreshed) {
              clearAuth();
              return;
            }
            const retryRes = await fetch(`${API_BASE}/api/v1/auth/profile`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
              credentials: 'include',
            });
            if (!retryRes.ok) {
              clearAuth();
              return;
            }
            const retryData = await retryRes.json();
            localStorage.setItem('user', JSON.stringify(retryData.user));
            setState({
              user: retryData.user,
              token: localStorage.getItem('accessToken'),
              loading: false,
              isAuthenticated: true,
            });
            return;
          }
          const data = await res.json();
          localStorage.setItem('user', JSON.stringify(data.user));
          setState({
            user: data.user,
            token: savedToken,
            loading: false,
            isAuthenticated: true,
          });
        } catch {
          const refreshed = await refreshSession();
          if (!refreshed) {
            clearAuth();
          }
        }
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    init();

    const handleAuthLogout = () => clearAuth();
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [clearAuth, refreshSession]);

  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;
    const interval = setInterval(
      () => {
        refreshSession();
      },
      14 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token, refreshSession]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setState({
      user: data.user,
      token: data.accessToken,
      loading: false,
      isAuthenticated: true,
    });
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setState({
      user: data.user,
      token: data.accessToken,
      loading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.token}` },
        credentials: 'include',
      });
    } catch {}
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}