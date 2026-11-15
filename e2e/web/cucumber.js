/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {Record<string, import('@cucumber/cucumber').IConfiguration>} */
const shared = {
  paths: ['sleekflow/features/**/*.feature'],
  require: [
    'sleekflow/utils/world.ts',
    'sleekflow/tests/hooks.ts',
    'sleekflow/steps/**/*.steps.ts',
  ],
  requireModule: ['ts-node/register'],
  formatOptions: { snippetInterface: 'async-await' },
  worldParameters: {},
};

module.exports = {
  sleekflow: {
    ...shared,
    parallel: 5,
    retry: 1,
    format: [
      'progress-bar',
      'json:reports/sleekflow-results.json',
      'html:reports/sleekflow-report.html',
    ],
  },
  'ci-smoke': {
    ...shared,
    tags: '@smoke and @critical',
    parallel: 1,
    retry: 0,
    format: [
      'progress-bar',
      'json:reports/ci-smoke-results.json',
      'html:reports/ci-smoke-report.html',
    ],
  },
};
