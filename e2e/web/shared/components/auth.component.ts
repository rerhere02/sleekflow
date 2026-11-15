import { Page } from '@playwright/test';
import { LoginPage } from '../../sleekflow/pages/login.page';
import { getConfig } from '../../sleekflow/utils/config';

/**
 * Shared authentication component — reusable login flows
 * used across step definitions and hooks.
 */
export class AuthComponent {
  private readonly loginPage: LoginPage;

  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
  }

  /** Navigate to login and advance to the password step. */
  async goToPasswordStep(email?: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.goToPasswordStep(
      email ?? process.env.TEST_EMAIL ?? 'sftestq+owner@gmail.com',
    );
  }

  /** Full UI login with email + password, ending on the dashboard. */
  async loginViaUI(email?: string, password?: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.login(
      email ?? process.env.TEST_EMAIL ?? 'sftestq+owner@gmail.com',
      password ?? process.env.TEST_PASSWORD ?? 'P@ssword123',
    );
    await this.page.waitForURL(
      url => !url.toString().includes('sso.sleekflow.io'),
      { timeout: 30_000 },
    );
  }

  /** Logout via Auth0 endpoint — clears cookies, storage, and SSO session. */
  async logout(): Promise<void> {
    const config = getConfig();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.context().clearCookies();
    await this.page.goto(
      `${config.ssoUrl}/v2/logout?client_id=${config.auth0ClientId}&returnTo=${encodeURIComponent(config.baseUrl)}`,
    );
    await this.page.waitForURL(
      url => url.toString().includes('sso.sleekflow.io/u/login') || url.toString().includes(config.baseUrl),
      { timeout: 15_000 },
    );
  }
}
