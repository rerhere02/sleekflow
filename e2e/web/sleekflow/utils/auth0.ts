import { Page, Locator } from '@playwright/test';

// Shared Auth0 Universal Login selectors
export const AUTH0_ERROR_SELECTOR =
  '.ulp-validator-error, .ulp-input-error-message, [id^="error-element"]';

/** Text shown by the Auth0 / SleekFlow error pages a user must never land on from a stale link. */
export const AUTH_ERROR_PAGE_TEXT =
  /oops|something went wrong|invalid_request|link expired|tracking id/i;

/** Resilient email/username input — works on login (#username) and signup (#email). */
export function emailInput(page: Page): Locator {
  return page.locator('#email').or(page.locator('#username')).or(page.getByLabel(/email/i));
}

/** Password field — works on both login and signup. */
export function passwordInput(page: Page): Locator {
  return page.locator('#password').or(page.getByLabel(/^password$/i));
}

/** Auth0 error banner — covers client-side validators, server-side errors, and role="alert". */
export function errorLocator(page: Page): Locator {
  return page.locator(AUTH0_ERROR_SELECTOR).or(page.getByRole('alert'));
}

/** Show/hide password toggle button. */
export function passwordToggle(page: Page): Locator {
  return page
    .getByRole('button', { name: /show password|hide password/i })
    .or(page.locator('[data-action="toggle"]'));
}
