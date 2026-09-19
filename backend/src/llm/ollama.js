// Thin Ollama client. Uses Node 22 built-in fetch. All 3 LLM roles go through here.
import { CONFIG } from '../config.js';

const { host, timeoutMs } = CONFIG.ollama;

let _availabilityCache = { at: 0, ok: false, model: null };

export async function ollamaUp() {
  // Cache availability for 10s to avoid hammering.
  if (Date.now() - _availabilityCache.at < 10000) return _availabilityCache;
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const models = (data.models ?? []).map((m) => m.name);
    const ok = res.ok;
    _availabilityCache = { at: Date.now(), ok, model: models[0] ?? null, models };
  } catch {
    _availabilityCache = { at: Date.now(), ok: false, model: null, models: [] };
  }
  return _availabilityCache;
}

/**
 * Call an Ollama chat completion and return parsed JSON.
 * @param {object} opts
 * @param {string} opts.model
 * @param {string} opts.system - system prompt
 * @param {Array<{role:string,content:string}>} opts.messages - conversation turns
 * @param {number} [opts.temperature]
 * @returns {Promise<object>} parsed JSON object (throws on failure/timeout/parse-error)
 */
export async function chatJSON({ model, system, messages, temperature = 0.4, numPredict = CONFIG.ollama.numPredict }) {
  const body = {
    model,
    format: 'json', // force structured output
    stream: false,
    keep_alive: '30m', // keep the model resident between turns
    options: { temperature, num_ctx: 4096, num_predict: numPredict },
    messages: [{ role: 'system', content: system }, ...messages],
  };

  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.message?.content ?? '';
  return safeParseJSON(content);
}

/** Preload the model into memory so the first real request isn't a cold start. */
export async function warmup(model = CONFIG.ollama.model) {
  try {
    const t = Date.now();
    await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: 'ok', stream: false, keep_alive: '30m', options: { num_predict: 1 } }),
      signal: AbortSignal.timeout(60000),
    });
    console.log(`[ollama] warmed ${model} in ${Date.now() - t}ms`);
  } catch (e) {
    console.log(`[ollama] warmup skipped: ${e.message}`);
  }
}

/** Parse JSON defensively — models sometimes wrap in prose or code fences. */
export function safeParseJSON(text) {
  if (typeof text !== 'string') throw new Error('LLM returned non-string content');
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Strip code fences and grab the outermost {...} or [...].
    const noFence = trimmed.replace(/```json\s*|\s*```/g, '');
    const objMatch = noFence.match(/[{\[][\s\S]*[}\]]/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error(`Could not parse JSON from LLM output: ${trimmed.slice(0, 160)}`);
  }
}
