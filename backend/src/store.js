// In-memory state. Single-process demo store: conversations + the live vitals snapshot.
import { randomBytes } from 'node:crypto';
import { makeSeedVitals } from './data/seed.js';

const conversations = new Map();
let vitals = makeSeedVitals();

export function getVitals() {
  return vitals;
}

/** Merge OCR labs into the live vitals snapshot so dashboards/reports reflect the upload. */
export function ingestLabs(labs) {
  if (!labs?.length) return;
  const byName = new Map(vitals.labs.map((l) => [l.name, l]));
  for (const l of labs) byName.set(l.name, l);
  vitals.labs = [...byName.values()];
}

export function createConversation(patient) {
  const id = 'c_' + randomBytes(4).toString('hex');
  const convo = {
    id,
    patient: { name: patient?.name ?? 'Elena', age: patient?.age ?? 34 },
    messages: [], // { role, content }
    lastIntent: null,
    lastAnalysis: null,
    createdAt: Date.now(),
  };
  conversations.set(id, convo);
  return convo;
}

export function getConversation(id) {
  return conversations.get(id);
}

/** Compact history for the LLM context (last N turns). */
export function historyFor(convo, n = 8) {
  return convo.messages.slice(-n).map((m) => ({ role: m.role, content: m.content }));
}
