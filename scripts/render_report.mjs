// Render sample_report.html -> sample_report.png for OCR testing / demo upload.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'sample_report.html'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 840, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
const el = await page.$('div');
await el.screenshot({ path: join(__dirname, 'sample_report.png') });
await browser.close();
console.log('wrote sample_report.png');
