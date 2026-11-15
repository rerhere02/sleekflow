# Analysis: sleekflow-login-signup-004-social-signup

## AC Extraction

| AC | Text | Type |
|---|---|---|
| AC1 | Google and Apple buttons appear on both identifier screens (login and sign-up); social sign-up shows no consent checkbox | Structure / UI |
| AC2 | New social users go to company setup; returning social users go to the app | Routing / Navigation |
| AC3 | First-time social sign-in: consent is recorded with timestamp and Terms version — either via implied consent text under buttons (Legal option a) or required checkbox on first in-app screen (Legal option b) | Compliance / Consent |

## SFDIPOT Risk Scan

| Dimension | Risk | Severity |
|---|---|---|
| **Structure** | Google and Apple buttons on both login and sign-up screens; no consent checkbox on social sign-up | High |
| **Function** | OAuth delegation to Google/Apple; routing logic new vs returning user | Critical |
| **Data** | Consent timestamp and Terms version recording; absence of consent checkbox means implied consent path | High |
| **Integration** | Google OAuth, Apple OAuth; Auth0 Pre-User Registration Action does NOT fire for social | High |
| **Potential** | No consent checkbox — compliance risk if Legal does not approve implied consent; email matching with existing password account unknown | High |
| **Operations** | Returning user recognized correctly; new user routed to company setup | High |
| **Time** | Consent timestamp accuracy | Medium |

## Coverage Plan (7 TCs — TC-224 to TC-230)

| TC-ID | Title | AC(s) | Priority | Tags |
|---|---|---|---|---|
| TC-224 | Google and Apple sign-up buttons are displayed on both the login and sign-up identifier screens | AC1 | High | positive, sanity, regression |
| TC-225 | Company setup screen is shown after first-time Google sign-up | AC2 | Critical | positive, sanity, regression |
| TC-226 | App dashboard is shown after returning Google user signs in | AC2 | Critical | positive, sanity, regression |
| TC-227 | Company setup screen is shown after first-time Apple sign-up | AC2 | High | positive, sanity, regression |
| TC-228 | No consent checkbox is displayed on the social sign-up screen | AC1 | High | functionality, regression |
| TC-229 | Consent is recorded with timestamp and Terms version after first-time social sign-in | AC3 | High | functionality, regression |
| TC-230 | Social sign-up consent path is flagged as pending Legal decision | AC3 | Medium | functionality |

## Notes / Flags

- AC3 is blocked by TBD D2 (Legal must decide implied consent vs checkbox). TC-229 and TC-230 are set to Manual to flag this.
- Open item: email matching with existing password-based account is not covered (unknown behavior per ticket). A placeholder negative TC is not generated — this will be addressed once D1/D2 is resolved.
- TC-226 covers Apple returning user implicitly — a separate TC for Apple returning user is deferred since the routing logic is identical.
