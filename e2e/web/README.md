# SleekFlow E2E Tests

Cucumber BDD + Playwright end-to-end tests for SleekFlow's Auth0-based authentication flows and onboarding wizard.

## Stack

- **Cucumber** (`@cucumber/cucumber ^10.3`) — BDD test runner
- **Playwright** (`@playwright/test ^1.44`) — browser automation
- **TypeScript** + `ts-node`

## Project Structure

```
e2e/web/
├── cucumber.js                 # Cucumber profiles (sleekflow, ci-smoke)
├── package.json
├── tsconfig.json
├── .env.example                # Environment variable template
├── .github/workflows/e2e.yml  # CI/CD pipeline
├── scripts/
│   └── generate-report.mjs    # HTML report generator
├── shared/
│   └── components/
│       └── auth.component.ts  # Reusable auth flows (login, logout)
└── sleekflow/
    ├── features/              # 2 feature files, ~25 scenarios
    │   ├── login.feature      # Login, logout, session, password reset, social, a11y, responsive
    │   └── signup.feature     # Signup identifier/password, OAuth, existing email, full E2E journey
    ├── pages/                 # Page Object Models
    │   ├── base.page.ts
    │   ├── login.page.ts
    │   ├── signup.page.ts
    │   ├── forgot-password.page.ts
    │   ├── company-setup.page.ts
    │   ├── verification.page.ts
    │   └── onboarding.page.ts
    ├── steps/                 # Step definitions
    │   ├── common.steps.ts    # Shared: navigation, form input, assertions
    │   ├── login.steps.ts     # Login-specific steps
    │   ├── signup.steps.ts    # Signup, email verification, account cleanup
    │   ├── company-setup.steps.ts
    │   ├── password-reset.steps.ts
    │   └── localization.steps.ts  # A11y, responsive, locale
    ├── utils/
    │   ├── config.ts          # Env-based configuration (stg/prod)
    │   ├── world.ts           # PlaywrightWorld (Cucumber World + Playwright)
    │   ├── auth0.ts           # Auth0 ULP helper locators
    │   ├── auth0-mgmt.ts      # Auth0 Management API (delete test users)
    │   ├── gmail-reader.ts    # Gmail IMAP — reads verification codes
    │   └── test-constants.ts  # Test email generator, seed accounts
    ├── tests/
    │   └── hooks.ts           # BeforeAll login-once, Before/After lifecycle
    └── factories/
        └── factory-helpers.ts # Cleanup manifest helpers
```

## Setup

```bash
cd e2e/web
npm install
npx playwright install chromium
cp .env.example .env  # Fill in credentials
```

## Running Tests

```bash
# Full suite (staging)
npm test

# Full suite (production — excludes @staging-only)
npm run test:prod

# CI smoke — critical happy paths only
npm run ci:smoke

# By tag
npm run test:tag -- '@TC-198'
npm run test:tag -- '@regression and @critical'

# Headed mode (watch the browser)
HEADLESS=false npm test
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ENV` | No | `stg` (default) or `prod` |
| `TEST_EMAIL` | Yes | Login test account email |
| `TEST_PASSWORD` | Yes | Login test account password |
| `HEADLESS` | No | `true` (default) or `false` for headed mode |
| `GMAIL_APP_PASSWORD` | For verify | Gmail app password for reading OTP codes via IMAP |
| `AUTH0_M2M_CLIENT_ID` | For cleanup | Auth0 M2M client ID — auto-deletes test accounts |
| `AUTH0_M2M_CLIENT_SECRET` | For cleanup | Auth0 M2M client secret |

## Tags

| Tag | Purpose |
|---|---|
| `@smoke` | CI smoke subset |
| `@critical` / `@high` / `@medium` / `@low` | Priority |
| `@regression` | Full regression suite |
| `@prod-safe` | Safe to run against production |
| `@staging-only` | Requires staging environment |
| `@no-auth` | Needs clean browser (no saved auth state) |
| `@creates-account` | Creates a real account (triggers cleanup hook) |
| `@serial` | Must not run in parallel |

## Architecture

### Three-Layer Reuse

```
shared/components/     → Cross-project reusable logic (AuthComponent)
sleekflow/pages/       → Page Objects (locators + UI actions)
sleekflow/steps/       → Cucumber step definitions (thin glue)
```

### Auth Flow

1. **Login-once** (`BeforeAll`): Logs in with `TEST_EMAIL`, saves state to `.auth/`
2. **Per-scenario** (`Before`): Fresh browser context. Loads saved auth unless `@no-auth`
3. **Cleanup** (`After @creates-account`): Logs emails, auto-deletes via Auth0 M2M API
4. **Screenshot on failure** (`After`): Attaches full-page screenshot to report

### Parallel Execution

Default profile runs `parallel: 5`. Scenarios tagged `@serial` run sequentially (shared Gmail IMAP, session mutation).

## CI/CD

GitHub Actions workflow at `.github/workflows/e2e.yml`:
- **Push/PR**: Smoke tests on PRs, full suite on main/develop
- **Nightly**: Regression suite Mon–Fri 2am UTC
- **Manual**: Choose environment, profile, and tag filter
- **Reports**: Cucumber JSON + HTML uploaded as artifacts
- **Slack**: Notification with pass/fail counts and link to run

## Reports

```bash
npm run report           # Generate HTML from last test run
npm run test:report      # Run tests + generate report
```
