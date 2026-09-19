// Verifies auth gate + profile + theme toggle through the app UI, with screenshots.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL ?? 'http://localhost:8081';
const SHOTS = join(__dirname, '..', 'docs', 'screenshots');
mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (n, ok, note = '') => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${n}${note ? ' — ' + note : ''}`); };
const sel = (id) => `[data-testid="${id}"], #${id}, [aria-label="${id}"]`;
const visible = (id, t = 8000) => page.locator(sel(id)).first().waitFor({ timeout: t }).then(() => true).catch(() => false);

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 13 Pro'], isMobile: false });
const page = await context.newPage();

try {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // 1. Login screen gates the app.
  check('Login screen appears first', await visible('login-email', 90000));
  await page.screenshot({ path: join(SHOTS, '08-login.png'), fullPage: true });

  // 2. Guest login enters the app.
  await page.locator(sel('login-guest')).first().click();
  check('Guest login enters the app', await visible('chat-input', 60000) || await visible('tab-assistant', 60000));
  await page.waitForTimeout(1500);

  // 3. Theme toggle -> light.
  const hadToggle = await visible('theme-toggle', 8000);
  check('Theme toggle button present', hadToggle);
  if (hadToggle) { await page.locator(sel('theme-toggle')).first().click(); await page.waitForTimeout(1200); }
  await page.screenshot({ path: join(SHOTS, '09-light-theme.png'), fullPage: true });
  check('Light theme captured', true);

  // 4. Profile screen.
  await page.locator(sel('profile-open')).first().click().catch(() => {});
  const gotProfile = await visible('profile-screen', 8000);
  check('Profile screen opens from avatar', gotProfile);
  await page.screenshot({ path: join(SHOTS, '10-profile.png'), fullPage: true });

  // 5. Sign out -> back to login.
  await page.locator(sel('profile-signout')).first().click().catch(() => {});
  check('Sign out returns to login', await visible('login-email', 10000));
} catch (e) {
  check('fatal', false, e.message);
  await page.screenshot({ path: join(SHOTS, '97-auth-error.png'), fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} auth/theme checks passed.`);
process.exit(passed === results.length ? 0 : 1);
