# Ticket 009 — Password Reset: Analysis

## Extracted Acceptance Criteria

| AC | Summary |
|---|---|
| AC1 | "Forgot your password?" link opens reset form with EMAIL field pre-filled, "Send link" and "Back" buttons (PR-01) |
| AC2 | ANY input (including "not an email") lands on "Check Your Email" page with "Resend email" — no enumeration, no validation (PR-02 — current state) |
| AC3 | No URL in the flow contains the email or username (security fix P1-1) |
| AC4 | Invalid email or value with spaces shows inline error and no request is sent (P1-2) |
| AC5 | Broken pattern message with empty placeholders must be fixed (P1-2) |

## SFDIPOT Risk Scan

| Dimension | Risk | Notes |
|---|---|---|
| **Structure** | High | Email pre-fill in URL = PII exposure; URL logging risk |
| **Function** | High | Form accepts any input currently; validation entirely absent |
| **Data** | High | Email in URL is a personal data exposure (GDPR/PDPA concern) |
| **Interface** | Medium | "Back" button, pre-fill correctness, Resend email link |
| **Platform** | Low | Web only; standard browser URL caching/history risk amplifies AC3 |
| **Operations** | Medium | Error messages with empty placeholders: broken UX |
| **Time** | Low | Reset link expiry not defined (open TBD) |

## Risk Flags

- **Security — PII in URL (AC3):** Email appears in password-reset URL → browser history, server logs, referrer headers. High priority.
- **Missing validation (AC4/AC5):** Any string accepted; broken error message with empty placeholders.
- **TBD: Auth0 may not support URL removal** — test should be marked Manual until spike complete.
- **No link expiry specified** — cannot test expiry; note as limitation.

## Test Case Plan (TC-276 to TC-285)

| TC | AC | Title (draft) | Priority | Tags |
|---|---|---|---|---|
| TC-276 | AC1 | Reset form is displayed with pre-filled email when "Forgot your password?" link is clicked | Critical | positive, sanity, regression, auth |
| TC-277 | AC1 | Login page is displayed when Back is clicked on the reset form | Medium | positive, sanity, auth |
| TC-278 | AC3 | No email or username appears in any URL when the password-reset flow is initiated | High | functionality, regression, auth |
| TC-279 | AC4 | Inline error is shown and no request is sent when a non-email value is submitted on the reset form | High | negative, regression, auth |
| TC-280 | AC4 | Inline error is shown and no request is sent when a value with spaces is submitted on the reset form | Medium | negative, regression, auth |
| TC-281 | AC5 | Error message contains no empty placeholders when invalid input is submitted on the reset form | High | functionality, regression, auth |
| TC-282 | AC2 | "Check Your Email" page is shown after any valid-format email is submitted | Critical | positive, sanity, regression, auth |
| TC-283 | AC2 | "Resend email" link is present on the Check Your Email page | Medium | positive, sanity, auth |
| TC-284 | AC4 | Reset form accepts a valid email format and proceeds to Check Your Email page | Critical | positive, sanity, regression, auth |
| TC-285 | AC1,AC4 | Empty submission on the reset form shows "Email is required" error | Medium | negative, regression, auth |
