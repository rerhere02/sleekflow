#!/usr/bin/env node
/**
 * Generates an HTML report from Cucumber JSON output.
 * Usage: node scripts/generate-report.mjs [--profile sleekflow]
 */
import * as reporter from 'multiple-cucumber-html-reporter';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const profile = process.argv.includes('--profile')
  ? process.argv[process.argv.indexOf('--profile') + 1]
  : 'sleekflow';

const jsonFile = path.resolve(`reports/${profile}-results.json`);
const reportDir = path.resolve(`reports/${profile}-html`);

if (!fs.existsSync(jsonFile)) {
  console.error(`JSON report not found: ${jsonFile}`);
  console.error('Run tests first: npm run test');
  process.exit(1);
}

reporter.generate({
  jsonDir: path.dirname(jsonFile),
  reportPath: reportDir,
  pageTitle: `${profile} E2E Report`,
  reportName: `${profile} E2E Test Report`,
  displayDuration: true,
  displayReportTime: true,
  metadata: {
    browser: { name: 'chromium', version: 'latest' },
    device: process.platform,
    platform: { name: process.platform, version: os.release() },
  },
  customData: {
    title: 'Run Info',
    data: [
      { label: 'Project', value: 'SleekFlow Auth0 E2E' },
      { label: 'Profile', value: profile },
      { label: 'Environment', value: process.env.ENV || 'stg' },
      { label: 'Executed', value: new Date().toISOString() },
    ],
  },
});

console.log(`HTML report generated: ${reportDir}/index.html`);
