# Ticket 011 — Localization & Accessibility: Analysis

## Extracted Acceptance Criteria

| AC | Summary |
|---|---|
| AC1 | Language picker with 9 languages; full page including marketing panel re-renders; Arabic is RTL (UX-01) |
| AC2 | Client and server errors are translated — validated in Bahasa Indonesia (UX-02) |
| AC3 | String review covers all 9 languages for login, sign-up, reset, verification, setup pages; no string appears in another language (P1-4) |
| AC4 | Bahasa Indonesia: sign-up link reads "Daftar" (not "Registre-se"); field label reads "Email atau nama pengguna" (not "Email atau username") (UX-03) |
| AC5 | Every input has a label and error element; live region announces errors; password toggle is a labelled switch (UX-05) |
| AC6 | Page reports `webauthn-available`; passkeys not offered; PostHog anonymous ID on sign-up; no visible CAPTCHA (UX-07) |
| AC7 | Sign-up pages title is "Sign up | SleekFlow" not "Log in | SleekFlow" (UX-06 / P2-1) |
| AC8 | Labels use sentence case: "Email", "Name", "Contact number" across all auth and setup pages (P2-3) |

## SFDIPOT Risk Scan

| Dimension | Risk | Notes |
|---|---|---|
| **Structure** | High | Wrong page titles (AC7) affect SEO, analytics, and accessibility tools |
| **Function** | High | Language picker must trigger full page re-render (AC1); RTL layout must switch (AC1); error translation must be functional (AC2) |
| **Data** | Medium | PostHog anonymous ID capture on sign-up (AC6) — must be validated; no PII leak |
| **Interface** | High | Hardcoded wrong strings (AC4); ARIA labels (AC5); live region (AC5); password toggle role (AC5) |
| **Platform** | Medium | RTL layout (Arabic) affects all CSS; language picker state must persist or be detectable |
| **Operations** | Medium | 6 of 9 languages have NOT been reviewed (open TBD) — risk of undetected mistranslations |
| **Time** | Low | Full string audit is a prerequisite for final sign-off; noted as TBD |

## Risk Flags

- **Hardcoded wrong strings (AC4):** "Registre-se" (Portuguese) on Indonesian page — ship blocker for ID market.
- **ARIA accessibility (AC5):** Missing labels or error live regions = WCAG 3.3.1 violation; affects all screen reader users.
- **Page title bug (AC7):** Sign-up pages titled "Log in" — confusion for analytics, screen readers, SEO.
- **RTL layout (AC1):** Arabic requires full CSS direction flip; high risk of layout issues.
- **6 of 9 languages unreviewed (AC3/open TBD):** Cannot fully verify AC3 without full audit.

## Test Case Plan (TC-294 to TC-310)

| TC | AC | Title (draft) | Priority | Tags |
|---|---|---|---|---|
| TC-294 | AC1 | Entire page including marketing panel re-renders in the selected language when the language picker is used | Critical | positive, sanity, regression, auth |
| TC-295 | AC1 | Arabic layout switches to right-to-left when Arabic is selected from the language picker | High | functionality, regression, auth |
| TC-296 | AC2 | Client-side error messages are displayed in Bahasa Indonesia when that language is active | High | functionality, regression, auth |
| TC-297 | AC2 | Server-side error messages are displayed in Bahasa Indonesia when that language is active | High | functionality, regression, auth |
| TC-298 | AC4 | Sign-up link reads "Daftar" on the Bahasa Indonesia login page | High | functionality, regression, auth |
| TC-299 | AC4 | Field label reads "Email atau nama pengguna" on the Bahasa Indonesia login page | High | functionality, regression, auth |
| TC-300 | AC3 | No string on the login or sign-up page appears in a foreign language when Bahasa Indonesia is selected | High | functionality, regression, auth |
| TC-301 | AC5 | Every input field on the login page has a visible label and associated error element | High | functionality, regression, auth |
| TC-302 | AC5 | Error messages are announced by a live region when form validation fails | High | functionality, regression, auth |
| TC-303 | AC5 | Password visibility toggle is implemented as a labelled switch accessible to assistive technology | High | functionality, regression, auth |
| TC-304 | AC6 | Page signals webauthn-available and passkey option is not offered on the sign-up page | Medium | functionality, auth |
| TC-305 | AC6 | No visible CAPTCHA is displayed on any auth page | Medium | negative, auth |
| TC-306 | AC7 | Page title is "Sign up | SleekFlow" on the sign-up identifier page | High | functionality, regression, auth |
| TC-307 | AC7 | Page title is "Sign up | SleekFlow" on the sign-up password page | High | functionality, regression, auth |
| TC-308 | AC8 | Form labels use sentence case on the login identifier page | Medium | functionality, regression, auth |
| TC-309 | AC8 | Form labels use sentence case on the sign-up pages | Medium | functionality, auth |
| TC-310 | AC6 | PostHog anonymous ID is captured on sign-up completion | Medium | functionality, auth |
