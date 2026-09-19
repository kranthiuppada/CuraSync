# CuraSync API Contract (v1)

Backend: Node.js + Express on `http://localhost:4000`. All 3 LLM roles run on a local
Ollama server (`http://localhost:11434`, model `qwen2.5:3b`). No cloud, no keys.

## The 3 LLMs
1. **Intent Router** — classifies each user turn into an intent + extracts slots. Returns JSON.
2. **Answer LLM** — produces the assistant reply + a structured `analysis` card. Returns JSON.
3. **Suggestions LLM** — produces 2–4 "Smart Clinical Prompt" chips. Called on **init** and after **every completed turn**.

## Endpoints

### `POST /api/conversations/init`
Starts a conversation. Runs Answer LLM (greeting) + Suggestions LLM.
Request:
```json
{ "patient": { "name": "Elena", "age": 34 } }   // optional; defaults applied
```
Response `200`:
```json
{
  "conversationId": "c_ab12cd",
  "greeting": {
    "role": "assistant",
    "text": "Good morning Elena. Your resting heart rate ...",
    "telemetry": { "label": "Telemetry sync", "value": "58 BPM", "baseline": "Resting baseline: 62 BPM" }
  },
  "suggestions": [
    { "id": "s1", "label": "Analyze 7-day sleep trend", "icon": "chart" },
    { "id": "s2", "label": "Log water (+250ml)", "icon": "water" }
  ],
  "vitals": { /* same shape as GET /api/vitals */ }
}
```

### `POST /api/conversations/:id/chat`
Continues a conversation. Pipeline: Intent Router → Answer LLM → Suggestions LLM.
Request:
```json
{ "message": "I have a mild tension headache", "ocr": { /* optional structured OCR result */ } }
```
Response `200`:
```json
{
  "intent": { "name": "symptom_report", "confidence": 0.86, "slots": { "symptom": "tension headache", "severity": "mild" } },
  "reply": { "role": "assistant", "text": "..." },
  "analysis": {
    "title": "Tension Headache: Dehydration or Sleep Posture",
    "conditionProbability": { "label": "Mild", "match": 78 },
    "biometricCrossCheck": "Current BP 118/78 mmHg is within optimal range — vascular etiology unlikely.",
    "recommendedProtocol": [
      { "icon": "water", "text": "Drink 400ml room-temp water immediately to replenish overnight deficits." },
      { "icon": "stretch", "text": "Perform a gentle 2-minute suboccipital & cervical stretch." },
      { "icon": "clock", "text": "Re-evaluate in 45 minutes. If pain persists, notify your care team." }
    ],
    "synthesizedBy": "MD Synthesized"
  },
  "visualization": {
    "type": "line",
    "title": "Projected Hydration Recovery",
    "caption": "Simulated over next 6h if protocol followed",
    "unit": "ml",
    "series": [ { "name": "Hydration", "color": "#38BDF8", "points": [ {"x":"now","y":1450}, {"x":"+2h","y":1800}, {"x":"+4h","y":2100}, {"x":"+6h","y":2200} ] } ],
    "target": 2200,
    "bands": null
  },
  "suggestions": [ { "id": "s3", "label": "...", "icon": "chart" } ]
}
```
`analysis` and `visualization` may each be `null`. When `visualization` is present the Assistant
screen renders it as an **inline chart card** in the chat thread (line = trend/simulation, bar =
metric comparison, gauge = single score, range = labs vs reference band). This is how the chatbot
"renders graphs and simulations" — the backend supplies the spec, the UI draws it with SVG.

### `POST /api/ocr`  (multipart/form-data, field `image`)
Runs Tesseract OCR on an uploaded lab/report image, parses lab values.
Response `200`:
```json
{
  "rawText": "HEMOGLOBIN 11.2 g/dL ...",
  "values": [
    { "name": "Hemoglobin", "value": 11.2, "unit": "g/dL", "refLow": 13.0, "refHigh": 17.0, "flag": "low" },
    { "name": "Fasting Glucose", "value": 96, "unit": "mg/dL", "refLow": 70, "refHigh": 100, "flag": "normal" }
  ],
  "summary": { "total": 8, "flagged": 3 }
}
```
Client then POSTs a chat turn with `ocr` = this response to get an LLM analysis.

### `GET /api/vitals`
Seeded + OCR-updated vitals for the Vitals dashboard and Reports charts.
```json
{
  "healthScore": { "value": 94, "delta": 3, "status": "Optimal" },
  "cards": [
    { "key": "hr", "label": "Heart Rate", "value": 71, "unit": "BPM", "sub": "Resting 64 bpm", "status": "Sinus Rhythm", "series": [64,66,71,68,70,72,71] },
    { "key": "bp", "label": "Blood Pressure", "value": "118/78", "unit": "mmHg", "sub": "MAP: 91 mmHg", "status": "Optimal Level" },
    { "key": "glucose", "label": "Glucose", "value": 96, "unit": "mg/dL", "sub": "Fasting · Dexcom", "status": "In Range (98%)", "series": [92,95,96,94,96,97,96] },
    { "key": "spo2", "label": "Oxygen SpO2", "value": 98, "unit": "%", "sub": "Nocturnal avg 97%", "status": "Normal Saturation" }
  ],
  "sleep": { "duration": "8h 12m", "efficiency": 88, "deep": "1h 45m", "rem": "2h 10m", "core": "3h 52m" },
  "weeklyBP": {
    "days": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    "systolic": [116,118,120,119,117,121,119],
    "diastolic": [74,76,78,77,75,79,77]
  },
  "labs": []   // filled from OCR
}
```

### Auth + profile (demo)
- `POST /api/auth/login` — body `{ "email", "password" }`. Accepts any well-formed email + password ≥4 chars. Returns `{ "token", "user": { "id","name","email","age","plan","sex" } }`, or `401 { "error", "message" }`. Send `Authorization: Bearer <token>` on the calls below.
- `POST /api/auth/logout` — invalidates the token → `{ "ok": true }`.
- `GET /api/profile` — `{ "user": {...} }` (401 if no/invalid token).
- `PATCH /api/profile` — body may include `name`, `age`, `plan`, `sex`; returns updated `{ "user": {...} }`.

### `GET /api/health`
`{ "ok": true, "ollama": true, "model": "qwen2.5:3b" }`

## LLM JSON discipline
All 3 LLM calls request `format: "json"` from Ollama and are parsed defensively.
If a call fails or returns malformed JSON, the backend falls back to a deterministic
stub so the demo never breaks (fallbacks live in `llm/fallbacks.js`).
