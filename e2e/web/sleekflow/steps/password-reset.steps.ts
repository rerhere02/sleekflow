import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { LoginPage } from '../pages/login.page';
import { errorLocator } from '../utils/auth0';

// ── Password Reset steps ──

Given('user is on the forgot password page from login', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.fillEmail('test@example.com');
  await loginPage.clickContinue();
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  // Link text is "Reset password" on Auth0 ULP
  await loginPage.linkForgotPassword.click();
  await this.page.waitForURL(url => url.toString().includes('reset-password'), { timeout: 15_000 });
  await this.page.locator('#email').waitFor({ timeout: 10_000 });
});

Given('user is on the forgot password page with pre-filled email {string}', async function (this: PlaywrightWorld, email: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.fillEmail(email);
  await loginPage.clickContinue();
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  await loginPage.linkForgotPassword.click();
  await this.page.waitForURL(url => url.toString().includes('reset-password'), { timeout: 10_000 });
});

When('user submit reset email {string}', async function (this: PlaywrightWorld, email: string) {
  const forgotPage = new ForgotPasswordPage(this.page);
  await forgotPage.fillEmail(email);
  await forgotPage.clickContinue();
});

Then('the Check Your Email page is displayed', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByText(/check your email|email has been sent/i),
  ).toBeVisible({ timeout: 10_000 });
});

Then('the reset email field is pre-filled with {string}', async function (this: PlaywrightWorld, email: string) {
  const value = await this.page.locator('#email').or(this.page.locator('#username')).inputValue();
  expect(value).toBe(email);
});

Then('the resend link is visible', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByRole('link', { name: /resend/i }).or(this.page.getByRole('button', { name: /resend/i })),
  ).toBeVisible({ timeout: 5_000 });
});


Then('the error message has no empty placeholders', async function (this: PlaywrightWorld) {
  const errorText = await errorLocator(this.page).first()
    .textContent({ timeout: 5_000 }).catch(() => '');
  expect(errorText).not.toContain('{}');
  expect(errorText).not.toContain('undefined');
  expect(errorText).not.toMatch(/%s/);
});

Then('the confirmation shows email {string}', async function (this: PlaywrightWorld, email: string) {
  await expect(this.page.getByText(email)).toBeVisible({ timeout: 5_000 });
});
