# CuraSync — App (Expo / React Native)

Clinical-HUD medical-report-analysis assistant. Same codebase runs on an iQOO
device via Expo Go and in a browser (React Native Web) for demos + Playwright.

## Run
```bash
npm install
# point at the backend if not localhost:4000
# export EXPO_PUBLIC_API_BASE=http://localhost:4000
npm run web        # browser (Playwright-drivable)  -> http://localhost:8081
npm run android    # iQOO device / emulator via Expo Go
npm run ios
```

Start the backend first (`../backend`, port 4000). If the backend is down the app
falls back to seeded data so every screen still renders.

## Screens (custom bottom tab bar)
- **Assistant** (hero) — 3-LLM chat: assistant reply + Diagnostic Assessment card +
  inline visualization chart card + Smart Clinical Prompts. Attach (📎) a lab-report
  photo → OCR → analysis.
- **Vitals** — health-score ring, real-time telemetry cards (ECG sparkline, BP bar,
  glucose trend, SpO2 bars), sleep architecture, regimen, sensors.
- **Reports** — BP & Heart-Rate correlation line chart, diagnostic indicators, OCR
  lab-results reference-range bars, physician dossier.
- **Check-in** — anatomical focus, pain scale, duration, hydration/med/cardio cards;
  "Complete" pushes the check-in into the Assistant conversation.

## Charts
All hand-built with `react-native-svg` (no chart libraries):
`charts/Ring` (health score + gauge viz), `charts/Sparkline` (ECG), `charts/BarChart`
(SpO2 + bar viz), `charts/LineChart` (BP correlation + line viz), `charts/RangeRows`
(OCR labs + range viz). Inline chat charts dispatched by `chat/VizCard`.

## Verify
```bash
npx expo export -p web           # compiles the web bundle
node smoke.mjs                   # Playwright smoke test (serve dist on :4599 first)
```

## Playwright testIDs (map to web `data-testid`)
`tab-vitals` `tab-assistant` `tab-checkin` `tab-reports` · `chat-input` `chat-send`
`chat-attach` · `msg-assistant` `msg-user` · `diagnostic-card` · `chat-viz` · `suggestion-chip`
· `health-score` · `bp-chart` · `lab-results` · `region-*` `pain-*` `complete-checkin`
· `vital-hr|bp|glucose|spo2`

## Themes, Auth & Profile
- **Dark + Light themes** (runtime switchable). Tokens: `src/theme.ts` (`darkColors`,
  `lightColors`, shared `radius/space/type`). Active palette via `useTheme()` from
  `src/state/ThemeContext.tsx`; persisted to `localStorage` (web). Every component builds
  styles with `makeStyles(colors)` memoized on the active palette — no static colors.
  Toggle: sun/moon button in the Header + on Login + on Profile (`theme-toggle`).
- **Login gate** (`src/screens/LoginScreen.tsx`): email/password → `POST /api/auth/login`,
  or "Continue as guest" (`guest@curasync.io`). Token persisted to `localStorage`; a stored
  token is validated via `GET /api/profile` on launch to skip login.
- **Profile** (`src/screens/ProfileScreen.tsx`): open via header avatar (`profile-open`).
  Editable name/age → `PATCH /api/profile` (Bearer). Sensors summary, theme toggle, Sign Out
  (`POST /api/auth/logout` → back to Login).
- Auth state: `src/state/AuthContext.tsx`. Bearer interceptor + `login/logout/getProfile/
  updateProfile` in `src/api.ts`. Logged-in `{name,age}` is passed as `patient` to init.

## Extra testIDs (this round)
`login-email` `login-password` `login-submit` `login-guest` `login-error` ·
`theme-toggle` · `profile-open` `profile-screen` `profile-name` `profile-age`
`profile-save` `profile-back` `profile-signout`.

## Verify
```bash
npx expo export -p web            # 0-error compile (313 modules)
cd dist && python3 -m http.server 4599 &   # serve, backend must be on :4000
node ../verify-features.mjs        # login → guest → theme toggle → profile → signout
```

## Note
Navigation uses a state-driven custom bottom tab bar (not expo-router) — it matches the
Figma's custom bar and is more robust for web export / Playwright. Config in `src/config.ts`,
theme tokens in `src/theme.ts`.
