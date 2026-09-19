// Orchestrates the 3 LLM roles. Every call tries Ollama, falls back deterministically on failure.
import { CONFIG } from '../config.js';
import { chatJSON, ollamaUp } from './ollama.js';
import { ROUTER_SYSTEM, ANSWER_SYSTEM, SUGGEST_SYSTEM } from './prompts.js';
import { routerFallback, answerFallback, suggestFallback } from './fallbacks.js';
import { historyFor } from '../store.js';

const { routerModel, answerModel, suggestModel } = CONFIG.ollama;

function log(role, ok, ms, note = '') {
  console.log(`[llm:${role}] ${ok ? 'ollama' : 'FALLBACK'} ${ms}ms ${note}`);
}

/** LLM #1 — intent router. */
export async function routeIntent(convo, message) {
  const t = Date.now();
  const up = await ollamaUp();
  if (!up.ok) { log('router', false, Date.now() - t, 'ollama down'); return { ...routerFallback(message), _source: 'fallback' }; }
  try {
    const out = await chatJSON({
      model: routerModel, system: ROUTER_SYSTEM, temperature: 0.1, numPredict: 120,
      messages: [...historyFor(convo, 4), { role: 'user', content: message }],
    });
    const name = String(out.name ?? '').toLowerCase();
    const valid = ['symptom_report', 'report_analysis', 'vitals_query', 'lifestyle_action', 'general', 'emergency'];
    if (!valid.includes(name)) throw new Error(`bad intent: ${name}`);
    log('router', true, Date.now() - t, name);
    return { name, confidence: Number(out.confidence) || 0.6, slots: out.slots ?? {}, _source: 'ollama' };
  } catch (e) {
    log('router', false, Date.now() - t, e.message);
    return { ...routerFallback(message), _source: 'fallback' };
  }
}

/** LLM #2 — answer + analysis + visualization. */
export async function generateAnswer(convo, intent, message, ocr, vitals) {
  const t = Date.now();
  const up = await ollamaUp();
  const context = buildAnswerContext(convo, intent, ocr, vitals);
  if (!up.ok) { log('answer', false, Date.now() - t, 'ollama down'); return { ...answerFallback(intent.name, vitals, ocr), _source: 'fallback' }; }
  try {
    const out = await chatJSON({
      model: answerModel, system: ANSWER_SYSTEM, temperature: 0.5, numPredict: 420,
      messages: [
        { role: 'system', content: context },
        ...historyFor(convo, 6),
        { role: 'user', content: message },
      ],
    });
    if (typeof out.text !== 'string' || !out.text.trim()) throw new Error('empty text');
    // Clinical intents must always land a Diagnostic Assessment + a chart. Small models
    // sometimes omit them — backfill from the deterministic generator so the demo is bulletproof.
    const clinical = intent.name === 'symptom_report' || intent.name === 'report_analysis';
    const fb = clinical ? answerFallback(intent.name, vitals, ocr) : null;
    let analysis = out.analysis ?? null;
    let visualization = normalizeViz(out.visualization);
    if (clinical && !analysis) analysis = fb.analysis;
    if (clinical && !visualization) visualization = fb.visualization;
    // Never trust the small model's lab numbers: for report analysis, always plot the
    // real parsed OCR values against their correct reference bands (grounded truth).
    if (intent.name === 'report_analysis' && ocr?.values?.length) visualization = fb.visualization;
    log('answer', true, Date.now() - t, `${intent.name}${analysis ? ' +card' : ''}${visualization ? ' +viz' : ''}`);
    return {
      text: out.text.trim(),
      telemetry: out.telemetry ?? null,
      analysis,
      visualization,
      _source: 'ollama',
    };
  } catch (e) {
    log('answer', false, Date.now() - t, e.message);
    return { ...answerFallback(intent.name, vitals, ocr), _source: 'fallback' };
  }
}

/** LLM #3 — suggestions. Called on init and after every turn. */
export async function generateSuggestions(convo, intent, vitals) {
  const t = Date.now();
  const up = await ollamaUp();
  const intentName = typeof intent === 'string' ? intent : intent?.name ?? 'general';
  if (!up.ok) { log('suggest', false, Date.now() - t, 'ollama down'); return withIds(suggestFallback(intentName)); }
  try {
    const summary = `Intent: ${intentName}. Vitals: HR ${vitals?.cards?.find((c) => c.key === 'hr')?.value} BPM, BP ${vitals?.cards?.find((c) => c.key === 'bp')?.value}. Labs on file: ${vitals?.labs?.length ?? 0}.`;
    const out = await chatJSON({
      model: suggestModel, system: SUGGEST_SYSTEM, temperature: 0.6, numPredict: 200,
      messages: [{ role: 'system', content: summary }, ...historyFor(convo, 4), { role: 'user', content: 'Propose next-step chips.' }],
    });
    let items = Array.isArray(out.suggestions) ? out.suggestions : [];
    items = items.filter((s) => s && typeof s.label === 'string').slice(0, 4)
      .map((s) => ({ label: s.label.slice(0, 28), icon: s.icon ?? 'chart' }));
    if (items.length < 2) throw new Error('too few suggestions');
    log('suggest', true, Date.now() - t, `${items.length} chips`);
    return withIds(items);
  } catch (e) {
    log('suggest', false, Date.now() - t, e.message);
    return withIds(suggestFallback(intentName));
  }
}

// --- helpers ---
let _sid = 0;
function withIds(items) { return items.map((s) => ({ id: 's' + ++_sid, ...s })); }

function buildAnswerContext(convo, intent, ocr, vitals) {
  const hr = vitals?.cards?.find((c) => c.key === 'hr');
  const bp = vitals?.cards?.find((c) => c.key === 'bp');
  const glu = vitals?.cards?.find((c) => c.key === 'glucose');
  const spo2 = vitals?.cards?.find((c) => c.key === 'spo2');
  const lines = [
    `PATIENT: ${convo.patient.name}, age ${convo.patient.age}.`,
    `ROUTED INTENT: ${intent.name} (confidence ${intent.confidence}). Slots: ${JSON.stringify(intent.slots ?? {})}.`,
    `VITALS: HR ${hr?.value} BPM (${hr?.status}); BP ${bp?.value} mmHg (${bp?.status}); Glucose ${glu?.value} ${glu?.unit} (${glu?.status}); SpO2 ${spo2?.value}% (${spo2?.status}).`,
    `SLEEP: ${vitals?.sleep?.duration}, ${vitals?.sleep?.efficiency}% efficiency. Health score ${vitals?.healthScore?.value}/100.`,
  ];
  if (ocr?.values?.length) {
    lines.push('UPLOADED LAB VALUES:');
    for (const v of ocr.values) lines.push(`  - ${v.name}: ${v.value} ${v.unit} (ref ${v.refLow}-${v.refHigh}) => ${v.flag}`);
  }
  return lines.join('\n');
}

/** Defensive normalization of the visualization spec from the LLM. */
function normalizeViz(viz) {
  if (!viz || typeof viz !== 'object') return null;
  const type = ['line', 'bar', 'gauge', 'range'].includes(viz.type) ? viz.type : null;
  if (!type) return null;
  let series = Array.isArray(viz.series) ? viz.series : [];
  series = series.map((s) => ({
    name: String(s?.name ?? ''),
    color: typeof s?.color === 'string' ? s.color : '#38BDF8',
    points: Array.isArray(s?.points) ? s.points.filter((p) => p && Number.isFinite(Number(p.y))).map((p) => ({ x: String(p.x ?? ''), y: Number(p.y) })) : [],
  })).filter((s) => s.points.length);
  if (!series.length) return null;
  return {
    type,
    title: String(viz.title ?? 'Chart'),
    caption: String(viz.caption ?? ''),
    unit: String(viz.unit ?? ''),
    series,
    target: Number.isFinite(Number(viz.target)) ? Number(viz.target) : null,
    bands: Array.isArray(viz.bands) ? viz.bands.filter((b) => b && Number.isFinite(Number(b.low)) && Number.isFinite(Number(b.high))).map((b) => ({ label: String(b.label ?? ''), low: Number(b.low), high: Number(b.high) })) : null,
  };
}
