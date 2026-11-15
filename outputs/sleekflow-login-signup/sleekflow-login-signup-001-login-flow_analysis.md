# Analysis: sleekflow-login-signup-001-login-flow

## Extracted Acceptance Criteria

| ID | AC | Type |
|---|---|---|
| AC1 | Step 1 "Welcome back": single field "Email or username", required, autofocus on load, autocomplete=email (LG-01) | Structure/Functionality |
| AC2 | Empty submit on identifier step → "Email address or username is required" (LG-02) | Negative — validation |
| AC3 | Username rules: 5–128 chars; letters, digits, `_ + - . ! # $ ^ \` ~ @ '`; server-side check (LG-03) | Negative — validation |
| AC4 | Any well-formed email advances to password step regardless of account existence (no enumeration) (LG-04) | Positive + Security |
| AC5 | "Sign up" link preserves session state and ui_locales; Google + Apple buttons under "OR" (LG-05) | Functionality/Navigation |
| AC6 | Left panel: 4-slide product carousel; hides or moves below form at ≤1000px viewport width (LG-06) | Responsive UI |
| AC7 | Step 2 "Sign in to continue": identifier read-only + Edit link; password field with show/hide toggle; "Reset password" link; "Keep me signed in" checked by default; no social buttons (LG-07) | Structure/Functionality |
| AC8 | Empty password submit → "Password is required" (LG-08) | Negative — validation |
| AC9 | Wrong password → generic error message; repeated failures throttled (LG-09) | Negative — security |
| AC10 | 2FA: if company enforces it for user's role → 6-digit authenticator code step appears after password (LG-10) | Conditional functionality |

## SFDIPOT Risk Scan

| Heuristic | Risk |
|---|---|
| **S**tructure | Two-step form; each step has distinct fields and buttons; identifier/password steps are independent screens |
| **F**unction | Identifier validation, password validation, session-state preservation, throttling, 2FA gate |
| **D**ata | Email vs. username inputs; valid/invalid/empty; username boundary (5 chars, 128 chars, 129 chars); special characters |
| **I**nterface | Autocomplete attribute, autofocus, show/hide password toggle, read-only identifier on step 2 |
| **P**latform | Web (sso.sleekflow.io); responsive breakpoint at 1000px |
| **O**perations | Edit identifier from step 2 (back navigation while preserving state); session persistence ("Keep me signed in") |
| **T**ime | Session throttle timing TBD; "Keep me signed in" session duration TBD |

## Risk Signals

- **No account enumeration** (AC4): security-critical — wrong email must NOT reveal non-existence
- **Throttling** (AC9): security — lockout threshold TBD (flag as Manual/open item)
- **State preservation** (AC5): cross-flow integration risk
- **2FA conditional** (AC10): role-based conditional logic
- **Autocomplete/autofocus** (AC1): accessibility & UX correctness

## Test Cases Planned

| TC | Coverage | Priority | Tags |
|---|---|---|---|
| TC-183 | Identifier step loads with autofocus on email/username field | Medium | positive, sanity, auth |
| TC-184 | Valid email advances to password step (happy path) | Critical | positive, sanity, regression, auth |
| TC-185 | Valid username advances to password step | High | positive, sanity, regression, auth |
| TC-186 | Empty identifier submit shows required error | High | negative, regression, auth |
| TC-187 | Invalid username (too short, disallowed chars) blocked server-side | Medium | negative, regression, auth |
| TC-188 | Non-existent email still advances to password step (no enumeration) | High | negative, regression, auth, security |
| TC-189 | Sign-up link from identifier step preserves state and ui_locales | Medium | functionality, regression, auth |
| TC-190 | Carousel is hidden or reflows below form at ≤1000px | Low | functionality, auth |
| TC-191 | Password step shows correct UI elements (read-only identifier, Edit, show/hide, Reset, KMSI) | High | positive, sanity, regression, auth |
| TC-192 | Edit link on password step returns to identifier step | Medium | functionality, regression, auth |
| TC-193 | Show/hide toggle reveals and masks password field | Medium | positive, sanity, auth |
| TC-194 | Empty password submit shows required error | High | negative, regression, auth |
| TC-195 | Wrong password shows generic error (no account detail) | High | negative, regression, auth |
| TC-196 | Repeated wrong passwords trigger throttling | High | negative, regression, auth, security |
| TC-197 | 2FA code step appears after password when company enforces 2FA for user role | High | functionality, regression, auth |
| TC-198 | Successful login with valid credentials and 2FA code reaches dashboard | Critical | positive, sanity, regression, auth |
