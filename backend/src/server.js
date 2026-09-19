// CuraSync backend — Express server exposing init/chat/ocr/vitals over the 3-LLM Ollama pipeline.
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { CONFIG } from './config.js';
import { ollamaUp, warmup } from './llm/ollama.js';
import { routeIntent, generateAnswer, generateSuggestions } from './llm/orchestrator.js';
import { analyzeReport } from './ocr/ocr.js';
import { createConversation, getConversation, getVitals, ingestLabs } from './store.js';
import { login, updateProfile, logout, withUser } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// --- health ---
app.get('/api/health', async (_req, res) => {
  const up = await ollamaUp();
  res.json({ ok: true, ollama: up.ok, model: up.ok ? (up.model ?? CONFIG.ollama.model) : null, service: 'curasync-backend' });
});

// --- auth + profile ---
app.post('/api/auth/login', (req, res) => {
  const out = login(req.body ?? {});
  if (out.error) return res.status(401).json({ error: out.error, message: out.error === 'invalid_email' ? 'Enter a valid email address.' : 'Password must be at least 4 characters.' });
  res.json(out);
});
app.post('/api/auth/logout', withUser, (req, res) => { logout(req.token); res.json({ ok: true }); });
app.get('/api/profile', withUser, (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  res.json({ user: req.user });
});
app.patch('/api/profile', withUser, (req, res) => {
  const user = updateProfile(req.token, req.body ?? {});
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  res.json({ user });
});

// --- vitals (dashboard + reports) ---
app.get('/api/vitals', (_req, res) => res.json(getVitals()));

// --- init conversation: Answer LLM greeting + Suggestions LLM ---
app.post('/api/conversations/init', async (req, res) => {
  try {
    const convo = createConversation(req.body?.patient);
    const vitals = getVitals();
    const intent = { name: 'general', confidence: 1, slots: {} };
    // Run greeting (Answer LLM) and Suggestions LLM in parallel for a snappy first load.
    const [answer, suggestions] = await Promise.all([
      generateAnswer(convo, intent, 'Greet me and summarize my morning vitals.', null, vitals),
      generateSuggestions(convo, 'general', vitals),
    ]);
    convo.messages.push({ role: 'assistant', content: answer.text });
    res.json({
      conversationId: convo.id,
      greeting: { role: 'assistant', text: answer.text, telemetry: answer.telemetry },
      suggestions,
      vitals,
    });
  } catch (e) {
    console.error('init error', e);
    res.status(500).json({ error: 'init_failed', message: e.message });
  }
});

// --- chat turn: Intent Router -> Answer LLM -> Suggestions LLM ---
app.post('/api/conversations/:id/chat', async (req, res) => {
  try {
    const convo = getConversation(req.params.id);
    if (!convo) return res.status(404).json({ error: 'conversation_not_found' });
    const message = String(req.body?.message ?? '').trim();
    if (!message) return res.status(400).json({ error: 'empty_message' });
    const ocr = req.body?.ocr ?? null;
    const vitals = getVitals();

    convo.messages.push({ role: 'user', content: message });

    const intent = await routeIntent(convo, message);
    convo.lastIntent = intent;

    const answer = await generateAnswer(convo, intent, message, ocr, vitals);
    convo.messages.push({ role: 'assistant', content: answer.text });
    convo.lastAnalysis = answer.analysis ?? null;

    const suggestions = await generateSuggestions(convo, intent, vitals);

    res.json({
      intent: { name: intent.name, confidence: intent.confidence, slots: intent.slots ?? {} },
      reply: { role: 'assistant', text: answer.text, telemetry: answer.telemetry ?? null },
      analysis: answer.analysis ?? null,
      visualization: answer.visualization ?? null,
      suggestions,
    });
  } catch (e) {
    console.error('chat error', e);
    res.status(500).json({ error: 'chat_failed', message: e.message });
  }
});

// --- OCR: image -> parsed labs; merged into live vitals ---
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: 'no_image', message: 'Attach an image in field "image".' });
    const result = await analyzeReport(req.file.buffer);
    ingestLabs(result.values);
    res.json(result);
  } catch (e) {
    console.error('ocr error', e);
    res.status(500).json({ error: 'ocr_failed', message: e.message });
  }
});

app.listen(CONFIG.port, () => {
  console.log(`CuraSync backend on http://localhost:${CONFIG.port}`);
  console.log(`Ollama: ${CONFIG.ollama.host} · model ${CONFIG.ollama.model}`);
  if (CONFIG.ollama.warm) warmup(CONFIG.ollama.model);
});
