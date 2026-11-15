# Analysis: sleekflow-login-signup-003-signup-password

## AC Extraction

| AC | Text | Type |
|---|---|---|
| AC1 | Step 2 UI: email read-only + Edit link, password field (new-password) with show/hide toggle, checklist with 5 criteria (8 chars, lower, upper, numbers, special chars) | Structure / UI |
| AC2 | Step 2 has a hidden, required "Username" field | Structure / Hidden Field |
| AC3 | Left panel: "Turn customer conversations into revenue", Unified Inbox, AI agents, "Trusted by 2,000+ businesses" | Structure / Static Content |
| AC4 | Back button from step 2 to step 1 works without error | Navigation |
| AC5 | Empty username shows "Username is required" (in-page, hidden field) | Validation / Error |
| AC6 | Empty or weak password shows "Password is required" / "The password is too weak" | Validation / Error |
| AC7 | Password and username rules must align between product UI and Help Center docs (contradiction: "alphanumeric only + 3 of 4 types" vs product showing all 5 required) | Risk / Documentation |
| AC8 | Document or remove hidden required "Username" field — unknown purpose | Risk / Discovery |

## SFDIPOT Risk Scan

| Dimension | Risk | Severity |
|---|---|---|
| **Structure** | Password checklist rendered at correct step; email field read-only; show/hide toggle present | Medium |
| **Function** | Real-time checklist updates; validation fires on submit; back navigation works | High |
| **Data** | Contradiction between product (5 criteria required) vs Help Center (3 of 4); boundary at each criterion | Critical |
| **Integration** | Auth0 `sso.sleekflow.io/u/signup/password`; `#password` HTML ID; hidden `username` field interaction | High |
| **Potential** | Hidden required username field — unknown purpose could be security or tracking bypass risk | High |
| **Operations** | Back navigation preserves state; no error on return | Medium |
| **Time** | Real-time checklist debounce (typing) | Low |

## Coverage Plan (13 TCs — TC-211 to TC-223)

| TC-ID | Title | AC(s) | Priority | Tags |
|---|---|---|---|---|
| TC-211 | Password step UI renders correctly when user arrives from email consent step | AC1 | Medium | positive, sanity |
| TC-212 | Real-time password checklist updates when user types in password field | AC1 | High | functionality, sanity, regression |
| TC-213 | Show/hide toggle reveals and masks password text when clicked | AC1 | Medium | functionality, sanity |
| TC-214 | Email field is non-editable and Edit link is present on password step | AC1 | Medium | functionality, sanity |
| TC-215 | Left panel static content is displayed correctly on password step | AC3 | Low | positive |
| TC-216 | Step 2 navigates back to step 1 without error when Back button is clicked | AC4 | High | positive, sanity, regression |
| TC-217 | "Password is required" error appears when password field is submitted empty | AC6 | High | negative, regression |
| TC-218 | "The password is too weak" error appears when password does not meet complexity rules | AC6 | High | negative, regression |
| TC-219 | Password is accepted when all 5 criteria are satisfied | AC1, AC6 | Critical | positive, sanity, regression |
| TC-220 | "Username is required" error appears when hidden username field is not auto-populated | AC5 | High | negative, regression |
| TC-221 | Sign-up proceeds without error when hidden username field is auto-populated | AC2, AC5 | High | positive, sanity, regression |
| TC-222 | Password step enforces 5 criteria while Help Center describes 3-of-4 (contradiction documented) | AC7 | Medium | functionality |
| TC-223 | Hidden username field existence and purpose are discoverable in page source | AC2, AC8 | Medium | functionality |

## Notes / Flags

- AC7 (P1-7) and AC8 (P2-4) are risk/documentation items. TCs 222 and 223 are set to `Manual` to flag and track the contradiction until resolved.
- TC-218 covers the weak password path; combined with TC-219 (success), these cover the full validation boundary.
- Password rules contradiction: tested against product UI rules (all 5 required) per the warning in the ticket. TC-222 explicitly flags the discrepancy.
