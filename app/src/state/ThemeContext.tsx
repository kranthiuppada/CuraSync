import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { palettes, Palette, ThemeMode } from '../theme';

type Ctx = {
  colors: Palette;
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);
const KEY = 'curasync.theme';

// Web-only persistence via localStorage; native falls back to in-memory (no-op).
function readStored(): ThemeMode {
  if (Platform.OS === 'web') {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch {
      /* ignore */
    }
  }
  return 'dark';
}
function writeStored(m: ThemeMode) {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(KEY, m);
    } catch {
      /* ignore */
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStored);

  useEffect(() => {
    writeStored(mode);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const toggle = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo<Ctx>(
    () => ({ colors: palettes[mode], mode, toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error('useTheme must be used within ThemeProvider');
  return c;
}
