// OCR + lab-value parsing. Tesseract.js runs fully local (no cloud).
import { createWorker } from 'tesseract.js';

let _workerPromise = null;
async function getWorker() {
  if (!_workerPromise) _workerPromise = createWorker('eng');
  return _workerPromise;
}

/** Run OCR on an image buffer, return raw text. */
export async function runOCR(buffer) {
  const worker = await getWorker();
  const { data } = await worker.recognize(buffer);
  return data.text ?? '';
}

// Common lab reference ranges (adult). Aliases map many report spellings to one canonical lab.
const LAB_DEFS = [
  { name: 'Hemoglobin', aliases: ['hemoglobin', 'haemoglobin', 'hgb', 'hb'], unit: 'g/dL', refLow: 13.0, refHigh: 17.0 },
  { name: 'WBC', aliases: ['wbc', 'white blood cell', 'leukocyte', 'total leucocyte', 'tlc'], unit: 'x10^3/uL', refLow: 4.0, refHigh: 11.0 },
  { name: 'Platelets', aliases: ['platelet', 'plt'], unit: 'x10^3/uL', refLow: 150, refHigh: 410 },
  { name: 'Fasting Glucose', aliases: ['fasting glucose', 'fasting blood sugar', 'glucose fasting', 'fbs', 'glucose'], unit: 'mg/dL', refLow: 70, refHigh: 100 },
  { name: 'HbA1c', aliases: ['hba1c', 'a1c', 'glycated', 'glycosylated'], unit: '%', refLow: 4.0, refHigh: 5.7 },
  { name: 'Total Cholesterol', aliases: ['total cholesterol', 'cholesterol total', 'cholesterol'], unit: 'mg/dL', refLow: 0, refHigh: 200 },
  { name: 'LDL', aliases: ['ldl', 'ldl cholesterol'], unit: 'mg/dL', refLow: 0, refHigh: 100 },
  { name: 'HDL', aliases: ['hdl', 'hdl cholesterol'], unit: 'mg/dL', refLow: 40, refHigh: 60 },
  { name: 'Triglycerides', aliases: ['triglyceride', 'tg'], unit: 'mg/dL', refLow: 0, refHigh: 150 },
  { name: 'Creatinine', aliases: ['creatinine'], unit: 'mg/dL', refLow: 0.6, refHigh: 1.3 },
  { name: 'TSH', aliases: ['tsh', 'thyroid stimulating'], unit: 'mIU/L', refLow: 0.4, refHigh: 4.0 },
  { name: 'Vitamin D', aliases: ['vitamin d', '25-hydroxy', '25 hydroxy', 'vit d'], unit: 'ng/mL', refLow: 30, refHigh: 100 },
  { name: 'Vitamin B12', aliases: ['b12', 'vitamin b12', 'cobalamin'], unit: 'pg/mL', refLow: 200, refHigh: 900 },
];

function flagFor(value, refLow, refHigh) {
  if (value < refLow) return 'low';
  if (value > refHigh) return 'high';
  return 'normal';
}

/**
 * Parse lab values out of OCR text. Line-oriented: for each known lab alias found on a line,
 * grab the first plausible number on that line.
 */
export function parseLabs(rawText) {
  const lines = rawText.split(/\r?\n/);
  const found = new Map(); // canonical name -> lab

  for (const rawLine of lines) {
    const line = rawLine.toLowerCase();
    for (const def of LAB_DEFS) {
      if (found.has(def.name)) continue;
      // Word-boundary match so short aliases (hb/hgb/tg/a1c) don't match inside another
      // token — e.g. "hb" must not match inside "hba1c".
      // `s?` tolerates plurals (platelets/triglycerides); trailing \b stops "hb" from
      // matching inside "hba1c".
      const hit = def.aliases
        .map((a) => ({ a, m: line.match(new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`)) }))
        .find((x) => x.m);
      if (!hit) continue;
      const alias = hit.a;
      // First number after the alias position (fallback: first number on line).
      const after = line.slice(hit.m.index + alias.length);
      const num = (after.match(/(\d+(?:\.\d+)?)/) || line.match(/(\d+(?:\.\d+)?)/) || [])[1];
      if (num == null) continue;
      const value = Number(num);
      if (!Number.isFinite(value)) continue;
      found.set(def.name, {
        name: def.name, value, unit: def.unit,
        refLow: def.refLow, refHigh: def.refHigh,
        flag: flagFor(value, def.refLow, def.refHigh),
      });
    }
  }

  return [...found.values()];
}

/** Full pipeline: image buffer -> { rawText, values, summary }. */
export async function analyzeReport(buffer) {
  const rawText = await runOCR(buffer);
  const values = parseLabs(rawText);
  const flagged = values.filter((v) => v.flag !== 'normal').length;
  return { rawText, values, summary: { total: values.length, flagged } };
}
