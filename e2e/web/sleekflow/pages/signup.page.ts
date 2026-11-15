import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';
import { errorLocator, passwordToggle } from '../utils/auth0';

/**
 * Auth0 Universal Login — multi-step signup.
 * Step 1: email (#email) + Terms checkbox (#terms-of-service) + "Sign up"
 * Step 2: full name + password (#password) + "Sign up"/"Continue"
 */
export class SignUpPage extends BasePage {
  // Step 1
  readonly inputEmail: Locator;
  readonly checkboxTerms: Locator;
  readonly btnSignUp: Locator;
  readonly alertError: Locator;
  // Step 2
  readonly inputFullName: Locator;
  readonly inputPassword: Locator;
  readonly btnContinue: Locator;
  // Social
  readonly btnContinueWithGoogle: Locator;
  readonly btnSignUpWithApple: Locator;
  // Password checklist
  readonly passwordChecklistLowercase: Locator;
  readonly passwordChecklistUppercase: Locator;
  readonly passwordChecklistNumber: Locator;
  readonly passwordChecklistSpecial: Locator;
  readonly passwordChecklistLength: Locator;
  readonly showPasswordToggle: Locator;
  // Links
  readonly linkLogin: Locator;
  readonly linkEdit: Locator;

  constructor(page: Page) {
    super(page);
    // Step 1 — signup identifier
    this.inputEmail = page.locator('#email');
    this.checkboxTerms = page.locator('#terms-of-service');
    this.btnSignUp = page.getByRole('button', { name: /^sign up$/i });
    this.alertError = errorLocator(page);
    // Step 2 — signup password
    this.inputFullName = page.getByLabel(/full name|name/i).or(page.getByPlaceholder(/full name/i));
    this.inputPassword = page.locator('#password').or(page.getByLabel(/^password$/i));
    this.btnContinue = page.getByRole('button', { name: /^(continue|sign up|create account)$/i });
    // Social
    this.btnContinueWithGoogle = page.getByRole('button', { name: /continue with google/i });
    this.btnSignUpWithApple = page.getByRole('button', { name: /continue with apple/i });
    // Password checklist
    this.passwordChecklistLowercase = page.getByText(/lower\s*case/i).first();
    this.passwordChecklistUppercase = page.getByText(/upper\s*case/i).first();
    this.passwordChecklistNumber = page.getByText(/numbers?\s*\(0-9\)/i).first();
    this.passwordChecklistSpecial = page.getByText(/special\s*characters/i).first();
    this.passwordChecklistLength = page.getByText('At least 8 characters', { exact: true });
    this.showPasswordToggle = passwordToggle(page);
    // Links
    this.linkLogin = page.getByRole('link', { name: /log in|sign in/i });
    this.linkEdit = page.getByRole('link', { name: /edit/i });
  }

  async goto(): Promise<void> {
    await this.navigateToSso(getConfig().baseUrl);
    await this.page.getByRole('link', { name: /sign up/i }).click();
    await this.inputEmail.waitFor({ timeout: 15_000 });
    await this.page.waitForLoadState('load');
  }

  async fillEmail(email: string): Promise<void> {
    await this.inputEmail.fill(email);
  }

  async fillFullName(name: string): Promise<void> {
    await this.inputFullName.fill(name);
  }

  async fillPassword(password: string): Promise<void> {
    await this.inputPassword.fill(password);
  }

  async acceptTerms(): Promise<void> {
    await this.checkboxTerms.check({ force: true });
  }

  async clickSignUp(): Promise<void> {
    await this.btnSignUp.click();
  }

  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.alertError.waitFor({ timeout: 5_000 });
    return (await this.alertError.textContent()) ?? '';
  }

  async hasError(): Promise<boolean> {
    return this.alertError.isVisible();
  }
}
