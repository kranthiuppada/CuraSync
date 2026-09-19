import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as api from '../api';
import type { Profile } from '../api';

type Ctx = {
  ready: boolean;
  authed: boolean;
  token: string | null;
  user: Profile | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  guestLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<boolean>;
};

const AuthCtx = createContext<Ctx | null>(null);
const TKEY = 'curasync.token';

function readToken(): string | null {
  if (Platform.OS === 'web') {
    try { return window.localStorage.getItem(TKEY); } catch { return null; }
  }
  return null;
}
function writeToken(t: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (t) window.localStorage.setItem(TKEY, t);
      else window.localStorage.removeItem(TKEY);
    } catch { /* ignore */ }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore + validate a stored token on launch.
  useEffect(() => {
    (async () => {
      const stored = readToken();
      if (stored) {
        api.setAuthToken(stored);
        try {
          const p = await api.getProfile();
          setToken(stored);
          setUser(p);
        } catch {
          api.setAuthToken(null);
          writeToken(null);
        }
      }
      setReady(true);
    })();
  }, []);

  const finishLogin = useCallback((tk: string, profile: Profile) => {
    api.setAuthToken(tk);
    writeToken(tk);
    setToken(tk);
    setUser(profile);
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { token: tk, profile } = await api.login(email, password);
      finishLogin(tk, profile);
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
      return false;
    }
  }, [finishLogin]);

  const guestLogin = useCallback(() => login('guest@curasync.io', 'guestpass'), [login]);

  const logout = useCallback(async () => {
    await api.logout();
    api.setAuthToken(null);
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const saveProfile = useCallback(async (patch: Partial<Profile>) => {
    try {
      const p = await api.updateProfile(patch);
      setUser(p);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthCtx.Provider value={{ ready, authed: !!token, token, user, error, login, guestLogin, logout, saveProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
