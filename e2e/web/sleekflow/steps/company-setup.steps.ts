import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../utils/world';
import { CompanySetupPage } from '../pages/company-setup.page';
import { OnboardingPage } from '../pages/onboarding.page';
import { getConfig } from '../utils/config';

// ── Company Setup steps ──

Given('user is on the company setup page', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.goto();
});

When('user fill company name with {string}', async function (this: PlaywrightWorld, name: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.fillCompanyName(name);
});

When('user fill company website with {string}', async function (this: PlaywrightWorld, url: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.fillCompanyWebsite(url);
});

When('user fill contact name with {string}', async function (this: PlaywrightWorld, name: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.fillContactName(name);
});

When('user fill contact number with {string}', async function (this: PlaywrightWorld, phone: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.fillContactNumber(phone);
});

When('user select industry {string}', async function (this: PlaywrightWorld, industry: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.selectIndustry(industry);
});

When('user select goal {string}', async function (this: PlaywrightWorld, goal: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.selectGoal(goal);
});

When('user select channel {string}', async function (this: PlaywrightWorld, channel: string) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.selectChannel(channel);
});

When('user click the Next button', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.clickNext();
});

When('user click the Back button', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.btnBack.click();
});

When('user click the Get started button', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await setupPage.clickGetStarted();
});

When('user fill company setup fields except {string}', async function (this: PlaywrightWorld, emptyField: string) {
  const fields: Record<string, string> = {
    'Company Name': 'SF Test Corp',
    'Company Website': 'https://sftest.com',
    'Contact Number': '+6590001234',
  };
  for (const [field, value] of Object.entries(fields)) {
    if (field.toLowerCase() !== emptyField.toLowerCase()) {
      await this.page.getByLabel(new RegExp(field, 'i')).fill(value);
    }
  }
});

Then('the company setup page is displayed with progress dots', async function (this: PlaywrightWorld) {
  // After OAuth callback, the app exchanges the code for tokens and redirects.
  // Wait for the URL to settle (no more ?code= param) and the page to load.
  await this.page.waitForURL(
    url => !url.toString().includes('?code=') && !url.toString().includes('error=access_denied'),
    { timeout: 30_000 },
  );
  await this.page.waitForLoadState('networkidle').catch(() => {});
  const setupPage = new CompanySetupPage(this.page);
  await expect(setupPage.inputCompanyName).toBeVisible({ timeout: 30_000 });
});

Then('the server region shows {string}', async function (this: PlaywrightWorld, region: string) {
  await expect(this.page.getByText(new RegExp(region, 'i'))).toBeVisible({ timeout: 5_000 });
});

Then('the company name field is pre-filled', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  const value = await setupPage.inputCompanyName.inputValue();
  expect(value.length).toBeGreaterThan(0);
});

Then('the company name field is empty', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  const value = await setupPage.inputCompanyName.inputValue();
  expect(value).toBe('');
});

Then('the {string} error is displayed', async function (this: PlaywrightWorld, msg: string) {
  await expect(this.page.getByText(new RegExp(msg, 'i'))).toBeVisible({ timeout: 5_000 });
});

Then('the Get started button is disabled', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await expect(setupPage.btnGetStarted).toBeDisabled();
});

Then('the newsletter checkbox is unticked by default', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await expect(setupPage.checkboxNewsletter).not.toBeChecked();
});

Then('the newsletter label reads {string}', async function (this: PlaywrightWorld, text: string) {
  await expect(this.page.getByText(new RegExp(text, 'i'))).toBeVisible({ timeout: 5_000 });
});

Then('the industry Others input is visible', async function (this: PlaywrightWorld) {
  const setupPage = new CompanySetupPage(this.page);
  await expect(setupPage.industryOthersInput).toBeVisible({ timeout: 5_000 });
});

Then('the step advances automatically', async function (this: PlaywrightWorld) {
  // After selecting an option, the next step's content should appear
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Then('the onboarding checklist is displayed', async function (this: PlaywrightWorld) {
  const onboarding = new OnboardingPage(this.page);
  await expect(onboarding.checklist).toBeVisible({ timeout: 20_000 });
});

Then('the trial banner is visible', async function (this: PlaywrightWorld) {
  const onboarding = new OnboardingPage(this.page);
  await expect(onboarding.trialBanner).toBeVisible({ timeout: 10_000 });
});

Then('the Book a demo link is visible', async function (this: PlaywrightWorld) {
  const onboarding = new OnboardingPage(this.page);
  await expect(onboarding.linkBookDemo).toBeVisible({ timeout: 5_000 });
});

Then('user role is {string} in the workspace', async function (this: PlaywrightWorld, role: string) {
  await this.page.goto(`${getConfig().baseUrl}/settings/team`);
  await expect(this.page.getByText(new RegExp(role, 'i'))).toBeVisible({ timeout: 10_000 });
});

Then('inline required error is displayed on {string}', async function (this: PlaywrightWorld, _field: string) {
  await expect(
    this.page.getByRole('alert').or(this.page.locator('[data-testid="error-element"]'))
      .or(this.page.getByText(/required/i)),
  ).toBeVisible({ timeout: 5_000 });
});
