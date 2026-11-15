# Analysis: sleekflow-login-signup-006-email-verification

## AC Extraction

| AC | Text |
|---|---|
| AC1 | "Confirm your email address" at app.sleekflow.io: masked email display; 6-digit code input (inputmode=numeric, autocomplete=one-time-code) or email link verification. |
| AC2 | Page shows: "Open Gmail", "Open Outlook" quick links, "Resend code", "I've verified my email", and Sign out options. |

## SFDIPOT Risk Scan

| Dimension | Risk |
|---|---|
| Structure | Verification page lives on app domain (not Auth0) — depends on redirect with error param. |
| Function | Two distinct paths: code entry vs email link. Both must be tested independently. |
| Data | 6-digit numeric code only (inputmode=numeric). OTP expiry TBD — flag in test case. autocomplete=one-time-code is a browser hint. |
| Interface | Email masking format unspecified — observable UI claim. Quick links to external apps. |
| Platform | Web (app.sleekflow.io). |
| Operations | Resend code (rate limit TBD), sign out mid-verification, "I've verified my email" before actually verifying. |
| Time | Code/link expiry unspecified per open items — flag as Manual. |

## Risk Signals

- Auth flow: session state if user signs out mid-verification (High risk).
- "I've verified my email" without actually verifying — open item, should be tested (negative).
- Resend code — rate limit TBD, but the action itself is testable.

## Test Case Plan (TC-241 to TC-246)

| TC | Title Summary | AC | Priority | Tags |
|---|---|---|---|---|
| TC-241 | Verification screen is displayed with masked email and 6-digit code input after signup | AC1 | Critical | positive, sanity, regression, auth, onboarding |
| TC-242 | Email is verified and user proceeds to setup when valid 6-digit code is submitted | AC1 | Critical | positive, sanity, regression, auth, onboarding |
| TC-243 | Error is shown when an invalid 6-digit code is submitted | AC1 | High | negative, regression, auth |
| TC-244 | All action buttons are present on the verification screen | AC2 | Medium | positive, sanity, onboarding |
| TC-245 | Email is verified when user clicks the link in the verification email | AC1 | High | positive, sanity, regression, auth |
| TC-246 | User is returned to sign-in after clicking Sign out on the verification screen | AC2 | Medium | functionality, regression, auth |
