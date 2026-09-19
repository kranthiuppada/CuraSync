// Generates several realistic lab-report PNGs into ~/Downloads/curasync_sample_reports/
// for manual OCR-upload testing. Uses only lab names the backend parser recognizes.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const OUT = join(homedir(), 'Downloads', 'curasync_sample_reports');
mkdirSync(OUT, { recursive: true });

// Each report: { file, lab, patient, collected, rows: [[test, result, unit, ref]] }
const REPORTS = [
  {
    file: '1_comprehensive_blood_panel.png',
    lab: 'MetroCare Diagnostics', patient: 'Elena R.  ·  34/F', collected: '18 Oct 2025',
    title: 'Comprehensive Blood Panel',
    rows: [
      ['Hemoglobin', '11.2', 'g/dL', '13.0 - 17.0'],
      ['WBC', '7.4', 'x10^3/uL', '4.0 - 11.0'],
      ['Platelets', '265', 'x10^3/uL', '150 - 410'],
      ['Fasting Glucose', '112', 'mg/dL', '70 - 100'],
      ['HbA1c', '6.1', '%', '4.0 - 5.7'],
      ['Total Cholesterol', '214', 'mg/dL', '0 - 200'],
      ['LDL Cholesterol', '142', 'mg/dL', '0 - 100'],
      ['HDL Cholesterol', '48', 'mg/dL', '40 - 60'],
      ['Triglycerides', '168', 'mg/dL', '0 - 150'],
      ['Vitamin D', '22', 'ng/mL', '30 - 100'],
      ['Creatinine', '0.9', 'mg/dL', '0.6 - 1.3'],
    ],
  },
  {
    file: '2_lipid_profile_high_risk.png',
    lab: 'CardioLab Reference', patient: 'Rahul M.  ·  47/M', collected: '02 Nov 2025',
    title: 'Lipid Profile — Cardiovascular Risk',
    rows: [
      ['Total Cholesterol', '262', 'mg/dL', '0 - 200'],
      ['LDL Cholesterol', '178', 'mg/dL', '0 - 100'],
      ['HDL Cholesterol', '34', 'mg/dL', '40 - 60'],
      ['Triglycerides', '240', 'mg/dL', '0 - 150'],
      ['Fasting Glucose', '96', 'mg/dL', '70 - 100'],
      ['Creatinine', '1.0', 'mg/dL', '0.6 - 1.3'],
    ],
  },
  {
    file: '3_diabetes_panel.png',
    lab: 'Sugarline Labs', patient: 'Priya S.  ·  52/F', collected: '10 Nov 2025',
    title: 'Diabetes Monitoring Panel',
    rows: [
      ['Fasting Glucose', '148', 'mg/dL', '70 - 100'],
      ['HbA1c', '7.8', '%', '4.0 - 5.7'],
      ['Total Cholesterol', '196', 'mg/dL', '0 - 200'],
      ['Triglycerides', '182', 'mg/dL', '0 - 150'],
      ['HDL Cholesterol', '52', 'mg/dL', '40 - 60'],
      ['Creatinine', '1.1', 'mg/dL', '0.6 - 1.3'],
    ],
  },
  {
    file: '4_wellness_all_normal.png',
    lab: 'VitaCheck Wellness', patient: 'Arjun K.  ·  29/M', collected: '15 Nov 2025',
    title: 'Annual Wellness Panel',
    rows: [
      ['Hemoglobin', '15.1', 'g/dL', '13.0 - 17.0'],
      ['WBC', '6.2', 'x10^3/uL', '4.0 - 11.0'],
      ['Platelets', '248', 'x10^3/uL', '150 - 410'],
      ['Fasting Glucose', '88', 'mg/dL', '70 - 100'],
      ['HbA1c', '5.2', '%', '4.0 - 5.7'],
      ['Total Cholesterol', '176', 'mg/dL', '0 - 200'],
      ['LDL Cholesterol', '92', 'mg/dL', '0 - 100'],
      ['HDL Cholesterol', '58', 'mg/dL', '40 - 60'],
      ['Vitamin D', '44', 'ng/mL', '30 - 100'],
      ['TSH', '2.0', 'mIU/L', '0.4 - 4.0'],
    ],
  },
  {
    file: '5_thyroid_and_vitamins.png',
    lab: 'Endolab Diagnostics', patient: 'Meera J.  ·  38/F', collected: '20 Nov 2025',
    title: 'Thyroid & Vitamin Panel',
    rows: [
      ['TSH', '6.4', 'mIU/L', '0.4 - 4.0'],
      ['Vitamin D', '18', 'ng/mL', '30 - 100'],
      ['Vitamin B12', '160', 'pg/mL', '200 - 900'],
      ['Hemoglobin', '11.8', 'g/dL', '13.0 - 17.0'],
      ['Fasting Glucose', '94', 'mg/dL', '70 - 100'],
    ],
  },
];

function html(r) {
  const rows = r.rows.map(([t, v, u, ref], i) => `
    <tr style="border-bottom:1px solid #d7dde5;background:${i % 2 ? '#f7f9fc' : '#fff'}">
      <td style="padding:12px 14px;font-weight:600;color:#111">${t}</td>
      <td style="padding:12px 14px;color:#111">${v}</td>
      <td style="padding:12px 14px;color:#555">${u}</td>
      <td style="padding:12px 14px;color:#555">${ref}</td>
    </tr>`).join('');
  return `<div style="width:780px;padding:44px;font-family:Arial,Helvetica,sans-serif;background:#fff">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0d9488;padding-bottom:14px;margin-bottom:8px">
      <div><div style="font-size:22px;font-weight:700;color:#0d9488">${r.lab}</div>
      <div style="font-size:15px;color:#666;margin-top:2px">Accredited Clinical Laboratory · NABL</div></div>
      <div style="font-size:13px;color:#888;text-align:right">Report ID: LR-${Math.floor(Math.random() * 900000 + 100000)}<br>Page 1 of 1</div>
    </div>
    <h1 style="font-size:25px;margin:14px 0 6px;color:#111">${r.title}</h1>
    <p style="margin:0 0 18px;color:#555;font-size:15px">Patient: ${r.patient} &nbsp;·&nbsp; Collected: ${r.collected} &nbsp;·&nbsp; Specimen: Whole Blood (Fasting)</p>
    <table style="width:100%;border-collapse:collapse;font-size:17px;border:1px solid #d7dde5">
      <thead><tr style="background:#e8f5f3;border-bottom:2px solid #0d9488">
        <th style="text-align:left;padding:12px 14px;color:#0d6b60">Test</th>
        <th style="text-align:left;padding:12px 14px;color:#0d6b60">Result</th>
        <th style="text-align:left;padding:12px 14px;color:#0d6b60">Units</th>
        <th style="text-align:left;padding:12px 14px;color:#0d6b60">Reference Range</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:26px;color:#888;font-size:13px">Electronically verified by Dr. A. Nair, MD (Pathology). For clinical correlation only. Reference ranges may vary by laboratory.</p>
  </div>`;
}

const browser = await chromium.launch();
for (const r of REPORTS) {
  const page = await browser.newPage({ viewport: { width: 860, height: 1000 }, deviceScaleFactor: 2 });
  await page.setContent(html(r), { waitUntil: 'networkidle' });
  const el = await page.$('div');
  await el.screenshot({ path: join(OUT, r.file) });
  await page.close();
  console.log('wrote', r.file);
}
await browser.close();
console.log('\nAll reports in:', OUT);
