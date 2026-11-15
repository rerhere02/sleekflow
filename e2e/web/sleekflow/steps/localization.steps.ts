import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { LoginPage } from '../pages/login.page';
import { getConfig } from '../utils/config';
import { passwordToggle as getPasswordToggle } from '../utils/auth0';

// Auth0 ULP has no language picker UI — locale is set via `ui_locales` URL parameter.
const LOCALE_MAP: Record<string, string> = {
  'english': 'en',
  'bahasa indonesia': 'id',
  'arabic': 'ar',
  'portuguese': 'pt',
  'spanish': 'es',
  'chinese': 'zh',
};

function getLocaleCode(language: string): string {
  return LOCALE_MAP[language.toLowerCase()] ?? language.toLowerCase().substring(0, 2);
}

// ── Localization & Accessibility steps ──

Given('user is on the login page with language {string}', async function (this: PlaywrightWorld, language: string) {
  const locale = getLocaleCode(language);
  const config = getConfig();
  // Navigate to the app, which redirects to SSO login
  await this.page.goto(config.baseUrl, { waitUntil: 'commit' });
  await this.page.waitForURL(
    url => url.toString().includes('sso.sleekflow.io'),
    { timeout: 30_000, waitUntil: 'commit' },
  );
  // Rewrite URL with the desired locale
  if (locale !== 'en') {
    const currentUrl = this.page.url();
    const url = new URL(currentUrl);
    url.searchParams.set('ui_locales', locale);
    await this.page.goto(url.toString(), { waitUntil: 'commit' });
  }
  await this.page.locator('#username').waitFor({ timeout: 15_000 });
});

When('user switch language to {string}', async function (this: PlaywrightWorld, language: string) {
  const locale = getLocaleCode(language);
  const currentUrl = this.page.url();
  const url = new URL(currentUrl);
  url.searchParams.set('ui_locales', locale);
  await this.page.goto(url.toString(), { waitUntil: 'commit' });
  await this.page.locator('#username').waitFor({ timeout: 15_000 });
});

Then('the page text is in {string}', async function (this: PlaywrightWorld, language: string) {
  if (language.toLowerCase().includes('indonesia')) {
    await expect(
      this.page.getByText(/daftar/i).or(this.page.getByText(/masuk/i)),
    ).toBeVisible({ timeout: 5_000 });
  } else if (language.toLowerCase().includes('arabic')) {
    // Arabic: check for Arabic script characters in the page
    const hasArabic = await this.page.evaluate(() => {
      return /[\u0600-\u06FF]/.test(document.body.innerText);
    });
    expect(hasArabic).toBe(true);
  }
});

Then('the page direction is RTL', async function (this: PlaywrightWorld) {
  const dir = await this.page.evaluate(() => {
    return document.documentElement.getAttribute('dir') ||
      getComputedStyle(document.documentElement).direction;
  });
  expect(dir).toBe('rtl');
});

Then('the page direction is LTR', async function (this: PlaywrightWorld) {
  const dir = await this.page.evaluate(() => {
    return document.documentElement.getAttribute('dir') ||
      getComputedStyle(document.documentElement).direction;
  });
  expect(dir).not.toBe('rtl');
});

Then('the sign-up link text is {string}', async function (this: PlaywrightWorld, text: string) {
  await expect(this.page.getByRole('link', { name: text })).toBeVisible({ timeout: 5_000 });
});

Then('the email field label is {string}', async function (this: PlaywrightWorld, label: string) {
  await expect(this.page.getByText(label)).toBeVisible({ timeout: 5_000 });
});

Then('no foreign language strings are visible', async function (this: PlaywrightWorld) {
  // Check that no Portuguese or other unexpected language text leaks in
  await expect(this.page.getByText(/Registre-se/)).not.toBeVisible({ timeout: 3_000 });
  // Also verify "Sign up" (English) is NOT present when in Indonesian
  await expect(this.page.getByText(/^Sign up$/)).not.toBeVisible({ timeout: 3_000 });
});

Then('every input has a label', async function (this: PlaywrightWorld) {
  const inputs = await this.page.locator('input:visible').all();
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');
    const hasLabel = id
      ? await this.page.locator(`label[for="${id}"]`).count() > 0
      : false;
    expect(hasLabel || ariaLabel !== null || ariaLabelledBy !== null).toBe(true);
  }
});

Then('a live region exists on the page', async function (this: PlaywrightWorld) {
  const liveRegions = await this.page.locator('[aria-live]').count();
  expect(liveRegions).toBeGreaterThan(0);
});

Then('the password toggle has an accessible label', async function (this: PlaywrightWorld) {
  const toggle = getPasswordToggle(this.page);
  await expect(toggle).toBeVisible({ timeout: 5_000 });
  const ariaLabel = await toggle.getAttribute('aria-label');
  const innerText = await toggle.textContent();
  expect(ariaLabel || innerText).toBeTruthy();
});

Then('the page title contains {string}', async function (this: PlaywrightWorld, title: string) {
  const pageTitle = await this.page.title();
  expect(pageTitle).toContain(title);
});

Then('form labels use sentence case', async function (this: PlaywrightWorld) {
  const labels = await this.page.locator('label:visible').all();
  for (const label of labels) {
    const text = (await label.textContent())?.trim();
    if (text && text.length > 1) {
      expect(text).not.toMatch(/^[A-Z]{3,}/); // not ALL CAPS
    }
  }
});

// ── Responsive steps ──

Given('user is on the login page at viewport width {int}px', async function (this: PlaywrightWorld, width: number) {
  await this.page.setViewportSize({ width, height: 720 });
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
});

Given('user is on the {string} page at viewport width {int}px', async function (this: PlaywrightWorld, pageName: string, width: number) {
  await this.page.setViewportSize({ width, height: 720 });
  const config = getConfig();
  if (/login/i.test(pageName)) {
    await this.page.goto(config.baseUrl, { waitUntil: 'commit' });
    await this.page.waitForURL(url => url.toString().includes('sso.sleekflow.io'), { timeout: 30_000, waitUntil: 'commit' });
    await this.page.locator('#username').waitFor({ timeout: 15_000 });
  } else if (/sign.?up/i.test(pageName)) {
    await this.page.goto(config.baseUrl, { waitUntil: 'commit' });
    await this.page.waitForURL(url => url.toString().includes('sso.sleekflow.io'), { timeout: 30_000, waitUntil: 'commit' });
    await this.page.getByRole('link', { name: /sign up/i }).click();
    await this.page.locator('#email').waitFor({ timeout: 15_000 });
  } else if (/reset|forgot/i.test(pageName)) {
    // Navigate via login → password step → Reset password link
    await this.page.goto(config.baseUrl, { waitUntil: 'commit' });
    await this.page.waitForURL(url => url.toString().includes('sso.sleekflow.io'), { timeout: 30_000, waitUntil: 'commit' });
    await this.page.locator('#username').waitFor({ timeout: 15_000 });
    await this.page.locator('#username').fill('test@example.com');
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    await this.page.locator('#password').waitFor({ timeout: 10_000 });
    await this.page.getByRole('link', { name: /reset password/i }).click();
    await this.page.waitForURL(url => url.toString().includes('reset-password'), { timeout: 15_000 });
    await this.page.locator('#email').waitFor({ timeout: 10_000 });
  }
});

Then('no horizontal scrollbar is present', async function (this: PlaywrightWorld) {
  const overflow = await this.page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  // Allow up to 10px tolerance for sub-pixel rendering and mobile scrollbar quirks
  expect(overflow).toBeLessThanOrEqual(10);
});

Then('the form card is fully visible', async function (this: PlaywrightWorld) {
  const formCard = this.page.locator('form').first();
  await expect(formCard).toBeVisible({ timeout: 10_000 });
  const box = await formCard.boundingBox();
  const viewport = this.page.viewportSize()!;
  expect(box, 'form has a bounding box').not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
});

Then('the layout is single-column', async function (this: PlaywrightWorld) {
  // Single column: the form is horizontally centred in the viewport.
  const formBox = await this.page.locator('form').first().boundingBox();
  expect(formBox, 'form has a bounding box').not.toBeNull();
  const viewport = this.page.viewportSize()!;
  const centerOffset = Math.abs((formBox!.x + formBox!.width / 2) - viewport.width / 2);
  expect(centerOffset).toBeLessThan(40);
});

Then('the layout has two columns', async function (this: PlaywrightWorld) {
  // Two columns: the form sits entirely in the right half, beside the marketing panel.
  const formBox = await this.page.locator('form').first().boundingBox();
  expect(formBox, 'form has a bounding box').not.toBeNull();
  const viewport = this.page.viewportSize()!;
  expect(formBox!.x).toBeGreaterThanOrEqual(viewport.width / 2);
});
