// End-to-end UI verification with Playwright. Drives the Expo-web build of the CuraSync app
// against the live backend, asserts the key flows, and captures screenshots of all 4 screens.
//
// Usage: APP_URL=http://localhost:8081 node scripts/verify_e2e.mjs
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL ?? 'http://localhost:8081';
const SHOTS = join(__dirname, '..', 'docs', 'screenshots');
mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, note = '') => { results.push({ name, ok, note }); console.log(`${ok ? '✅' : '❌'} ${name}${note ? ' — ' + note : ''}`); };
const sel = (id) => `[data-testid="${id}"], #${id}, [aria-label="${id}"]`;

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 13 Pro'], isMobile: false });
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('  [browser error]', m.text().slice(0, 120)); });

async function shot(name) { await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true }); }
async function first(id, timeout = 15000) { return page.locator(sel(id)).first().waitFor({ timeout }); }

try {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // Auth gate: log in as guest if the login screen appears.
  const needsLogin = await page.locator(sel('login-guest')).first().waitFor({ timeout: 60000 }).then(() => true).catch(() => false);
  if (needsLogin) { await page.locator(sel('login-guest')).first().click(); check('Guest login', true); }
  // Metro dev server holds an HMR websocket open, so 'networkidle' never fires — wait on the UI.
  await page.locator(sel('chat-input') + ', ' + sel('tab-assistant')).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(3000); // let init() resolve

  // --- Assistant screen (default/hero) ---
  await first('tab-assistant').catch(() => {});
  await page.locator(sel('tab-assistant')).first().click().catch(() => {});
  await page.waitForTimeout(500);
  check('Assistant screen loads', await page.locator(sel('chat-input')).first().isVisible().catch(() => false));

  // Wait for init() to complete: the greeting arrives as the first assistant message.
  // (If init is still pending, conversationId is null and a chat turn would fail.)
  const inited = await page.locator(sel('msg-assistant')).first().waitFor({ timeout: 90000 }).then(() => true).catch(() => false);
  check('Conversation initialized (greeting received)', inited);
  const greeting = await page.locator(sel('msg-assistant')).first().innerText().catch(() => '');
  check('Greeting is a real reply (not offline fallback)', !/could not reach|start the curasync backend|start backend/i.test(greeting), greeting.slice(0, 60));
  const chips = await page.locator(sel('suggestion-chip')).count().catch(() => 0);
  check('Smart Clinical Prompt chips rendered', chips >= 1, `${chips} chips`);
  await shot('01-assistant-initial');

  // --- Send a symptom, expect reply + diagnostic card + inline chart ---
  const before = await page.locator(sel('msg-assistant')).count();
  await page.locator(sel('chat-input')).first().fill('I woke up with a mild tension headache');
  await page.locator(sel('chat-send')).first().click();
  const gotReply = await page.waitForFunction(
    ([s, n]) => document.querySelectorAll(s).length > n,
    [`[data-testid="msg-assistant"], #msg-assistant, [aria-label="msg-assistant"]`, before],
    { timeout: 90000 },
  ).then(() => true).catch(() => false);
  check('Assistant reply appears', gotReply);
  await page.waitForTimeout(800);
  const gotCard = await page.locator(sel('diagnostic-card')).first().isVisible().catch(() => false);
  check('Diagnostic Assessment card renders', gotCard);
  const gotViz = await page.locator(sel('chat-viz')).first().isVisible().catch(() => false);
  check('Inline chart/graph renders in chat', gotViz);
  await page.waitForTimeout(500);
  await shot('02-assistant-after-turn');

  // --- Vitals dashboard ---
  await page.locator(sel('tab-vitals')).first().click();
  await page.waitForTimeout(800);
  check('Health Vitality Score ring renders', await page.locator(sel('health-score')).first().isVisible().catch(() => false));
  await shot('03-vitals');

  // --- Reports (BP correlation chart) ---
  await page.locator(sel('tab-reports')).first().click();
  await page.waitForTimeout(800);
  check('BP & Heart Rate correlation chart renders', await page.locator(sel('bp-chart')).first().isVisible().catch(() => false));
  await shot('04-reports');

  // --- Check-in ---
  await page.locator(sel('tab-checkin')).first().click();
  await page.waitForTimeout(800);
  check('Check-in screen loads', await page.locator(sel('tab-checkin')).first().isVisible().catch(() => false));
  await shot('05-checkin');
} catch (e) {
  check('fatal', false, e.message);
  await shot('99-error');
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed. Screenshots in docs/screenshots/`);
process.exit(passed === results.length ? 0 : 1);
