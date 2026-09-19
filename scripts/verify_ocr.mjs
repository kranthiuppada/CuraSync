// Verifies the hero OCR flow THROUGH THE APP UI: attach a lab report image via the chat
// composer -> backend OCR -> auto-sent analysis turn -> range chart in chat + labs on Reports.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL ?? 'http://localhost:8081';
const SHOTS = join(__dirname, '..', 'docs', 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const REPORT = join(__dirname, 'sample_report.png');

const results = [];
const check = (n, ok, note = '') => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${n}${note ? ' — ' + note : ''}`); };
const sel = (id) => `[data-testid="${id}"], #${id}, [aria-label="${id}"]`;

const browser = await chromium.launch();
const page = await (await browser.newContext({ ...devices['iPhone 13 Pro'], isMobile: false, acceptDownloads: true })).newPage();

try {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // Auth gate: log in as guest if the login screen appears.
  const needsLogin = await page.locator(sel('login-guest')).first().waitFor({ timeout: 60000 }).then(() => true).catch(() => false);
  if (needsLogin) await page.locator(sel('login-guest')).first().click();
  await page.locator(sel('tab-assistant')).first().waitFor({ timeout: 120000 });
  await page.locator(sel('tab-assistant')).first().click().catch(() => {});
  // Wait for init (greeting) so a chat turn can be sent.
  await page.locator(sel('msg-assistant')).first().waitFor({ timeout: 90000 });
  const before = await page.locator(sel('msg-assistant')).count();

  // Attach the report — expo-image-picker on web opens a file chooser.
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 15000 }),
    page.locator(sel('chat-attach')).first().click(),
  ]);
  await chooser.setFiles(REPORT);
  check('File chooser accepted the report image', true);

  // Backend OCR + auto analysis turn -> a new assistant message appears.
  const newMsg = await page.waitForFunction(
    ([s, n]) => document.querySelectorAll(s).length > n,
    [`[data-testid="msg-assistant"], #msg-assistant, [aria-label="msg-assistant"]`, before],
    { timeout: 120000 },
  ).then(() => true).catch(() => false);
  check('OCR analysis reply appears in chat', newMsg);
  await page.waitForTimeout(1500);
  check('Range chart (labs vs reference) renders in chat', await page.locator(sel('chat-viz')).first().isVisible().catch(() => false));
  await page.screenshot({ path: join(SHOTS, '06-ocr-analysis.png'), fullPage: true });

  // Uploaded document is shown as an openable attachment.
  check('Uploaded document appears as an attachment', await page.locator(sel('chat-attachment')).first().isVisible().catch(() => false));
  await page.locator(sel('chat-attachment')).first().click().catch(() => {});
  await page.waitForTimeout(600);
  const opened = await page.locator(sel('preview-close')).first().isVisible().catch(() => false);
  check('Tapping the attachment opens a document preview', opened);
  await page.screenshot({ path: join(SHOTS, '11-doc-preview.png'), fullPage: true });
  if (opened) await page.locator(sel('preview-close')).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // New chat resets the thread.
  await page.locator(sel('new-chat')).first().click().catch(() => {});
  const reset = await page.waitForFunction(
    (s) => document.querySelectorAll(s).length === 0,
    `[data-testid="chat-attachment"], #chat-attachment`,
    { timeout: 60000 },
  ).then(() => true).catch(() => false);
  check('New chat clears the conversation', reset);

  // Labs should now surface on the Reports screen.
  await page.locator(sel('tab-reports')).first().click();
  await page.waitForTimeout(1200);
  check('OCR lab results section renders on Reports', await page.locator(sel('lab-results')).first().isVisible().catch(() => false));
  await page.screenshot({ path: join(SHOTS, '07-reports-labs.png'), fullPage: true });
} catch (e) {
  check('fatal', false, e.message);
  await page.screenshot({ path: join(SHOTS, '98-ocr-error.png'), fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} OCR-flow checks passed.`);
process.exit(passed === results.length ? 0 : 1);
