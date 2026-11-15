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
      email ?? process.env.TEST_EMAIL!,
    );
  }

  /**
   * Navigate to the app as an already-authenticated user.
   * Relies on stored auth state (storageState) loaded in the Before hook.
   * Falls back to full UI login if SSO redirect is detected.
   */
  async navigateAsLoggedIn(): Promise<void> {
    const config = getConfig();
    await this.page.goto(config.baseUrl, { waitUntil: 'commit' });
    // If auth state is valid, page stays on the app (no SSO redirect)
    const url = this.page.url();
    if (url.includes('sso.sleekflow.io')) {
      // Auth state expired — fall back to UI login
      await this.loginViaUI();
    } else {
      await this.page.waitForURL(
        u => !u.toString().includes('sso.sleekflow.io'),
        { timeout: 30_000 },
      );
    }
  }

  /** Full UI login with email + password, ending on the dashboard. */
  async loginViaUI(email?: string, password?: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.login(
      email ?? process.env.TEST_EMAIL!,
      password ?? process.env.TEST_PASSWORD!,
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
      { waitUntil: 'commit' },
    );
    await this.page.waitForURL(
      url => url.toString().includes('sso.sleekflow.io/u/login') || url.toString().includes(config.baseUrl),
      { timeout: 15_000, waitUntil: 'commit' },
    );
  }
}
