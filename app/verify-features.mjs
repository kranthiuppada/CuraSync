import { chromium } from 'playwright';

const URL = process.env.SMOKE_URL || 'http://localhost:4599/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

const results = {};
const show = (k, v) => { results[k] = v; console.log(`${k}: ${v}`); };

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1. Login screen gates the app
await page.waitForSelector('[data-testid="login-email"]', { timeout: 15000 });
show('login-gate', (await page.locator('[data-testid="login-submit"]').count()) > 0);
await page.screenshot({ path: 'v-login-dark.png' });

// theme toggle on login → light
await page.locator('[data-testid="theme-toggle"]').first().click();
await page.waitForTimeout(400);
const loginThemeStored = await page.evaluate(() => localStorage.getItem('curasync.theme'));
show('login-toggle-light', loginThemeStored === 'light');
await page.screenshot({ path: 'v-login-light.png' });
// back to dark for the app run
await page.locator('[data-testid="theme-toggle"]').first().click();
await page.waitForTimeout(300);

// 2. Guest login enters the app
await page.locator('[data-testid="login-guest"]').first().click();
await page.waitForSelector('[data-testid="tab-assistant"]', { timeout: 20000 });
const tokenStored = await page.evaluate(() => !!localStorage.getItem('curasync.token'));
show('guest-login-enters-app', (await page.locator('[data-testid="tab-vitals"]').count()) > 0);
show('token-persisted', tokenStored);
await page.locator('[data-testid="tab-vitals"]').first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'v-app-dark.png', fullPage: true });

// helper: computed bg of the tab bar container (parent of tab-assistant)
const tabBg = () => page.evaluate(() => {
  const el = document.querySelector('[data-testid="tab-assistant"]');
  let n = el; for (let i = 0; i < 3 && n; i++) n = n.parentElement;
  return getComputedStyle(n).backgroundColor;
});
const darkBg = await tabBg();

// 3. Toggle to light theme in-app + screenshot
await page.locator('[data-testid="theme-toggle"]').first().click();
await page.waitForTimeout(500);
const lightBg = await tabBg();
const lightStored = await page.evaluate(() => localStorage.getItem('curasync.theme'));
show('app-toggle-light-state', lightStored === 'light');
show('app-bg-actually-changed', darkBg !== lightBg);
// light canvas #F4F7FB → all channels bright; dark canvas #090D16 → all channels dark
const chans = (s) => (s.match(/\d+/g) || []).map(Number).slice(0, 3);
show('light-bg-is-bright', chans(lightBg).every((c) => c > 200));
show('dark-bg-is-dark', chans(darkBg).every((c) => c < 60));
console.log('   darkBg=', darkBg, ' lightBg=', lightBg);
await page.screenshot({ path: 'v-app-light.png', fullPage: true });

// 4. Open profile
await page.locator('[data-testid="profile-open"]').first().click();
await page.waitForSelector('[data-testid="profile-screen"]', { timeout: 8000 });
show('profile-opens', (await page.locator('[data-testid="profile-name"]').count()) > 0);
const nameVal = await page.locator('[data-testid="profile-name"]').first().inputValue().catch(() => '');
console.log('   profile name field =', JSON.stringify(nameVal));
await page.screenshot({ path: 'v-profile-light.png', fullPage: true });

// edit + save profile
await page.locator('[data-testid="profile-name"]').first().fill('Elena Verified');
await page.locator('[data-testid="profile-save"]').first().click();
await page.waitForTimeout(1200);
show('profile-save-ran', true);

// 5. Sign out returns to login
await page.locator('[data-testid="profile-signout"]').first().click();
await page.waitForSelector('[data-testid="login-email"]', { timeout: 8000 });
const tokenCleared = await page.evaluate(() => !localStorage.getItem('curasync.token'));
show('signout-returns-to-login', (await page.locator('[data-testid="login-submit"]').count()) > 0);
show('token-cleared', tokenCleared);

show('no-page-errors', errors.length === 0);
if (errors.length) console.log('ERRORS:', errors.slice(0, 8));

await browser.close();
const ok = Object.values(results).every(Boolean);
console.log('\nVERIFY:', ok ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
