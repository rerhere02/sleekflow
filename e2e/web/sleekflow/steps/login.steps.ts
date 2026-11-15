import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { LoginPage } from '../pages/login.page';
import { getConfig } from '../utils/config';

// ── Login-specific steps ──

Given('user opens a stale auth link while signed out', async function (this: PlaywrightWorld) {
  // Simulate stale state by navigating to login with an expired state param
  const config = getConfig();
  await this.page.goto(`${config.ssoUrl}/u/login/identifier?state=expired_test_state`, {
    waitUntil: 'commit',
  });
});

Given('user opens a stale auth link while signed in', async function (this: PlaywrightWorld) {
  // First ensure signed in (auth state loaded via hooks), then hit stale URL
  const config = getConfig();
  await this.page.goto(`${config.ssoUrl}/u/login/identifier?state=expired_test_state`, {
    waitUntil: 'commit',
  });
});

When('user submit email {string}', async function (this: PlaywrightWorld, email: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillEmail(email);
  await loginPage.clickContinue();
});

When('user submit password {string}', async function (this: PlaywrightWorld, password: string) {
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  const loginPage = new LoginPage(this.page);
  await loginPage.fillPassword(password);
});

Then('the password field is visible with show\\/hide toggle', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#password')).toBeVisible({ timeout: 10_000 });
  await expect(
    this.page.getByRole('button', { name: /show password|hide password/i })
      .or(this.page.locator('[data-action="toggle"]')),
  ).toBeVisible();
});

Then('the identifier field shows {string} as read-only', async function (this: PlaywrightWorld, email: string) {
  await expect(this.page.getByText(email)).toBeVisible({ timeout: 5_000 });
});

Then('the Edit link is visible', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByRole('link', { name: /edit/i }),
  ).toBeVisible({ timeout: 5_000 });
});

Then('the identifier step is restored', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#username')).toBeVisible({ timeout: 10_000 });
});

Then('password text is {string}', async function (this: PlaywrightWorld, visibility: string) {
  const type = await this.page.locator('#password').getAttribute('type');
  if (visibility === 'visible') {
    expect(type).toBe('text');
  } else {
    expect(type).toBe('password');
  }
});

Then('the 2FA code step is displayed', async function (this: PlaywrightWorld) {
  await expect(
    this.page.locator('input[autocomplete="one-time-code"]')
      .or(this.page.getByLabel(/verification code|authenticator/i)),
  ).toBeVisible({ timeout: 10_000 });
});

Then('the identifier is displayed as read-only', async function (this: PlaywrightWorld) {
  // Auth0 renders the identifier as an aria-readonly text span backed by a readonly input.
  await expect(this.page.locator('[role="textbox"][aria-readonly="true"]')).toBeVisible({ timeout: 5_000 });
  await expect(this.page.locator('input[name="username"]')).toHaveAttribute('readonly', '');
  await expect(this.page.locator('#username:not([readonly])')).toHaveCount(0);
});

Given('user opens a stale auth link for {string} while signed out', async function (this: PlaywrightWorld, pageType: string) {
  const config = getConfig();
  const pathMap: Record<string, string> = {
    'signup': '/u/signup',
    'reset-password': '/u/reset-password',
    'email-verification': '/u/login/identifier',
  };
  const path = pathMap[pageType] ?? '/u/login/identifier';
  await this.page.goto(`${config.ssoUrl}${path}?state=expired_test_state`, {
    waitUntil: 'commit',
  });
});

Then('the Sign up link preserves session state', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  const href = await loginPage.linkSignUp.getAttribute('href');
  expect(href).toContain('state=');
});

Then('the Google and Apple buttons are visible on the login page', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await expect(loginPage.btnContinueWithGoogle).toBeVisible({ timeout: 10_000 });
  // Apple button text varies: "Sign in with Apple" or "Continue with Apple"
  const appleBtn = loginPage.btnSignInWithApple
    .or(this.page.getByRole('button', { name: /continue with apple/i }));
  await expect(appleBtn).toBeVisible({ timeout: 10_000 });
});

Then('the social login buttons are not visible', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await expect(loginPage.btnContinueWithGoogle).not.toBeVisible({ timeout: 3_000 });
  const appleBtn = loginPage.btnSignInWithApple
    .or(this.page.getByRole('button', { name: /continue with apple/i }));
  await expect(appleBtn).not.toBeVisible({ timeout: 3_000 });
});
