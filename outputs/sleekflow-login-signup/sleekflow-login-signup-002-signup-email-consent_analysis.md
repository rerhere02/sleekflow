# Analysis: sleekflow-login-signup-002-signup-email-consent

## Extracted Acceptance Criteria

| ID | AC | Type |
|---|---|---|
| AC1 | Step 1 "Create your account": email field (required) + unticked consent checkbox with Terms of Service and Privacy Policy label (SU-01) | Structure/Functionality |
| AC2 | Empty email → "Please enter an email address"; malformed email → "Email is not valid." (SU-02) | Negative — validation |
| AC3 | Missing consent (current behavior): label turns red + screen-reader-only "This is required" — no visible error text (SU-02) | Current behavior description |
| AC4 | P0-2: Unticked Terms on submit → visible error "Please accept the Terms of Service and Privacy Policy to continue." under checkbox; focus moves to checkbox; live region announces same text | P0 — positive fix |
| AC5 | P0-3: Disposable email (e.g. yopmail.com, mailinator.com) → sign-up denied with "Please use a work or personal email address. Temporary email addresses can't be used."; nothing created; blocklist updated monthly | P0 — negative/security |
| AC6 | Current behavior: existing account email moves to password step with no notice (SU-03) | Current behavior — implicit functionality |
| AC7 | Current behavior: disposable addresses currently accepted (SU-04 — to be blocked by P0-3) | Current behavior — negative guard |
| AC8 | P2-2 (future): validate email format on blur, not only on submit | Future/UX enhancement |

## SFDIPOT Risk Scan

| Heuristic | Risk |
|---|---|
| **S**tructure | Two elements on page: email field + consent checkbox; both required; custom-styled checkbox (opacity:0) |
| **F**unction | Email format validation, consent gate, disposable email blocklist, existing-account handling, blur validation |
| **D**ata | Valid email, malformed email, empty email, disposable email domain, existing account email |
| **I**nterface | Hidden checkbox (#terms-of-service, opacity:0); live region for accessibility; focus management on error |
| **P**latform | Web (sso.sleekflow.io/u/signup/identifier); different HTML ID from login (#email vs #username) |
| **O**perations | Submit without consent, submit with consent, blur away from email field |
| **T**ime | Blocklist updated monthly — timing risk around update cycles |

## Risk Signals

- **Accessibility** (AC4): focus management + live region for consent error — high correctness risk
- **Disposable email blocking** (AC5): security/integrity — blocklist scope not fully defined (open item)
- **Custom-styled checkbox** (AC3/AC4): opacity:0 element — automation risk (may need JS click)
- **Social connections bypass** (Context note): P0-3 does NOT run for Google/Apple social signup — out of scope here but flag risk
- **Existing account** (AC6): no enumeration notice — intentional design but needs test

## Test Cases Planned

| TC | Coverage | Priority | Tags |
|---|---|---|---|
| TC-199 | Sign-up page loads with email field and unticked consent checkbox | Medium | positive, sanity, auth, onboarding |
| TC-200 | Next step reached when valid email and ticked consent are submitted | Critical | positive, sanity, regression, auth, onboarding |
| TC-201 | Empty email shows "Please enter an email address" | High | negative, regression, auth, onboarding |
| TC-202 | Malformed email shows "Email is not valid." | High | negative, regression, auth, onboarding |
| TC-203 | Visible error shown under consent checkbox when Terms not accepted on submit (P0-2) | High | negative, regression, auth, onboarding |
| TC-204 | Focus moves to consent checkbox and live region announces error when Terms not accepted (P0-2 accessibility) | High | functionality, regression, auth, onboarding |
| TC-205 | Disposable email domain is rejected with correct error and no account created (P0-3) | High | negative, regression, auth, onboarding |
| TC-206 | Well-known legitimate email domain is accepted and not rejected as disposable | Medium | positive, sanity, auth, onboarding |
| TC-207 | Existing account email advances to password step with no account-existence notice | Medium | functionality, regression, auth, onboarding |
| TC-208 | Sign-up is denied when both email is disposable AND consent is unchecked | Medium | negative, auth, onboarding |
| TC-209 | Terms of Service and Privacy Policy links in consent label are navigable | Low | functionality, auth, onboarding |
| TC-210 | Email format error is shown on blur before form submission when blur validation is active (P2-2 future) | Medium | functionality, auth, onboarding |
