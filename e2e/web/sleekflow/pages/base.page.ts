import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract goto(): Promise<void>;

  /** Navigate to a URL and wait for SSO redirect, with one retry on failure. */
  protected async navigateToSso(baseUrl: string): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.page.goto(baseUrl, { waitUntil: 'commit' });
        await this.page.waitForURL(
          url => url.toString().includes('sso.sleekflow.io'),
          { timeout: 30_000, waitUntil: 'commit' },
        );
        return;
      } catch (e) {
        if (attempt === 1) throw e;
        console.log('[NAV] SSO redirect timeout, retrying...');
      }
    }
  }
}
