# Analysis: sleekflow-login-signup-008-onboarding-landing

## AC Extraction

| AC | Text |
|---|---|
| AC1 | After completing setup, user lands on a goal-based checklist (e.g. "Set up shared Inbox" with 3 steps that include the chosen channel); banner "Your 7-day Pro trial starts today"; "Book a demo" link; help button. |
| AC2 | Trial grants Pro features with 500 monthly active contacts, no credit card required; user is assigned company Admin role. |

## SFDIPOT Risk Scan

| Dimension | Risk |
|---|---|
| Structure | Landing page is downstream of 6-step setup; checklist content driven by step 3 (goal) and step 4 (channel) answers. |
| Function | Checklist personalization — different goal/channel combos produce different checklist content. |
| Data | 500 MAC limit visible in profile menu. User role = Admin (not Super Admin). |
| Interface | Trial banner, "Book a demo" link, help button — all must be rendered. |
| Platform | Web. |
| Operations | Trial starts on first landing — 7-day countdown implicit. No credit card required. |
| Time | 7-day trial duration starts on this landing. |

## Risk Signals

- Role assignment: Admin role must be set (not Super Admin) — testable via profile/settings.
- Personalization: checklist changes based on setup goals — covering at least one specific path.
- Trial entitlement: Pro features + 500 MAC — visible in UI.

## Test Case Plan (TC-266 to TC-269)

| TC | Title Summary | AC | Priority | Tags |
|---|---|---|---|---|
| TC-266 | Goal-based onboarding checklist is displayed with the chosen goal and channel after setup completion | AC1 | Critical | positive, sanity, regression, onboarding |
| TC-267 | Trial banner, Book a demo link, and help button are present on the onboarding landing page | AC1 | High | positive, sanity, regression, onboarding |
| TC-268 | User is assigned Admin role and 7-day Pro trial with 500 MAC is shown after setup | AC2 | Critical | positive, sanity, regression, onboarding, auth |
| TC-269 | Onboarding checklist steps reflect the channel selected in setup step 4 | AC1 | High | functionality, regression, onboarding |
