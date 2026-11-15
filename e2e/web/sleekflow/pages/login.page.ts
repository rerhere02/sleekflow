import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';
import { errorLocator, passwordToggle } from '../utils/auth0';

/**
 * Auth0 Universal Login — identifier-first flow.
 * Step 1: email/username (#username) → Continue
 * Step 2: password (#password) → Sign in
 */
export class LoginPage extends BasePage {
  readonly inputEmail: Locator;
  readonly inputPassword: Locator;
  readonly btnContinue: Locator;
  readonly btnSignIn: Locator;
  readonly linkForgotPassword: Locator;
  readonly linkSignUp: Locator;
  readonly linkEdit: Locator;
  readonly btnContinueWithGoogle: Locator;
  readonly btnSignInWithApple: Locator;
  readonly alertError: Locator;
  readonly showPasswordToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.inputEmail = page.locator('#username');
    this.inputPassword = page.locator('#password');
    this.btnContinue = page.getByRole('button', { name: 'Continue', exact: true });
    this.btnSignIn = page.getByRole('button', { name: /^sign in$/i });
    this.linkForgotPassword = page.getByRole('link', { name: /reset password/i });
    this.linkSignUp = page.getByRole('link', { name: /sign up/i });
    this.linkEdit = page.getByRole('link', { name: /edit/i });
    this.btnContinueWithGoogle = page.getByRole('button', { name: /continue with google/i });
    this.btnSignInWithApple = page.getByRole('button', { name: /sign in with apple/i });
    this.alertError = errorLocator(page);
    this.showPasswordToggle = passwordToggle(page);
  }

  async goto(): Promise<void> {
    await this.navigateToSso(getConfig().baseUrl);
    await this.inputEmail.waitFor({ timeout: 15_000 });
    await this.page.waitForLoadState('load');
  }

  async fillEmail(email: string): Promise<void> {
    await this.inputEmail.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.inputPassword.fill(password);
  }

  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }

  async clickSignIn(): Promise<void> {
    await this.btnSignIn.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.inputPassword.waitFor({ timeout: 10_000 });
    await this.fillPassword(password);
    await this.btnSignIn.or(this.btnContinue).click();
  }

  async goToPasswordStep(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.inputPassword.waitFor({ timeout: 10_000 });
  }

  async getErrorMessage(): Promise<string> {
    await this.alertError.waitFor({ timeout: 5_000 });
    return (await this.alertError.textContent()) ?? '';
  }

  async hasError(): Promise<boolean> {
    return this.alertError.isVisible();
  }
}
