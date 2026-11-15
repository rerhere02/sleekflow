import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
import { BeforeAll, Before, After, AfterAll } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { getConfig } from '../utils/config';
import { appendCleanupLog, getCleanupEntries, clearCleanupManifest } from '../factories/factory-helpers';
import { TEST_EMAIL } from '../utils/test-constants';
import * as path from 'path';
import * as fs from 'fs';

let sharedBrowser: Browser;

// ── Environment guard ──
Before({ tags: '@staging-only' }, async function (this: PlaywrightWorld) {
  const env = process.env.ENV ?? 'stg';
  if (env === 'prod') {
    this.attach('SKIPPED: @staging-only scenario cannot run against production', 'text/plain');
    return 'skipped' as any;
  }
});

// ── Seed Verification ──
async function verifySeedAccounts(browser: Browser): Promise<void> {
  const config = getConfig();
  const env = process.env.ENV ?? 'stg';
  const requiredVars = ['TEST_EMAIL', 'TEST_PASSWORD'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`[SEED] Missing env vars: ${missing.join(', ')} — using defaults`);
  }
  console.log(`[SEED] Environment: ${env}`);
  console.log(`[SEED] Test account: ${TEST_EMAIL}`);
  console.log(`[SEED] SSO URL: ${config.ssoUrl}`);
}

// ── BeforeAll: launch browser, login-once, verify seeds ──
BeforeAll(async function () {
  clearCleanupManifest();
  const config = getConfig();
  sharedBrowser = await chromium.launch({
    headless: config.headless,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--disable-save-password-bubble',
      '--disable-features=PasswordManagerOnboarding,AutofillServerCommunication,Translate',
    ],
  });

  const authDir = path.resolve('.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // Verify seed accounts are configured
  await verifySeedAccounts(sharedBrowser);

  // Login-once: save auth state if TEST_EMAIL is set and state is stale/missing.
  const authFile = path.resolve(config.authStatePath);
  const needsLogin =
    !fs.existsSync(authFile) ||
    Date.now() - fs.statSync(authFile).mtimeMs > 50 * 60 * 1_000;

  if (needsLogin && process.env.TEST_EMAIL) {
    const ctx = await sharedBrowser.newContext({ baseURL: config.baseUrl });
    const page = await ctx.newPage();
    try {
      console.log('[AUTH] Starting login-once flow...');
      await page.goto(config.baseUrl, { waitUntil: 'commit' });
      await page.waitForURL(
        url => url.toString().includes('sso.sleekflow.io'),
        { timeout: 30_000, waitUntil: 'commit' },
      );
      await page.locator('#username').waitFor({ timeout: 15_000 });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.locator('#username').fill(process.env.TEST_EMAIL);
      await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 15_000 });
      await page.locator('#password').waitFor({ timeout: 10_000 });
      await page.locator('#password').fill(process.env.TEST_PASSWORD ?? '');
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page.waitForURL(
        url => !url.toString().includes('sso.sleekflow.io'),
        { timeout: 30_000, waitUntil: 'commit' },
      );
      await ctx.storageState({ path: authFile });
      console.log('[AUTH] Login-once complete, state saved.');
    } catch (e) {
      console.warn('[AUTH] Login-once failed:', e);
    } finally {
      await page.close().catch(() => {});
      await ctx.close().catch(() => {});
    }
  }
});

// ── Before: create context per scenario ──
Before(async function (this: PlaywrightWorld, scenario) {
  const config = getConfig();
  const tags = scenario.pickle.tags.map(t => t.name);
  const needsAuth = !tags.includes('@no-auth');

  this.browser = sharedBrowser;
  this.context = await sharedBrowser.newContext({
    baseURL: config.baseUrl,
    ignoreHTTPSErrors: true,
    ...(needsAuth && fs.existsSync(path.resolve(config.authStatePath))
      ? { storageState: config.authStatePath }
      : {}),
    viewport: { width: 1280, height: 720 },
  });
  this.page = await this.context.newPage();
  this.scenarioData = {};

  // Mid-run JWT refresh
  if (needsAuth) {
    const authFile = path.resolve(config.authStatePath);
    if (
      fs.existsSync(authFile) &&
      Date.now() - fs.statSync(authFile).mtimeMs > 40 * 60 * 1_000
    ) {
      await this.context.storageState({ path: authFile });
    }
  }
});

// ── After: cleanup for account-creating scenarios ──
After({ tags: '@creates-account' }, async function (this: PlaywrightWorld, scenario) {
  const email = this.scenarioData['generatedEmail'] as string | undefined;
  if (email) {
    appendCleanupLog(email, scenario.pickle.name);
    // Auto-delete via Auth0 API if credentials are available
    if (process.env.AUTH0_M2M_CLIENT_ID && process.env.AUTH0_M2M_CLIENT_SECRET) {
      try {
        const { deleteUser } = await import('../utils/auth0-mgmt');
        await deleteUser(email);
      } catch (e) {
        console.warn(`[CLEANUP] Auto-delete failed for ${email}:`, (e as Error).message);
      }
    }
  }
});

// ── After: screenshot on failure + teardown ──
After(async function (this: PlaywrightWorld, scenario) {
  if (scenario.result?.status === 'FAILED') {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    } catch {
      // Page already closed
    }
  }
  await this.page.close().catch(() => {});
  await this.context.close().catch(() => {});
});

// ── AfterAll: cleanup summary + close browser ──
AfterAll(async function () {
  // Print cleanup summary
  const entries = getCleanupEntries();
  if (entries.length > 0) {
    console.log('\n[CLEANUP] Accounts created during this run:');
    for (const e of entries) {
      console.log(`  - ${e.email} (${e.scenario ?? 'unknown'}) at ${e.createdAt}`);
    }
    console.log(`[CLEANUP] Total: ${entries.length} account(s) need manual cleanup`);
    console.log(`[CLEANUP] Manifest: reports/cleanup-manifest.json\n`);
  }

  await sharedBrowser?.close();
});
