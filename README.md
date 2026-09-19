# CuraSync — On-Device Clinical AI for Medical Report Analysis

> iQOO Hackathon build. A **backend-driven, 3-LLM** health assistant that runs its intelligence
> **entirely on-device** (Ollama — no cloud, no API keys, works offline), does **OCR on lab/blood
> reports**, and renders **live analysis, graphs, and simulations** in the chat itself.

<p align="center"><em>Node.js backend · React Native (Expo) app · Ollama <code>qwen2.5:3b</code> · Tesseract.js OCR</em></p>

## Why it wins
- **Truly native intelligence.** All 3 models run locally via Ollama. No keys, no network, private by construction — patient data never leaves the device. Perfect for the on-device-AI theme.
- **Three specialized LLMs, one small model, three prompts:**
  1. **Intent Router** — classifies every turn (symptom / report / vitals / lifestyle / general / emergency).
  2. **Answer LLM** — the clinical reply + a structured **Diagnostic Assessment** card + an inline **chart/simulation** spec.
  3. **Suggestions LLM** — "Smart Clinical Prompt" chips, regenerated **on init and after every turn**.
- **OCR → live analysis (hero flow).** Snap a lab report → Tesseract extracts values on-device → labs are flagged against clinical reference ranges → the Answer LLM analyzes them → a **range chart** plots each flagged value against its normal band, right inside the chat.
- **The chatbot renders graphs & simulations.** The Answer LLM emits a `visualization` spec (line / bar / gauge / range) that the app draws with hand-built SVG — including *projected-recovery* simulations ("what happens if you follow this protocol").
- **Bulletproof for demo day.** Every LLM call falls back to a deterministic clinical stub if the model is slow or returns bad JSON, and clinical turns always land a Diagnostic card + chart.

## Architecture
```
React Native (Expo, web+device)         Node.js + Express                Ollama (on-device)
┌───────────────────────────┐  init/chat/ocr  ┌──────────────────────┐   ┌────────────────┐
│ Assistant · Vitals ·       │ ───────────────▶│ Intent Router  (LLM1) │──▶│                │
│ Reports · Check-in         │                 │ Answer + Viz   (LLM2) │──▶│   qwen2.5:3b   │
│ SVG charts, inline chat viz│ ◀───────────────│ Suggestions    (LLM3) │──▶│                │
└───────────────────────────┘  JSON            │ Tesseract.js OCR      │   └────────────────┘
                                                └──────────────────────┘
```

## Quick start
```bash
# 0. One-time: on-device model
brew install ollama && ollama serve &
ollama pull qwen2.5:3b

# 1. Backend (:4000)
cd backend && npm install && npm start

# 2. App (Expo — runs on an iQOO device via Expo Go, or in the browser)
cd app && npm install && npx expo start        # press w for web, or scan QR on device

# 3. Verify everything (backend + UI, with screenshots)
npm run smoke        # backend 3-LLM pipeline
npm run verify       # Playwright drives the app end-to-end  (APP_URL=http://localhost:8081)
```

## Repo layout
| Path | What |
|------|------|
| `backend/` | Express server, 3-LLM orchestrator, Ollama client, Tesseract OCR, fallbacks |
| `app/` | Expo React Native app — 4 screens, hand-built SVG charts, inline chat viz |
| `docs/API_CONTRACT.md` | Authoritative request/response shapes |
| `docs/screenshots/` | Playwright-captured screens of the running app |
| `scripts/` | `smoke.mjs` (backend E2E), `verify_e2e.mjs` (UI E2E), sample lab report + renderer |

## Screens (from the CuraSync clinical-HUD design)
- **Login** — email/password (`POST /auth/login`) or **Continue as guest**; token persisted, revalidated on launch. Gates the app.
- **Assistant** — the hero: 3-LLM chat, Diagnostic Assessment cards, inline graphs/simulations, Smart Clinical Prompts, attach-report → OCR.
- **Vitals** — Health Vitality Score ring, real-time telemetry cards with SVG sparklines, sleep architecture.
- **Reports** — weekly BP & Heart-Rate correlation line chart, diagnostic indicators, OCR lab results vs reference ranges, physician dossier.
- **Check-in** — anatomical symptom checker → syncs into the Assistant conversation.
- **Profile** — open via the header avatar: edit name/age (`PATCH /profile`), connected sensors, theme toggle, sign out.

## Theming
Full **dark + light** clinical palettes via a `useTheme()` context, switchable with the sun/moon
toggle in the header (and Profile), persisted to local storage. All surfaces, text, borders, inputs,
and hand-built SVG charts are palette-driven.

## Privacy & disclaimer
Runs fully on-device; no PHI leaves the machine. CuraSync provides wellness guidance and is **not a
medical diagnosis** — it always defers urgent symptoms to emergency care and a licensed physician.
