// CuraSync theme tokens. Two clinical palettes (dark default + light), with
// radius/space/type shared across both. Components must read the ACTIVE palette
// from useTheme() and build styles via makeStyles(colors) so runtime switching works.

export const darkColors = {
  canvas: '#090D16',
  surface1: '#0D1322', // cards
  surface2: '#131B2E', // elevated
  surface3: '#1C2B3C',
  hairline: 'rgba(148,163,184,0.12)',
  hairlineStrong: 'rgba(148,163,184,0.20)',

  primary: '#14B8A6',
  primaryBright: '#2DD4BF',
  secondary: '#38BDF8',
  tertiary: '#2DD4BF',

  onPrimary: '#090D16',

  text: '#F1F5F9',
  textMuted: '#94A3B8',
  ghost: '#475569',

  nominal: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  criticalText: '#FCA5A5',

  chipBg: 'rgba(20,184,166,0.08)',
  chipBorder: 'rgba(20,184,166,0.25)',
  chipText: '#2DD4BF',

  glowTeal: 'rgba(20,184,166,0.08)',
};

export type Palette = typeof darkColors;

export const lightColors: Palette = {
  canvas: '#F4F7FB',
  surface1: '#FFFFFF',
  surface2: '#EEF3FA',
  surface3: '#E2E9F3',
  hairline: 'rgba(15,23,42,0.10)',
  hairlineStrong: 'rgba(15,23,42,0.18)',

  primary: '#0D9488',
  primaryBright: '#14B8A6',
  secondary: '#0284C7',
  tertiary: '#0F9E8E',

  onPrimary: '#FFFFFF',

  text: '#0F172A',
  textMuted: '#5B6B7F',
  ghost: '#94A3B8',

  nominal: '#059669',
  warning: '#D97706',
  critical: '#DC2626',
  criticalText: '#B91C1C',

  chipBg: 'rgba(13,148,136,0.10)',
  chipBorder: 'rgba(13,148,136,0.30)',
  chipText: '#0D9488',

  glowTeal: 'rgba(13,148,136,0.10)',
};

export const palettes = { dark: darkColors, light: lightColors };
export type ThemeMode = keyof typeof palettes;

// Back-compat alias (dark). Prefer useTheme() in components.
export const colors = darkColors;

export const radius = {
  base: 4,
  card: 8,
  section: 12,
  full: 9999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const font = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
};

export const type = {
  headlineXl: { fontSize: 30, fontWeight: '600' as const, lineHeight: 38, letterSpacing: -0.4 },
  headlineLg: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.3 },
  headlineMd: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  headlineSm: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20, letterSpacing: 0.3 },
  labelMd: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
  labelSm: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.8 },
  metric: { fontSize: 28, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.5 },
  metricLg: { fontSize: 40, fontWeight: '700' as const, lineHeight: 44, letterSpacing: -1 },
};
