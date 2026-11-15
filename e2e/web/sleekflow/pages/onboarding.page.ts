import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';

export class OnboardingPage extends BasePage {
  readonly checklist: Locator;
  readonly trialBanner: Locator;
  readonly linkBookDemo: Locator;
  readonly btnHelp: Locator;

  constructor(page: Page) {
    super(page);
    this.checklist = page.getByText(/onboarding|checklist|getting started/i);
    this.trialBanner = page.getByText(/your.*pro trial starts/i).first();
    this.linkBookDemo = page.getByRole('link', { name: /book a demo/i });
    this.btnHelp = page.getByRole('button', { name: /help/i })
      .or(page.locator('[class*="help"]'));
  }

  async goto(): Promise<void> {
    await this.page.goto(getConfig().baseUrl, { waitUntil: 'commit' });
    await this.checklist.waitFor({ timeout: 20_000 });
  }
}
