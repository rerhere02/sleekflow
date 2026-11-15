import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { SignUpPage } from '../pages/signup.page';
import { generateTestEmail, DEFAULT_TEST_PASSWORD } from '../utils/test-constants';
import { getConfig } from '../utils/config';
import { verifyEmail, deleteUser } from '../utils/auth0-mgmt';
import { getVerificationCode } from '../utils/gmail-reader';

// ── Signup-specific steps ──

Given('user is on the signup password step', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await signUpPage.goto();
  const email = generateTestEmail();
  this.scenarioData['generatedEmail'] = email;
  await signUpPage.fillEmail(email);
  await signUpPage.acceptTerms();
  await signUpPage.clickSignUp();
  await this.page.waitForURL(url => url.toString().includes('/signup/password'), { timeout: 15_000 });
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  await this.page.waitForLoadState('load');
});

Given('user is on the signup password step with email {string}', async function (this: PlaywrightWorld, email: string) {
  const signUpPage = new SignUpPage(this.page);
  await signUpPage.goto();
  await signUpPage.fillEmail(email);
  await signUpPage.acceptTerms();
  await signUpPage.clickSignUp();
  await this.page.waitForURL(url => url.toString().includes('/signup/password'), { timeout: 15_000 });
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  await this.page.waitForLoadState('load');
});

When('user complete the full signup flow', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  const email = generateTestEmail();
  this.scenarioData['generatedEmail'] = email;
  await signUpPage.fillEmail(email);
  await signUpPage.acceptTerms();
  await signUpPage.clickSignUp();
  await this.page.locator('#password').waitFor({ timeout: 10_000 });
  await signUpPage.fillFullName('Test Automation User');
  await signUpPage.fillPassword(DEFAULT_TEST_PASSWORD);
  await signUpPage.clickContinue();
  this.scenarioData['completedSignup'] = true;
});

Then('the signup identifier page is displayed', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#email')).toBeVisible({ timeout: 10_000 });
});

Then('the consent checkbox is unticked', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await expect(signUpPage.checkboxTerms).not.toBeChecked({ timeout: 5_000 });
});

Then('the consent error is visible under the checkbox', async function (this: PlaywrightWorld) {
  // Auth0 marks the terms field with ulp-error class and shows "This is required"
  await expect(
    this.page.locator('.ulp-field.ulp-error').first(),
  ).toBeVisible({ timeout: 10_000 });
});

Then('focus is on the consent checkbox', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#terms-of-service')).toBeFocused({ timeout: 5_000 });
});

Then('the live region announces the consent error', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('[aria-live="assertive"]')).toContainText(/required/i, { timeout: 5_000 });
});

Then('the email field is non-editable on the password step', async function (this: PlaywrightWorld) {
  const email = this.scenarioData['generatedEmail'] as string;
  // The email is carried in a readonly input; no editable email/username input may remain.
  const readonlyValues = await this.page.locator('input[readonly]').evaluateAll(
    els => els.map(e => (e as HTMLInputElement).value),
  );
  expect(readonlyValues).toContain(email);
  await expect(this.page.locator('#email:not([readonly]), #username:not([readonly])')).toHaveCount(0);
  await expect(this.page.getByRole('link', { name: /edit/i })).toBeVisible();
});

Then('the password checklist updates in real-time', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  // Type partial password and check checklist state changes
  await signUpPage.fillPassword('a');
  await expect(signUpPage.passwordChecklistLowercase).toBeVisible({ timeout: 3_000 });
});

Then('the Google and Apple buttons are visible', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await expect(signUpPage.btnContinueWithGoogle).toBeVisible({ timeout: 10_000 });
  await expect(signUpPage.btnSignUpWithApple).toBeVisible({ timeout: 10_000 });
});

Then('user is redirected to {string} OAuth consent', async function (this: PlaywrightWorld, provider: string) {
  const host = provider.toLowerCase() === 'google' ? 'accounts.google.com' : 'appleid.apple.com';
  await this.page.waitForURL(url => url.hostname === host, { timeout: 15_000 });
});

Then('the email verification screen is displayed', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByText(/confirm your email|verify your email|check your email/i),
  ).toBeVisible({ timeout: 20_000 });
});

Then('no consent checkbox is shown', async function (this: PlaywrightWorld) {
  await expect(this.page.locator('#terms-of-service')).not.toBeVisible({ timeout: 3_000 });
});

Then('the password checklist is displayed', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  await expect(signUpPage.passwordChecklistLength).toBeVisible({ timeout: 5_000 });
});

/**
 * Auth0 marks met/unmet checklist items only via hashed class names, so state is read
 * relatively: an item is "met" when its class matches a known-met reference item.
 */
const PASSWORD_RULES = ['length-at-least', 'lower-case', 'upper-case', 'numbers', 'special-characters'];

async function checklistClasses(page: PlaywrightWorld['page']): Promise<Record<string, string>> {
  const classes: Record<string, string> = {};
  for (const rule of PASSWORD_RULES) {
    const item = page.locator(`[data-error-code="password-policy-${rule}"]`);
    await expect(item).toBeVisible({ timeout: 5_000 });
    classes[rule] = (await item.getAttribute('class')) ?? '';
  }
  return classes;
}

Then('the password checklist marks only {string} as met', async function (this: PlaywrightWorld, rule: string) {
  const classes = await checklistClasses(this.page);
  const others = PASSWORD_RULES.filter(r => r !== rule);
  for (const other of others) {
    expect(classes[other], `"${other}" should be unmet`).not.toBe(classes[rule]);
    expect(classes[other], 'unmet items share one state class').toBe(classes[others[0]]);
  }
});

Then('the password checklist reflects all criteria met', async function (this: PlaywrightWorld) {
  const signUpPage = new SignUpPage(this.page);
  // Capture the "unmet" class from a state where upper-case is known to be unmet.
  const current = await this.page.locator('#password').inputValue();
  await signUpPage.fillPassword('a');
  const unmetClass = (await checklistClasses(this.page))['upper-case'];
  await signUpPage.fillPassword(current);
  await expect(async () => {
    const classes = await checklistClasses(this.page);
    for (const rule of PASSWORD_RULES) {
      expect(classes[rule], `"${rule}" should be met`).not.toBe(unmetClass);
      expect(classes[rule]).toBe(classes[PASSWORD_RULES[0]]);
    }
  }).toPass({ timeout: 5_000 });
});

Then('the signup advances past the password step', async function (this: PlaywrightWorld) {
  await this.page.waitForURL(
    url => !url.toString().includes('/signup/password'),
    { timeout: 15_000 },
  );
});

Then('no account-exists notice is displayed', async function (this: PlaywrightWorld) {
  // Check that no server-side error about existing accounts is shown
  // Note: "Already have an account? Sign in" nav link is always present — exclude it
  const errorBanner = this.page.locator('.ulp-input-error-message, [id^="error-element"]')
    .filter({ hasText: /already|exists/i });
  await expect(errorBanner).not.toBeVisible({ timeout: 3_000 });
});

Then('the Terms of Service link is navigable', async function (this: PlaywrightWorld) {
  const link = this.page.getByRole('link', { name: /terms of service|terms/i }).first();
  await expect(link).toBeVisible({ timeout: 5_000 });
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
});

Then('the Privacy Policy link is navigable', async function (this: PlaywrightWorld) {
  const link = this.page.getByRole('link', { name: /privacy policy|privacy/i }).first();
  await expect(link).toBeVisible({ timeout: 5_000 });
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
});

When('user moves focus away from the email field', async function (this: PlaywrightWorld) {
  await this.page.locator('body').click();
});

Then('the registration failure message is displayed', async function (this: PlaywrightWorld) {
  await expect(
    this.page.getByText(/couldn.t complete your registration/i),
  ).toBeVisible({ timeout: 15_000 });
  expect(this.page.url()).toContain('/signup');
});

// ── Email Verification ──

When('user complete email verification', async function (this: PlaywrightWorld) {
  const email = this.scenarioData['generatedEmail'] as string;
  if (!email) throw new Error('No generated email found in scenarioData');

  if (process.env.GMAIL_APP_PASSWORD) {
    // Strategy 1: Read verification code from Gmail via IMAP and enter it
    console.log(`[VERIFY] Reading code from Gmail for ${email}...`);
    const code = await getVerificationCode(email);
    console.log(`[VERIFY] Entering code: ${code}`);

    // Find OTP input — SleekFlow uses a single MUI input (maxLength=6, inputMode=numeric)
    const otpInputs = this.page.locator(
      'input[inputmode="numeric"], input[autocomplete="one-time-code"]',
    );
    const otpCount = await otpInputs.count();
    console.log(`[VERIFY] OTP inputs found: ${otpCount}`);

    if (otpCount >= 6) {
      // Individual digit inputs — click and type each
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).click();
        await this.page.keyboard.type(code[i]);
        await this.page.waitForTimeout(150);
      }
    } else if (otpCount === 1) {
      // Single OTP input — type full code
      await otpInputs.first().click({ timeout: 10_000 });
      await otpInputs.first().fill('');
      await this.page.keyboard.type(code, { delay: 100 });
    } else {
      // Fallback: try typing into the first visible input
      console.log('[VERIFY] No OTP inputs matched, trying first visible input');
      const firstInput = this.page.locator('input:visible').first();
      await firstInput.click({ timeout: 10_000 });
      await this.page.keyboard.type(code, { delay: 100 });
    }

    // Wait for navigation after code entry
    try {
      await this.page.waitForURL(
        url => !url.toString().includes('error=access_denied'),
        { timeout: 20_000 },
      );
      return;
    } catch {
      console.log(`[VERIFY] No auto-redirect after code entry, trying fallback`);
    }

    // Fallback: click verify/confirm link
    const verifyLink = this.page.getByText(/I.ve verified my email/i);
    if (await verifyLink.isVisible().catch(() => false)) {
      await verifyLink.click();
    }
    await this.page.waitForURL(
      url => !url.toString().includes('error=access_denied'),
      { timeout: 20_000 },
    );
  } else if (process.env.AUTH0_M2M_CLIENT_ID && process.env.AUTH0_M2M_CLIENT_SECRET) {
    // Strategy 2: Mark email verified via Auth0 Management API
    console.log(`[VERIFY] Using Auth0 API to verify ${email}...`);
    await verifyEmail(email);
    const verifiedBtn = this.page.getByRole('button', { name: /verified my email/i })
      .or(this.page.getByRole('link', { name: /verified my email/i }))
      .or(this.page.getByText(/verified my email/i));
    await verifiedBtn.click({ timeout: 10_000 });
    await this.page.waitForURL(
      url => !url.toString().includes('error=access_denied'),
      { timeout: 30_000 },
    );
  } else {
    throw new Error(
      'Email verification requires either:\n' +
      '  - GMAIL_APP_PASSWORD in .env (reads code via IMAP)\n' +
      '  - AUTH0_M2M_CLIENT_ID + AUTH0_M2M_CLIENT_SECRET in .env (verifies via API)',
    );
  }
});

// ── Account Cleanup ──

When('user delete the test account via API', async function (this: PlaywrightWorld) {
  const email = this.scenarioData['generatedEmail'] as string;
  if (!email) throw new Error('No generated email found in scenarioData');
  if (process.env.AUTH0_M2M_CLIENT_ID && process.env.AUTH0_M2M_CLIENT_SECRET) {
    await deleteUser(email);
  } else {
    console.log(`[CLEANUP] No Auth0 M2M credentials — account ${email} needs manual deletion`);
  }
});
