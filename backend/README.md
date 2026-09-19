# CuraSync Backend

Node.js + Express orchestrator for a **3-LLM** medical-report-analysis assistant. All three
models run **on-device via Ollama** (`qwen2.5:3b`) — no cloud, no API keys.

## The 3 LLMs (one model, three prompts)
1. **Intent Router** (`prompts.js` → `ROUTER_SYSTEM`) — classifies each turn (symptom / report / vitals / lifestyle / general / emergency).
2. **Answer LLM** (`ANSWER_SYSTEM`) — reply + structured Diagnostic Assessment + inline `visualization` chart spec.
3. **Suggestions LLM** (`SUGGEST_SYSTEM`) — "Smart Clinical Prompt" chips, regenerated on init and after every turn.

Every LLM call falls back to a deterministic stub (`llm/fallbacks.js`) if Ollama is down or returns
bad JSON, so the demo never breaks.

## Run
```bash
# 1. Ollama (once): install + pull the model + keep the server running
brew install ollama
ollama serve &            # background
ollama pull qwen2.5:3b

# 2. Backend
cd backend
npm install
npm start                 # http://localhost:4000
```

## Endpoints
See `../docs/API_CONTRACT.md`. Quick reference:
- `GET  /api/health` — `{ ok, ollama, model }`
- `GET  /api/vitals` — dashboard/report data (OCR labs merged in)
- `POST /api/conversations/init` — start convo (Answer + Suggestions LLM)
- `POST /api/conversations/:id/chat` — turn (Router → Answer → Suggestions)
- `POST /api/ocr` — multipart `image` → parsed lab values (Tesseract.js, local)

## Config (env)
`PORT`, `OLLAMA_HOST`, `OLLAMA_MODEL`, plus per-role overrides `OLLAMA_ROUTER_MODEL` /
`OLLAMA_ANSWER_MODEL` / `OLLAMA_SUGGEST_MODEL`, and `OLLAMA_TIMEOUT_MS`.

## Smoke test
```bash
node scripts/smoke.mjs      # from repo root, after backend + ollama are up
```
