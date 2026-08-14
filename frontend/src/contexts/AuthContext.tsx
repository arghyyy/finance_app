import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { authApi, usersApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; age: number }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Mock User (fallback when backend is not running) ──────────────────
const MOCK_USER: User = {
  id: 'mock-user-001',
  email: '',
  full_name: '',
  age: 0,
  risk_profile: null,
  occupation_type: null,
  onboarding_completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

let backendAvailable = true;

// panggil API backend
async function tryBackend<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const result = await fn();
    backendAvailable = true;
    return { ok: true, data: result };
  } catch (error: any) {
    if (error.response) {
      // Backend is reachable but returned an error (e.g. 401 Invalid password)
      throw error;
    }
    // Network error (backend unavailable)
    backendAvailable = false;
    return { ok: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const storeTokens = (tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  };

  const fetchUser = useCallback(async () => {
    const result = await tryBackend(() => usersApi.me().then(r => r.data));
    if (result.ok) {
      setUser(result.data);
    } else {
      // Try loading from localStorage mock
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const mockUser = localStorage.getItem('mock_user');
    if (token || mockUser) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);


  // Fungsi yang dipanggil pas user klik tombol "Continue" (register) atau "Sign In" (login) yaitu 

  const login = async (email: string, password: string) => {
    // Try real backend first
    const result = await tryBackend(() => authApi.login(email, password).then(r => r.data));
    if (result.ok) {
      storeTokens(result.data);
      await fetchUser();
      return;
    }

    // Mock fallback
    const mockUser: User = {
      ...MOCK_USER,
      id: `mock-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'mock-token');
    setUser(mockUser);
  };

  const register = async (payload: { email: string; password: string; full_name: string; age: number }) => {
    // Try real backend first
    const result = await tryBackend(() => authApi.register(payload).then(r => r.data));
    if (result.ok) {
      storeTokens(result.data);
      await fetchUser();
      return;
    }

    // Mock fallback
    const mockUser: User = {
      ...MOCK_USER,
      id: `mock-${Date.now()}`,
      email: payload.email,
      full_name: payload.full_name,
      age: payload.age,
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'mock-token');
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mock_user');
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
