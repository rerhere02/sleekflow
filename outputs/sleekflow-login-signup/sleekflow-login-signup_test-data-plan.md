# Test Data Plan: sleekflow-login-signup

## Required Test Accounts

| Account | Purpose | Email | Setup | Used By |
|---------|---------|-------|-------|---------|
| Verified owner | Login tests, role checks, workspace access | sftestq+owner@gmail.com | Pre-created, email verified, company setup done | TC-183-198, TC-268, TC-313 |
| Unverified new user | Signup flow, verification tests | Generated per run (generateTestEmail()) | Created during test execution | TC-200, TC-241-242, TC-311 |
| Existing account | Duplicate signup tests | sftestq+owner@gmail.com (reuse) | Already exists | TC-207, TC-231-234 |

## Required Email Domains

| Domain | Type | Purpose | Used By |
|--------|------|---------|---------|
| gmail.com | Legitimate (free-mail) | Positive signup, free-mail detection | TC-206, TC-251 |
| yopmail.com | Disposable | Blocked by P0-3 | TC-205, TC-314 |
| mailinator.com | Disposable | Blocked by P0-3 | TC-208 |
| company.com (work domain) | Business | Pre-fill company name in setup | TC-250 |

## Required Test Passwords

| Password | Purpose | Used By |
|----------|---------|---------|
| TestP@ss1! | Valid (meets all 5 rules) | TC-200, TC-211, TC-311 |
| abcdefgh | Weak (only lowercase + length) | TC-214-216 |
| short1A! | Boundary (8 chars exactly) | TC-218 |
| Ab1!567 | Too short (7 chars) | TC-217 |

## Environment Configuration

| Variable | Value | Notes |
|----------|-------|-------|
| ENV | prod or stg | Tests with @staging-only tag skipped on prod |
| TEST_EMAIL | sftestq+owner@gmail.com | BeforeAll login-once account |
| TEST_PASSWORD | P@ssword123 | BeforeAll login-once password |
| HEADLESS | false (headed) or true (CI) | CI should use true |

## Data Cleanup Strategy

1. **@creates-account scenarios:** After hook logs email to `reports/cleanup-emails.log` and attempts API deletion
2. **Manual cleanup:** Batch delete from cleanup log if API fails
3. **Auth state:** `.auth/` directory with storageState, refreshed every 40 min

## Localization Test Data

| Language | Code | RTL | Key Strings to Verify |
|----------|------|-----|----------------------|
| Bahasa Indonesia | id | No | "Daftar" (not "Registre-se"), "Email atau nama pengguna" |
| Arabic | ar | Yes | RTL layout, dir="rtl" attribute |
| English | en | No | Default, baseline for comparison |

## Open Data Gaps

1. **Disposable domain full blocklist** — only yopmail.com, mailinator.com confirmed
2. **Lockout threshold** — no count defined for wrong password attempts
3. **Rate limit for resend code** — no cooldown value specified
4. **Verification code/link expiry** — no duration specified
5. **Session lengths** — pending D5 decision
