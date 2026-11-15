# Exploratory Testing Charters: sleekflow-login-signup

## Charter 1: Auth0 Edge States & Timing
**Target:** Auth0 Universal Login multi-step flow
**Timebox:** 45 min
**Explore:** What happens when...
- A user navigates backward during multi-step signup (browser back button between identifier and password steps)
- Auth0 session expires mid-flow (leave the password step open for 30+ min, then submit)
- Multiple tabs attempt signup simultaneously with the same email
- Network connectivity drops during Auth0 redirect back to app
**Look for:** Stale state errors, duplicate account creation, confusing error messages, unrecoverable states

## Charter 2: Free-Mail Domain Detection Boundaries
**Target:** Company Setup Step 1 — Pre-fill logic
**Timebox:** 30 min
**Explore:** Which email domains trigger empty company fields vs pre-fill?
- Test: gmail.com, yahoo.com, outlook.com, icloud.com (named in PRD)
- Test: hotmail.com, protonmail.com, zoho.com, aol.com, mail.com (likely free-mail)
- Test: company subdomains of free providers (e.g., company.gmail.com)
- Test: country-specific free providers (e.g., yandex.ru, qq.com, naver.com)
**Look for:** Inconsistent pre-fill behavior, false positives (business domains treated as free-mail), false negatives

## Charter 3: Password Complexity Rule Conflicts
**Target:** Signup password step — Password checklist
**Timebox:** 30 min
**Explore:** Which password rule set is actually enforced?
- PRD product spec: all 5 types (lower, upper, number, special, 8+ chars)
- Help Center: 8 chars + any 3 of 4 types
- Test passwords that satisfy one rule but not the other (e.g., "Abcdefg1" = 3/4 types but no special char)
- Test the password checklist UI feedback vs actual submit acceptance
**Look for:** Mismatch between UI checklist indicators (green/red) and actual server acceptance/rejection

## Charter 4: Localization String Audit — Untested Languages
**Target:** Auth pages in Deutsch, Italiano, Espanol, Portugues, Traditional/Simplified Chinese
**Timebox:** 60 min
**Explore:** Switch language picker through each of the 6 unreviewed languages and check:
- Login page strings
- Signup page strings
- Password reset page strings
- Error messages (trigger empty email, wrong password)
- Marketing panel text
**Look for:** Untranslated strings, strings in wrong language (like the Bahasa/Portuguese bug), broken layout in CJK languages

## Charter 5: Company Setup Mid-Flow Behavior
**Target:** Company setup 6-step flow (/en/register-company)
**Timebox:** 30 min
**Explore:** What happens when...
- User closes browser at step 3 and returns — does it resume or restart?
- User clicks browser back from step 4 — do previous selections persist?
- User navigates directly to /en/register-company without completing verification
- User completes setup and navigates back to /en/register-company
**Look for:** Lost progress, ability to bypass verification, duplicate workspace creation

## Charter 6: Social Signup OAuth Flow Robustness
**Target:** Google and Apple OAuth paths
**Timebox:** 30 min
**Explore:** What happens when...
- User denies Google OAuth consent (clicks "Cancel" on Google's page)
- User's Google email already exists as a password-based SleekFlow account
- User returns from Google OAuth but network fails before token exchange
- Apple "Hide My Email" relay address is used
**Look for:** Error recovery, account linking behavior, clarity of error messages

## Summary
| # | Charter | Timebox | Risk Area |
|---|---------|---------|-----------|
| 1 | Auth0 Edge States & Timing | 45 min | Auth reliability |
| 2 | Free-Mail Domain Boundaries | 30 min | Data accuracy |
| 3 | Password Rule Conflicts | 30 min | Contradiction |
| 4 | Localization String Audit | 60 min | 6 unreviewed languages |
| 5 | Company Setup Mid-Flow | 30 min | State persistence |
| 6 | Social Signup Robustness | 30 min | OAuth edge cases |
| **Total** | | **225 min (3.75 hrs)** | |
