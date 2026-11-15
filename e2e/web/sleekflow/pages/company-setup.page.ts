import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getConfig } from '../utils/config';

/**
 * Company Setup — 6-step wizard at /en/register-company.
 * Step 1: Company name + website
 * Step 2: Industry (10 options)
 * Step 3: Goal (5 options)
 * Step 4: Main channel + other channels
 * Step 5: Apps to connect
 * Step 6: Contact name + phone + newsletter
 */
export class CompanySetupPage extends BasePage {
  // Step indicators
  readonly progressDots: Locator;
  readonly serverRegion: Locator;
  readonly btnNext: Locator;
  readonly btnBack: Locator;
  readonly btnGetStarted: Locator;
  // Step 1
  readonly inputCompanyName: Locator;
  readonly inputCompanyWebsite: Locator;
  // Step 2
  readonly industryOptions: Locator;
  readonly industryOthersInput: Locator;
  // Step 3
  readonly goalOptions: Locator;
  // Step 4
  readonly channelOptions: Locator;
  // Step 6
  readonly inputContactName: Locator;
  readonly inputContactNumber: Locator;
  readonly countryPicker: Locator;
  readonly checkboxNewsletter: Locator;
  // Errors
  readonly errorRequired: Locator;
  readonly errorWebsite: Locator;
  readonly errorPhone: Locator;

  constructor(page: Page) {
    super(page);
    this.progressDots = page.locator('[class*="progress"], [class*="stepper"], [class*="dot"]');
    this.serverRegion = page.getByText(/server region|singapore/i);
    this.btnNext = page.getByRole('button', { name: /next|continue/i });
    this.btnBack = page.getByRole('button', { name: /back/i });
    this.btnGetStarted = page.getByRole('button', { name: /get started/i });
    // Step 1 — MUI inputs have no <label>, use name attribute
    this.inputCompanyName = page.locator('input[name="companyName"]');
    this.inputCompanyWebsite = page.locator('input[name="companyWebsite"]');
    // Step 2
    this.industryOptions = page.getByRole('button').or(page.getByRole('radio'));
    this.industryOthersInput = page.getByPlaceholder(/specify.*industry/i)
      .or(page.getByLabel(/specify.*industry/i));
    // Step 3
    this.goalOptions = page.getByRole('button').or(page.getByRole('radio'));
    // Step 4
    this.channelOptions = page.getByRole('button').or(page.getByRole('checkbox'));
    // Step 6 — MUI inputs use name attribute, not labels
    this.inputContactName = page.locator('input[name="personalName"]')
      .or(page.locator('input[name="contactName"]'));
    this.inputContactNumber = page.locator('input[type="tel"]').first();
    this.countryPicker = page.getByRole('combobox')
      .or(page.locator('[class*="country"]'));
    this.checkboxNewsletter = page.locator('input[type="checkbox"]')
      .or(page.getByLabel(/product news|newsletter/i));
    // Errors
    this.errorRequired = page.getByText(/required/i);
    this.errorWebsite = page.getByText(/valid website url|valid url/i);
    this.errorPhone = page.getByText(/valid phone number/i);
  }

  async goto(): Promise<void> {
    await this.page.goto(`${getConfig().baseUrl}/en/register-company`, { waitUntil: 'commit' });
    await this.inputCompanyName.or(this.progressDots.first()).waitFor({ timeout: 15_000 });
  }

  async fillCompanyName(name: string): Promise<void> {
    await this.inputCompanyName.fill(name);
  }

  async fillCompanyWebsite(url: string): Promise<void> {
    await this.inputCompanyWebsite.fill(url);
  }

  async fillContactName(name: string): Promise<void> {
    await this.inputContactName.fill(name);
  }

  async fillContactNumber(phone: string): Promise<void> {
    await this.inputContactNumber.click();
    await this.inputContactNumber.pressSequentially(phone, { delay: 50 });
  }

  private async clickChip(label: string): Promise<void> {
    // MUI SelectableChip — wait for visible, then click
    const chip = this.page.getByRole('button', { name: new RegExp(label, 'i') });
    await chip.waitFor({ state: 'visible', timeout: 15_000 }).catch(async () => {
      // Debug: log what buttons are actually on the page
      const btns = await this.page.getByRole('button').allTextContents();
      const headings = await this.page.locator('h1, h2, h3, h4, h5').allTextContents();
      console.log(`[SETUP] Looking for "${label}" — headings: ${JSON.stringify(headings)}, buttons: ${JSON.stringify(btns)}`);
    });
    await chip.click();
  }

  async selectIndustry(label: string): Promise<void> {
    await this.clickChip(label);
  }

  async selectGoal(label: string): Promise<void> {
    await this.clickChip(label);
  }

  async selectChannel(label: string): Promise<void> {
    await this.clickChip(label);
  }

  async clickNext(): Promise<void> {
    // Capture current heading to detect page change
    const headingBefore = await this.page.locator('h1, h2, h3, h4, h5').first().textContent().catch(() => '');
    try {
      await this.btnNext.waitFor({ state: 'visible', timeout: 5_000 });
      await this.btnNext.click();
    } catch {
      // Step auto-advanced — no Next button needed
      return;
    }
    // Wait for wizard step to change (heading text changes)
    await this.page.waitForFunction(
      (prev) => {
        const h = document.querySelector('h1, h2, h3, h4, h5');
        return h && h.textContent !== prev;
      },
      headingBefore,
      { timeout: 10_000 },
    ).catch(() => {});
  }

  async clickGetStarted(): Promise<void> {
    await this.btnGetStarted.click();
  }
}
