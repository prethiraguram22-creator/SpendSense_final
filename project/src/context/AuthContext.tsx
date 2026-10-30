import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createDemoData, createEmptyData } from '@/data/mockData';
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from '@/lib/storage';
import { useFinance } from '@/context/FinanceContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { api, setAuthToken } from '@/lib/api';

export interface Session {
  email: string;
  id?: string;
  token?: string;
}

interface AuthContextValue {
  session: Session | null;
  login: (email: string, password?: string) => Promise<string | null>;
  register: (name: string, email: string, password?: string) => Promise<string | null>;
  startDemo: () => void;
  logout: () => void;
  resetPassword: (email: string) => Promise<string | null>;
  isLiveAuth: boolean;
}

const DEMO_EMAIL = 'alex@spendsense.app';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, replaceData } = useFinance();
  const [session, setSession] = useState<Session | null>(() => {
    const stored = readStorage<Session>(STORAGE_KEYS.session);
    if (stored?.token) {
      setAuthToken(stored.token);
    }
    return stored;
  });

  const isLiveAuth = isSupabaseConfigured;

  const startSession = useCallback((next: Session) => {
    writeStorage(STORAGE_KEYS.session, next);
    if (next.token) {
      setAuthToken(next.token);
    }
    setSession(next);
  }, []);

  // Listen to Supabase Auth state changes if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
      if (sbSession?.user) {
        const next: Session = {
          email: sbSession.user.email || '',
          id: sbSession.user.id,
          token: sbSession.access_token,
        };
        startSession(next);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (sbSession?.user) {
        const next: Session = {
          email: sbSession.user.email || '',
          id: sbSession.user.id,
          token: sbSession.access_token,
        };
        startSession(next);
      } else if (!readStorage<Session>(STORAGE_KEYS.session)?.token?.startsWith('demo-')) {
        setSession(null);
        setAuthToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [startSession]);

  const login = useCallback(
    async (email: string, password?: string): Promise<string | null> => {
      const normalized = email.trim().toLowerCase();

      // 1. If live Supabase is configured, sign in via Supabase Auth
      if (isSupabaseConfigured) {
        try {
          const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
            email: normalized,
            password: password || 'DefaultP@ss123',
          });

          if (sbError) {
            return sbError.message;
          }

          if (sbData.session) {
            startSession({
              email: sbData.session.user.email || normalized,
              id: sbData.session.user.id,
              token: sbData.session.access_token,
            });
            return null;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed.';
          return message;
        }
      }

      // 2. Check backend API directly
      try {
        const res = await api.auth.login(normalized, password);
        if (res.session?.access_token) {
          startSession({
            email: res.user.email || normalized,
            id: res.user.id,
            token: res.session.access_token,
          });
          return null;
        }
      } catch (err) {
        // Fallback to local offline check if server is not reachable
        if (data.settings.email && data.settings.email.toLowerCase() === normalized) {
          startSession({ email: data.settings.email, token: 'demo-token' });
          return null;
        }
        const message = err instanceof Error ? err.message : 'No account matches this email.';
        return message;
      }

      // 3. Fallback to local data
      if (!data.settings.email || data.settings.email.toLowerCase() !== normalized) {
        return 'No account matches this email. Create an account or explore the demo.';
      }
      startSession({ email: data.settings.email, token: 'demo-token' });
      return null;
    },
    [data.settings.email, startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password?: string): Promise<string | null> => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      // 1. If live Supabase is configured, sign up via Supabase Auth
      if (isSupabaseConfigured) {
        try {
          const { data: sbData, error: sbError } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: password || 'DefaultP@ss123',
            options: {
              data: { name: trimmedName },
            },
          });

          if (sbError) {
            return sbError.message;
          }

          if (sbData.session) {
            startSession({
              email: sbData.session.user.email || trimmedEmail,
              id: sbData.session.user.id,
              token: sbData.session.access_token,
            });
            return null;
          } else {
            // User registered, session might require confirmation
            replaceData(createEmptyData(trimmedName, trimmedEmail));
            startSession({ email: trimmedEmail, token: 'demo-token' });
            return null;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed.';
          return message;
        }
      }

      // 2. Call backend API
      try {
        const res = await api.auth.register(trimmedName, trimmedEmail, password);
        if (res.session?.access_token) {
          replaceData(createEmptyData(trimmedName, trimmedEmail));
          startSession({
            email: res.user.email || trimmedEmail,
            id: res.user.id,
            token: res.session.access_token,
          });
          return null;
        }
      } catch {
        // Fallback to local storage creation
        if (data.settings.email) {
          return 'An account already exists on this device. Sign in instead.';
        }
        replaceData(createEmptyData(trimmedName, trimmedEmail));
        startSession({ email: trimmedEmail, token: 'demo-token' });
        return null;
      }

      replaceData(createEmptyData(trimmedName, trimmedEmail));
      startSession({ email: trimmedEmail, token: 'demo-token' });
      return null;
    },
    [data.settings.email, replaceData, startSession],
  );

  const startDemo = useCallback(() => {
    replaceData(createDemoData(new Date(), 'Alex Morgan', DEMO_EMAIL));
    startSession({ email: DEMO_EMAIL, token: 'demo-token' });
  }, [replaceData, startSession]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => null);
    }
    api.auth.logout().catch(() => null);
    removeStorage(STORAGE_KEYS.session);
    setAuthToken(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return error.message;
      return null;
    }
    const res = await api.auth.resetPassword(email).catch((e) => ({ success: false, message: e.message }));
    return res.success ? null : res.message || 'Unable to send password reset.';
  }, []);

  const value = useMemo(
    () => ({ session, login, register, startDemo, logout, resetPassword, isLiveAuth }),
    [session, login, register, startDemo, logout, resetPassword, isLiveAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
