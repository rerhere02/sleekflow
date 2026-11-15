# Analysis: sleekflow-login-signup-005-existing-email-signup

## AC Extraction

| AC | Text | Type |
|---|---|---|
| AC1 | Current behavior: existing email silently moves to password step; result after password submission not tested | Current State / Bug |
| AC2 | Per decision D1: the chosen behavior happens; account owner notified by email if D1(a) is chosen. D1(a) = same screen + email notification to owner; D1(b) = on-screen message with sign-in link | Decision-Dependent / P1-5 |

## SFDIPOT Risk Scan

| Dimension | Risk | Severity |
|---|---|---|
| **Structure** | No existing UI distinguishes duplicate email from new email at step 1 | High |
| **Function** | Current silent progression to password step; Auth0 error appears after password submission | Critical |
| **Data** | Existing email submitted to sign-up flow; account enumeration risk (D1a preserves no-enum stance) | Critical |
| **Integration** | Auth0 shows "We couldn't complete your registration..." after password step (live-tested) | High |
| **Potential** | Account enumeration: D1(b) reveals account existence; D1(a) is security-safe | Critical |
| **Operations** | Email notification to real account owner if D1(a) | High |
| **Time** | Unicode character U+2019 in Auth0 error message (right-single-quote) — display rendering risk | Low |

## Coverage Plan (4 TCs — TC-231 to TC-234)

| TC-ID | Title | AC(s) | Priority | Tags |
|---|---|---|---|---|
| TC-231 | Sign-up flow advances to password step when existing email is entered | AC1 | High | functionality, regression |
| TC-232 | Auth0 registration failure message is displayed after password is submitted for an existing email | AC1 | High | negative, regression |
| TC-233 | Defined D1 behavior is applied when existing email is used at sign-up | AC2 | High | functionality, regression |
| TC-234 | Account owner receives email notification when existing email is used in sign-up under D1(a) | AC2 | High | functionality |

## Notes / Flags

- AC2 is blocked by BLOCKING TBD D1. TC-233 and TC-234 are Manual until Product + Security decide.
- TC-231 and TC-232 cover observable current behavior (Auth0 silent progression + post-password error), which is testable now.
- Auth0 error message contains Unicode right-single-quote (U+2019) — exact string: "We couldn't complete your registration. Please try again or contact us for support." — this should be verified for correct rendering.
