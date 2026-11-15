# SleekFlow QA

End-to-end test automation and QA artifacts for SleekFlow.

## Structure

```
├── e2e/web/               # Playwright + Cucumber E2E test suite
│   ├── sleekflow/         # Page objects, step definitions, features
│   ├── shared/            # Reusable components (AuthComponent)
│   └── .github/workflows/ # CI/CD pipeline
└── outputs/               # QA analysis artifacts
    └── sleekflow-login-signup/
        ├── *.csv          # Test cases by module
        ├── *_analysis.md  # PRD analysis per feature area
        ├── *_traceability-matrix.md
        ├── *_test-data-plan.md
        └── *_effort-sizing.md
```

## E2E Tests

Cucumber BDD + Playwright tests covering Auth0 login/signup, password reset, social OAuth, session management, accessibility, responsive layout, and full signup-to-onboarding journey.

### Quick Start

```bash
cd e2e/web
npm install
npx playwright install chromium
cp .env.example .env  # Fill in credentials
npm test              # Run all tests
npm run report        # Generate HTML report
```

### Key Numbers

- **47 scenarios** across 2 feature files (login + signup)
- **216 steps** with parallel execution (5 workers)
- **~2.5 min** full suite runtime

See [e2e/web/README.md](e2e/web/README.md) for detailed setup, tags, architecture, and CI/CD docs.

## QA Artifacts

The `outputs/` directory contains test case planning and analysis generated from the SleekFlow login/signup PRD:

| File | Description |
|---|---|
| `TC_*.csv` | Test cases grouped by module (Login, Signup, Password Reset, etc.) |
| `*_analysis.md` | Detailed PRD analysis per feature area |
| `*_traceability-matrix.md` | Requirements-to-test-case mapping |
| `*_test-data-plan.md` | Test data requirements and setup |
| `*_effort-sizing.md` | Effort estimates per test area |
| `*_exploratory-charters.md` | Exploratory testing session charters |
| `*_nfr-checklist.md` | Non-functional requirements checklist |
