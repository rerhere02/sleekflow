# Analysis: sleekflow-login-signup-000-auth-error-handling

## Extracted Acceptance Criteria

| ID | AC | Type |
|---|---|---|
| AC1 | Stale/expired auth link (bookmarked, refreshed mid-login, tab open 2+ hours) → lands on working login screen or app if already signed in; NEVER shows `invalid_request` | P0 — positive + negative |
| AC2 | Current broken behavior: login page opened without valid `state` shows "Oops!, something went wrong" + `invalid_request` + tracking ID — after fix this MUST NOT occur | LG-11 — negative (regression guard) |

## SFDIPOT Risk Scan

| Heuristic | Risk |
|---|---|
| **S**tructure | Auth0 `state` parameter present/absent in URL — URL manipulation risk |
| **F**unction | Recovery logic must branch: already signed-in → app; not signed-in → login screen |
| **D**ata | Session state: valid, stale (2+ hours), absent (bookmarked with no state at all) |
| **I**nterface | Covers all auth pages: login, sign-up, reset, verification |
| **P**latform | Web (Auth0 Universal Login); redirects across browser sessions |
| **O**perations | Tab left open, page refresh mid-flow, copied/shared URL with stale state |
| **T**ime | Exact threshold TBD ("2+ hours") — boundary risk; test with clearly expired and freshly opened |

## Risk Signals

- **Authentication / session state** (§7): expired session, invalid token → increase coverage depth
- State parameter absent entirely vs. stale but present are two distinct data states → separate TCs
- Fix is infrastructure-level (Auth0 config) → regression guard critical post-deploy

## Test Cases Planned

| TC | Coverage | Priority | Tags |
|---|---|---|---|
| TC-179 | Stale auth link recovers to login screen (happy path post-fix) | Critical | positive, sanity, regression, auth |
| TC-180 | Already-signed-in user opening stale auth link goes directly to app | High | positive, sanity, regression, auth |
| TC-181 | `invalid_request` error page no longer displayed after fix (regression guard) | High | negative, regression, auth |
| TC-182 | Stale state applies to all auth pages (sign-up, reset, verify) | Medium | functionality, regression, auth |
