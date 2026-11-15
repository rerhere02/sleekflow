import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';

/**
 * Email verification page at app.sleekflow.io
 * Shown after Auth0 redirects with error=access_denied.
 * Displays: masked email, 6-digit code input, Open Gmail/Outlook, Resend code, Sign out.
 */
export class VerificationPage extends BasePage {
  readonly heading: Locator;
  readonly codeInput: Locator;
  readonly linkOpenGmail: Locator;
  readonly linkOpenOutlook: Locator;
  readonly btnResendCode: Locator;
  readonly btnVerified: Locator;
  readonly btnSignOut: Locator;
  readonly maskedEmail: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText(/confirm your email|verify your email/i);
    this.codeInput = page.locator('input[autocomplete="one-time-code"]')
      .or(page.locator('input[inputmode="numeric"]'));
    this.linkOpenGmail = page.getByRole('link', { name: /open gmail/i });
    this.linkOpenOutlook = page.getByRole('link', { name: /open outlook/i });
    this.btnResendCode = page.getByRole('button', { name: /resend/i })
      .or(page.getByRole('link', { name: /resend/i }));
    this.btnVerified = page.getByRole('button', { name: /verified my email/i })
      .or(page.getByRole('link', { name: /verified my email/i }));
    this.btnSignOut = page.getByRole('button', { name: /sign out/i })
      .or(page.getByRole('link', { name: /sign out/i }));
    this.maskedEmail = page.locator('[data-testid="masked-email"]')
      .or(page.getByText(/\w\*+@/));
  }

  async goto(): Promise<void> {
    await this.page.goto(getConfig().baseUrl, { waitUntil: 'commit' });
    await this.heading.waitFor({ timeout: 15_000 });
  }

  async enterCode(code: string): Promise<void> {
    await this.codeInput.fill(code);
  }
}
