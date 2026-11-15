import { World, IWorldOptions, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

// Auth0 redirects can take 10-30s; 90s covers wizard flows
setDefaultTimeout(90_000);

export interface ScenarioData {
  [key: string]: unknown;
}

export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  scenarioData: ScenarioData = {};

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(PlaywrightWorld);
