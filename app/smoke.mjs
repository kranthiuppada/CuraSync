import { chromium } from 'playwright';

const URL = process.env.SMOKE_URL || 'http://localhost:4599/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const ids = ['tab-vitals', 'tab-assistant', 'tab-checkin', 'tab-reports',
  'chat-input', 'chat-send', 'msg-assistant'];
const found = {};
for (const id of ids) found[id] = await page.locator(`[data-testid="${id}"]`).count();

// Navigate each tab and confirm signature elements render.
async function tab(name, checkId) {
  await page.locator(`[data-testid="tab-${name}"]`).first().click();
  await page.waitForTimeout(600);
  return page.locator(`[data-testid="${checkId}"]`).count();
}
const vitals = await tab('vitals', 'health-score');
const reports = await tab('reports', 'bp-chart');
const checkin = await tab('checkin', 'complete-checkin');

console.log('TESTID COUNTS:', JSON.stringify(found));
console.log('vitals health-score:', vitals, '| reports bp-chart:', reports, '| checkin complete:', checkin);
console.log('PAGE ERRORS:', errors.length ? errors.slice(0, 8) : 'none');

await page.locator('[data-testid="tab-vitals"]').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'smoke-vitals.png', fullPage: true });
await page.locator('[data-testid="tab-reports"]').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'smoke-reports.png', fullPage: true });

await browser.close();
const ok = Object.values(found).every((n) => n > 0) && vitals > 0 && reports > 0 && checkin > 0 && errors.length === 0;
console.log(ok ? 'SMOKE: PASS' : 'SMOKE: FAIL');
process.exit(ok ? 0 : 1);
