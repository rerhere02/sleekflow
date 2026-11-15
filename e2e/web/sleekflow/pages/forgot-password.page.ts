import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';
import { errorLocator } from '../utils/auth0';

export class ForgotPasswordPage extends BasePage {
  readonly inputEmail: Locator;
  readonly btnContinue: Locator;
  readonly alertError: Locator;
  readonly confirmationMessage: Locator;
  readonly linkBack: Locator;
  readonly linkResend: Locator;

  constructor(page: Page) {
    super(page);
    this.inputEmail = page.locator('#email').or(page.locator('#username')).or(page.getByLabel(/email/i));
    this.btnContinue = page.getByRole('button', { name: /^(send link|send|submit|reset password|continue)$/i });
    this.alertError = errorLocator(page);
    this.confirmationMessage = page.getByText(/check your email|email has been sent/i);
    this.linkBack = page.getByRole('button', { name: /back/i }).or(page.getByRole('link', { name: /back/i }));
    this.linkResend = page.getByRole('link', { name: /resend/i }).or(page.getByRole('button', { name: /resend/i }));
  }

  async goto(): Promise<void> {
    const config = getConfig();
    await this.page.goto(`${config.ssoUrl}/u/reset-password`, { waitUntil: 'commit' });
    await this.inputEmail.waitFor({ timeout: 15_000 });
    // Auth0 attaches its validators on load — acting earlier can silently drop the submit.
    await this.page.waitForLoadState('load');
  }

  async fillEmail(email: string): Promise<void> {
    await this.inputEmail.fill(email);
  }

  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.alertError.waitFor({ timeout: 5_000 });
    return (await this.alertError.textContent()) ?? '';
  }
}
