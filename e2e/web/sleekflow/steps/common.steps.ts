import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { LoginPage } from '../pages/login.page';
import { SignUpPage } from '../pages/signup.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { getConfig } from '../utils/config';
import { generateTestEmail } from '../utils/test-constants';
import { emailInput, passwordInput, errorLocator, passwordToggle, AUTH_ERROR_PAGE_TEXT } from '../utils/auth0';
import { AuthComponent } from '../../shared/components/auth.component';

// ── Navigation ──

Given('user is on the login identifier page', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
});

Given('user is on the signup identifier page', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await signUpPage.goto();
});

Given('user is on the forgot password page', async function (this: PlaywrightWorld) {
  const forgotPage = new ForgotPasswordPage(this.page);
  await forgotPage.goto();
});

Given('user is on the login password step', async function (this: PlaywrightWorld) {
  const auth = new AuthComponent(this.page);
  await auth.goToPasswordStep();
});

Given('user is logged into the app', async function (this: PlaywrightWorld) {
  const auth = new AuthComponent(this.page);
  await auth.loginViaUI();
});

// ── Env-based Credentials ──

When('user enter the configured test email', async function (this: PlaywrightWorld) {
  await emailInput(this.page).fill(process.env.TEST_EMAIL!);
});

When('user enter the configured test password', async function (this: PlaywrightWorld) {
  await passwordInput(this.page).fill(process.env.TEST_PASSWORD!);
});

// ── Form Input ──

When('user enter email {string}', async function (this: PlaywrightWorld, email: string) {
  await emailInput(this.page).fill(email);
});

When('user enter a fresh test email', async function (this: PlaywrightWorld) {
  const email = generateTestEmail();
  this.scenarioData['generatedEmail'] = email;
  await emailInput(this.page).fill(email);
});

When('user enter password {string}', async function (this: PlaywrightWorld, password: string) {
  await passwordInput(this.page).fill(password);
});

When('user enter full name {string}', async function (this: PlaywrightWorld, name: string) {
  await this.page.getByLabel(/full name|name/i)
    .or(this.page.getByPlaceholder(/full name/i)).fill(name);
});

When('user accept the Terms of Service', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await signUpPage.acceptTerms();
});

// ── Buttons ──

When('user click the Continue button', async function (this: PlaywrightWorld) {
  await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
});

When('user click the Sign up button', async function (this: PlaywrightWorld) {
  await this.page.getByRole('button', { name: /^sign up$/i }).click();
});

When('user click the Sign in button', async function (this: PlaywrightWorld) {
  await this.page.getByRole('button', { name: /^sign in$/i }).click();
});

When('user click the {string} button', async function (this: PlaywrightWorld, name: string) {
  await this.page.getByRole('button', { name: new RegExp(name, 'i') }).click();
});

When('user click the {string} link', async function (this: PlaywrightWorld, name: string) {
  await this.page.getByRole('link', { name: new RegExp(name, 'i') }).click();
});

When('user click the show\\/hide password toggle', async function (this: PlaywrightWorld) {
  await passwordToggle(this.page).click();
});

// ── Assertions ──

Then('the password step is displayed', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#password')).toBeVisible({ timeout: 15_000 });
  await this.page.waitForLoadState('load');
});

Then('the email field is autofocused', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#username')).toBeFocused({ timeout: 5_000 });
});

Then('an inline error is displayed', async function (this: PlaywrightWorld) {
  // Auth0 ULP forms are `novalidate` — validation always renders a DOM error with text.
  const error = errorLocator(this.page).first();
  await expect(error).toBeVisible({ timeout: 10_000 });
  await expect(error).not.toBeEmpty();
});

Then('the error {string} is displayed', async function (this: PlaywrightWorld, msg: string) {
  await expect(
    this.page.getByText(new RegExp(msg, 'i')),
  ).toBeVisible({ timeout: 15_000 });
});

Then('no error is displayed', async function (this: PlaywrightWorld) {
  await expect(errorLocator(this.page).first()).not.toBeVisible({ timeout: 3_000 });
});

Then('the dashboard is displayed', async function (this: PlaywrightWorld) {
  await this.page.waitForURL(
    url => !url.toString().includes('sso.sleekflow.io') && !url.toString().includes('/login'),
    { timeout: 30_000 },
  );
});

Then('user is redirected to the app', async function (this: PlaywrightWorld) {
  await this.page.waitForURL(
    url => !url.toString().includes('sso.sleekflow.io'),
    { timeout: 15_000 },
  );
});

Then('the login screen is displayed without errors', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#username')).toBeVisible({ timeout: 15_000 });
  await expect(this.page.getByText(AUTH_ERROR_PAGE_TEXT)).toHaveCount(0);
});

Then('a usable auth page is displayed without errors', async function (this: PlaywrightWorld) {
  await expect(emailInput(this.page).first()).toBeVisible({ timeout: 15_000 });
  await expect(this.page.getByText(AUTH_ERROR_PAGE_TEXT)).toHaveCount(0);
});

Then('no auth error page is displayed', async function (this: PlaywrightWorld) {
  await expect(this.page.getByText(AUTH_ERROR_PAGE_TEXT)).toHaveCount(0);
});

Then('no invalid_request error is visible', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByText(/invalid_request/i),
  ).not.toBeVisible({ timeout: 3_000 });
});

// ── Logout ──

When('user logs out', async function (this: PlaywrightWorld) {
  const auth = new AuthComponent(this.page);
  await auth.logout();
});

When('user navigates to the app', async function (this: PlaywrightWorld) {
  await this.page.goto(getConfig().baseUrl, { waitUntil: 'commit' });
});

Then('user is redirected to the login page', async function (this: PlaywrightWorld) {
  await this.page.waitForURL(
    url => url.toString().includes('sso.sleekflow.io'),
    { timeout: 15_000, waitUntil: 'commit' },
  );
  await expect(this.page.locator('#username')).toBeVisible({ timeout: 15_000 });
});
