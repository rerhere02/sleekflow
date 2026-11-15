# PRD — SleekFlow Login & Sign-up

12 Nov 2026 · Rev

| Field | Value |
| --- | --- |
| Status | Draft v2, for review |
| Author | Rev |
| Product owner | TBD |
| Reviewers | Identity engineering, Web app engineering, Design, Legal, Support |
| Last change | v2 restructured after senior-PM review: added problem, priorities, decisions, metrics funnel, rollout; current-state spec moved to Appendix A |

## Summary

**Ask:** approve 5 P0 fixes to SleekFlow's login and sign-up flow for the next sprint, and get Legal to decide 2 consent questions before work starts on them.

Three of the five P0s are configuration or text changes in Auth0, SleekFlow's identity provider, and should take days, not sprints. The P0s are:

1. Stop showing a dead-end "Oops!, something went wrong" page when a login link is stale (Auth0 default login route).
2. Show a visible error when the Terms checkbox is not ticked.
3. Block disposable email domains at sign-up. A yopmail.com address got a 7-day Pro trial with 500 monthly active contacts in this audit.
4. Capture Terms consent for Google and Apple sign-ups *(needs Legal)*.
5. Make marketing newsletters opt-in instead of opt-out *(needs Legal)*.

A further 7 P1 and 6 P2 changes follow in the [Scope](#scope-prioritised-changes) table. Appendix A holds the full current-state spec and Appendix B every error string, for QA.

## Problem and why now

SleekFlow's login and sign-up flow works end to end. A new merchant can go from an email address to a personalised setup checklist and a free trial in about 10 screens. The audit on 12 Nov 2026 found problems in three areas:

- **Dead ends and friction.** Any stale login link (bookmark, back button, expired tab) ends on an Auth0 error page with a tracking ID and no way forward. Windows between 1001 and 1213 px wide cut off the form and scroll sideways. The Indonesian login page links to sign-up with a Portuguese word ("Registre-se").
- **Consent and compliance gaps.** Missing Terms consent is shown by colour alone. Google and Apple sign-ups never see the Terms checkbox. Newsletters are opt-out by default. The password-reset link puts the user's email address in the URL.
- **Trial abuse.** Disposable email addresses are accepted, verified and given a full Pro trial with no further checks.

**Why now:** the trial gives away Pro features and 500 monthly active contacts with no card. Every disposable sign-up costs message volume and pollutes the funnel data needed to measure the onboarding redesign that is already live (goal-based setup and checklist). Consent gaps grow with every sign-up in markets with strict privacy laws.

## Goals, non-goals and success metrics

**Goals**

1. Returning users never hit a dead end: every auth error leads back to a working login.
2. Every new account has recorded Terms consent, and marketing consent only when given.
3. Trials go to real businesses: disposable-email sign-ups are blocked.
4. Measure the whole funnel, sign-up page to activated workspace, step by step.

**Non-goals**

- Redesigning the 6-step company setup or the checklist.
- New sign-in methods (passkeys, phone, magic link). The page already reports WebAuthn support, so passkeys could be a future PRD.
- Enterprise SSO/SAML and the native mobile-app login screens.

**Success metrics.** No baselines exist yet. Ship the tracking plan first, collect 2 weeks of data, then set targets.

| Funnel step | Metric | Baseline | Target |
| --- | --- | --- | --- |
| 1. Sign-up page viewed | Unique visitors | TBD | — |
| 2. Email submitted | % of step 1 | TBD | Set after baseline |
| 3. Account created (password set or social) | % of step 2 | TBD | Set after baseline |
| 4. Email verified | % of step 3, median time to verify | TBD | Set after baseline |
| 5. Setup steps 1–6 completed | % reaching each step | TBD | Find the biggest drop-off step |
| 6. Checklist step 1 done (activation proxy) | % of step 5 within 7 days | TBD | Set after baseline |
| 7. Trial converted to paid | % of step 3 at day 14 | TBD | Owned by Growth |

| Guardrail | Definition | Direction |
| --- | --- | --- |
| Login success rate | Successful logins ÷ login attempts | Must not fall |
| Auth error pages shown | `invalid_request` and other error pages per 1,000 sessions | Toward 0 after P0-1 |
| Blocked sign-ups | Sign-ups denied as disposable ÷ email sign-ups | Track; check false positives weekly |
| Auth support tickets | Tickets tagged login, sign-up, verification or reset per week | Must not rise |

## Users and key scenarios

| User | Goal | Path today | Pain found |
| --- | --- | --- | --- |
| New merchant (owner or marketer) | Start a trial and set up the company | Sign-up → password → verify email → 6-step setup → checklist | Free-mail domain pre-fills company as e.g. "YOPmail"; newsletter opt-out |
| Returning agent or admin | Get back to the inbox fast | Login → password (→ 2FA) → app | Stale links end on an error page; layout breaks at 1001–1213 px |
| Invited teammate | Join an existing company | Invitation email → set password → app | Not tested in this audit |
| User who forgot their password | Regain access | Password step → Reset password → email link | Email in URL; form accepts any text |
| Trial abuser | Free Pro features | Disposable email → full trial | Nothing stops them |

## End-to-end flow

[Diagram in the doc version: signed-out user → login (identifier → password → optional 2FA → dashboard), Google/Apple (existing → dashboard; new → company setup, verification untested), sign-up (email + consent → password → verify email → 6-step company setup → goal checklist with 7-day Pro trial).]

Returning users reach the app in two screens, or three with 2FA. New email sign-ups always verify their address and complete the 6-step setup, which ends on a checklist built from their answers. Whether new Google or Apple users also see email verification was not tested (dashed path in the doc's diagram).

## Scope: prioritised changes

Effort is a first estimate to confirm with engineering: S ≤ 2 days, M ≤ 1 sprint, L > 1 sprint. "Where" says which system changes.

| ID | Change | Why | Where | Effort | Owner | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| P0-1 | Set an Application Login URI or Tenant Login URI so stale auth links restart login | Dead-end error page | Auth0 config | S | Identity eng | — |
| P0-2 | Visible error text when the Terms box is unticked | WCAG 1.4.1 and 3.3.1; users don't know why sign-up fails | Universal Login text and template | S | Identity eng + Design | — |
| P0-3 | Deny sign-up from disposable email domains | Trial abuse | Auth0 Pre-User Registration Action + domain list | S–M | Identity eng | Decision D4 |
| P0-4 | Capture Terms consent for Google and Apple sign-ups | No consent recorded today | Universal Login text and/or first in-app screen | M | Web app eng + Legal | Decision D2 |
| P0-5 | Newsletter becomes opt-in ("Send me product news and offers", unticked) | Opt-out may breach consent rules in some markets | Web app, setup step 6 | S | Web app eng + Legal | Decision D3 |
| P1-1 | Remove the email from the reset-password URL | Personal data in URLs is logged and cached | Auth0 (check whether configurable) | S–M | Identity eng | Auth0 limits |
| P1-2 | Reset form: validate the field and fix the broken pattern message | Accepts "not an email"; message shows empty placeholders | Universal Login text | S | Identity eng | — |
| P1-3 | Fix the 1001–1213 px layout overflow | Form cut off, horizontal scroll on common laptop and tablet widths | Universal Login page template CSS | S | Identity eng + Design | — |
| P1-4 | Fix Indonesian strings: "Registre-se" → "Daftar"; "Email atau username" → "Email atau nama pengguna" | Wrong language on a key link in a core market | Universal Login text | S | Localization | Audit all 9 languages |
| P1-5 | Define and build feedback for sign-up with an existing email | Behaviour after the password step is unknown | Auth0 + email template | M | Identity eng | Decision D1 |
| P1-6 | Skip company pre-fill for free-mail domains | "Gmail" or "YOPmail" as company name | Web app, setup step 1 | S | Web app eng | Free-mail domain list |
| P1-7 | Align password and username rules between product and Help Center | Help Center says "alphanumeric only" and "3 of 4 types"; product differs | Help Center + Auth0 policy | S | Docs + Identity eng | — |
| P2-1 | Title sign-up pages "Sign up \| SleekFlow" (today "Log in \| SleekFlow") | Screen readers, analytics, browser history | Universal Login template | S | Identity eng | — |
| P2-2 | Validate email format on blur, not only on submit | Faster feedback | Universal Login template | M | Identity eng | Template limits |
| P2-3 | Sentence-case labels ("Email", "Name", "Contact number") | Consistency | Universal Login text + web app | S | Design | — |
| P2-4 | Document or remove the hidden required "Username" field on the sign-up password step | Unknown purpose | Auth0 connection settings | S | Identity eng | — |
| P2-5 | Set the "Keep me signed in" default and session lengths | Shared devices | Auth0 session settings | S | Identity eng | Decision D5 |
| P2-6 | Show or remove the hidden "Download our app" banner | Dead markup | Universal Login template | S | Design | — |

## Requirements for the changes

Each change ships when its acceptance criteria pass in all 9 UI languages.

| ID | Target behaviour | Acceptance criteria |
| --- | --- | --- |
| P0-1 | Any Universal Login URL opened without a valid session `state` sends the user to a fresh login. | Given a bookmarked `/u/login/identifier`, a page refreshed mid-login, or a tab left open 2+ hours, when it is opened or submitted, then the user lands on a working login screen (or straight in the app if already signed in) and never sees `invalid_request`. |
| P0-2 | Missing consent shows text under the checkbox and is announced. | Given an unticked box, when Sign up is clicked, then "Please accept the Terms of Service and Privacy Policy to continue." appears under the box, focus moves to the box, and the live region announces the same text. |
| P0-3 | Sign-ups from disposable domains are refused with a clear message. | Given an email on the blocklist (e.g. yopmail.com, mailinator.com), when the account would be created, then sign-up is denied with "Please use a work or personal email address. Temporary email addresses can't be used." and nothing is created. The list updates at least monthly. |
| P0-4 | Google and Apple sign-ups record Terms consent before the account is used. | Given a first-time social sign-in, when the user reaches the app, then consent is recorded with timestamp and Terms version, either by text under the social buttons (if Legal accepts implied consent) or by a required checkbox on the first in-app screen. |
| P0-5 | Marketing consent is opt-in. | Given setup step 6, the checkbox reads "Send me product news and offers" and is unticked. Only a ticked box sets marketing consent, stored with timestamp. |
| P1-1 | The reset flow carries the identifier without putting it in the URL. | Given the reset link on the password step, then no URL in the flow contains the email or username. |
| P1-2 | The reset form accepts only a valid email or username. | Given "not an email" or a value with spaces, when Send link is clicked, then an inline error shows and no request is sent. No message ever shows empty placeholders. |
| P1-3 | One layout fits at every width. | At 1001, 1024, 1100, 1200 and 1280 px, the page has no horizontal scroll and the whole form card is visible. |
| P1-4 | Every string is in the chosen language. | A string review covers all 9 languages for login, sign-up, reset, verification and setup. No string appears in another language. |
| P1-5 | Per decision D1. | Given an email that already has an account, the behaviour chosen in D1 happens, and the account owner is told by email if D1(a) is chosen. |
| P1-6 | Free-mail domains don't pre-fill company data. | Given gmail.com, yahoo.com, outlook.com, icloud.com or similar, setup step 1 shows empty company fields. |

## Decisions needed

| ID | Question | Options | Recommendation | Decider |
| --- | --- | --- | --- | --- |
| D1 | What happens when someone signs up with an email that already has an account? Today they move on to the password step with no notice; what follows was not tested. | (a) Same screen as a new sign-up, plus an email to the owner: "You already have an account — sign in or reset". (b) Say on screen that the account exists, with a sign-in link. | (a): keeps the no-enumeration stance of login and reset; the email gives the real owner a path. | Product + Security |
| D2 | How is Terms consent captured for Google and Apple sign-ups? | (a) "By continuing you agree to…" text under the social buttons. (b) Required checkbox on the first in-app screen. | Legal to choose; (a) is cheaper if implied consent is acceptable in target markets. | Legal |
| D3 | Must marketing consent be opt-in in all markets? | (a) Opt-in everywhere. (b) Opt-in by market. | (a): one rule is simpler to build and audit. | Legal |
| D4 | What happens to disposable-email sign-ups? | (a) Block. (b) Allow, no trial. (c) Allow, reduced trial. | (a) for now; revisit if Support sees false positives. | Product + Growth |
| D5 | Should "Keep me signed in" stay ticked by default, and for how long? | (a) Ticked, 30 days. (b) Unticked, session only. | Product to choose with Security, using agent usage on shared devices. | Product + Security |
| D6 | Is the server region (shown as Singapore for an Indonesian sign-up) fixed or choosable? | (a) Fixed. (b) Chosen by location. (c) User choice. | Needs data-residency input before any change. | Legal + Infra |

## Dependencies, rollout, tracking and risks

**Dependencies:** admin access to the Auth0 tenant; Legal answers to D2 and D3; Localization for the string review; Docs for the Help Center update; Growth for funnel dashboards.

**Rollout**

| Phase | Changes | Notes |
| --- | --- | --- |
| 1 | Tracking plan, P0-1, P0-2, P1-2, P1-4, P2-1, P2-3 | Config and text only; start the 2-week metrics baseline |
| 2 | P0-3, P1-3, P1-6, P1-7 | Watch blocked sign-ups and Support tickets for false positives |
| 3 | P0-4, P0-5, P1-1, P1-5 | After Legal and product decisions |
| 4 | Remaining P2 | As capacity allows |

Ship web-app changes behind a feature flag. Auth0 tenant changes affect every app on the tenant (web and mobile), so test them on a staging tenant first.

**Tracking plan** (PostHog is already loaded on the sign-up page)

| Event | Properties |
| --- | --- |
| `auth_login_identifier_submitted` | `method` (email, username) |
| `auth_login_succeeded` / `auth_login_failed` | `method`, `reason` |
| `auth_signup_email_submitted` | `consent_given` |
| `auth_signup_account_created` | `method` (password, google, apple) |
| `auth_signup_denied` | `reason` (disposable, other) |
| `auth_email_verified` | `method` (code, link), `seconds_since_created` |
| `auth_error_page_shown` | `error_code` |
| `setup_step_completed` | `step` (1–6), `answer` |
| `setup_completed` | `goal`, `primary_channel` |
| `checklist_step_completed` | `checklist`, `step` |

**Risks**

| Risk | Mitigation |
| --- | --- |
| Auth0's Pre-User Registration trigger does not run for social connections, so the disposable block only covers email sign-ups. | Acceptable: Google and Apple accounts are not disposable; recheck if abuse moves there. |
| Blocklist false positives turn away real users. | Weekly review of denied domains; Support override process. |
| Opt-in newsletters reduce the marketing list. | Expected; track opt-in rate as its own metric. |
| Tenant-level Auth0 changes break the mobile apps. | Staging tenant and mobile regression before release. |
| Universal Login customization limits block P2-2 or P1-1. | Spike first; drop or defer if not possible without a custom login page. |

## Open questions and test gaps

- [ ] What do wrong-password, lockout and resend-limit messages look like, and what are the thresholds? (Not tested: needs a password entered on the live site.)
- [ ] What happens after the password step when signing up with an existing email? (Feeds D1.)
- [ ] Do new Google or Apple users see email verification? What happens when a social email matches an existing password account? (Social paths not tested.)
- [ ] How long are verification codes and reset links valid?
- [ ] Can a user leave setup half way and resume at the same step?
- [ ] Invited-teammate path, mobile apps, keyboard-only use, Safari and Firefox: not tested.
- [ ] Strings in 6 of 9 languages (other than English, Bahasa Indonesia, Arabic): not reviewed.

## Appendix A — Current-state spec

How it works on 12 Nov 2026. "Observed" = seen live (desktop Chrome; widths ~407, ~814, ~1054 px; English, Bahasa Indonesia, Arabic). "[Help Center]" = SleekFlow's help articles. "[Assumed]" = usual Auth0 behaviour, not tested. Test account: `qa.prd.sf1112@yopmail.com`, company "QA Test Co".

| Item | Value |
| --- | --- |
| Login URL | `https://sso.sleekflow.io/u/login/identifier` (reached by opening `app.sleekflow.io` signed out) |
| Sign-up URL | `https://sso.sleekflow.io/u/signup/identifier` |
| Identity provider | Auth0 Universal Login (`cdn.auth0.com`) |
| Sign-in methods | Email or username + password, Google, Apple |
| UI languages | English, 繁體中文, 简体中文, Bahasa Indonesia, Português (BR), Deutsch, Italiano, Español (Latinoamérica), العربية |

### A1. Login

| ID | Behaviour | Source |
| --- | --- | --- |
| LG-01 | Step 1 "Welcome back": one field "Email or username", required, autofocus, `autocomplete=email`. | Observed |
| LG-02 | Empty submit → "Email address or username is required". | Observed |
| LG-03 | Usernames: 5–128 characters; letters, digits and `` _ + - . ! # $ ^ ` ~ @ ' ``. Checked server-side. | Observed |
| LG-04 | Any well-formed email goes to the password step, whether or not an account exists (no enumeration). | Observed |
| LG-05 | "Sign up" link keeps session `state` and `ui_locales`. Google and Apple buttons under "OR". | Observed |
| LG-06 | Left panel: 4-slide product carousel; moves below the form or hides at ≤ 1000 px. | Observed |
| LG-07 | Step 2 "Sign in to continue": identifier read-only with "Edit"; password with show/hide; "Reset password" link; "Keep me signed in" ticked by default; no social buttons. | Observed |
| LG-08 | Empty password → "Password is required". | Observed |
| LG-09 | Wrong password shows a generic error; repeated failures are throttled. | [Assumed] |
| LG-10 | If the company enforces 2FA for the user's role: 6-digit authenticator code after the password. | [Help Center] |
| LG-11 | Login page opened without a valid `state` → "Oops!, something went wrong" + `invalid_request` + tracking ID. | Observed |

### A2. Sign-up

| ID | Behaviour | Source |
| --- | --- | --- |
| SU-01 | Step 1 "Create your account": "Email address" (required) + unticked consent box: "By checking this box, I/We confirm that I/we have read and agree to SleekFlow's Terms of Service and Privacy Policy." | Observed |
| SU-02 | Validation only on submit. Empty → "Please enter an email address"; malformed → "Email is not valid."; no consent → label turns red, screen reader hears "This is required", no visible text. | Observed |
| SU-03 | An email that already has an account moves on to the password step with no notice. Result after password not tested. | Observed |
| SU-04 | Disposable addresses (yopmail.com) are accepted and complete the whole flow. | Observed |
| SU-05 | Step 2: email read-only with "Edit"; password (`new-password`) with show/hide; checklist "Your password must contain:" at least 8 characters, lower case, upper case, numbers, special characters. Help Center says 8 characters + any 3 of 4 types. | Observed / [Help Center] |
| SU-06 | Step 2 also holds a hidden, required "Username" field. | Observed |
| SU-07 | Left panel: "Turn customer conversations into revenue", Unified Inbox, AI agents, "Trusted by 2,000+ businesses". | Observed |
| SU-08 | Back button from step 2 to step 1 works without error. | Observed |

### A3. Email verification, company setup and landing

| ID | Behaviour | Source |
| --- | --- | --- |
| EV-01 | "Confirm your email address" at `app.sleekflow.io`: masked email; 6-digit code (one input, `inputmode=numeric`, `autocomplete=one-time-code`) or email link; "Open Gmail", "Open Outlook", "Resend code", "I've verified my email", Sign out. | Observed |
| CS-01 | Setup at `/en/register-company`: 6 progress dots, Back on steps 2–6, Next or Enter, "Server region: Singapore" read-only. | Observed |
| CS-02 | Step 1: company name (required → "Required") and website ("Please enter a valid website URL"), both pre-filled from the email domain. | Observed |
| CS-03 | Step 2: industry, single choice of 10, moves on when picked; "Others" opens "Please specify your industry". | Observed |
| CS-04 | Step 3: goal, single choice of 5 (shared Inbox, AI agent, marketing campaign, WhatsApp experience, Live Chat widget). | Observed |
| CS-05 | Step 4: main channel (single of 10, incl. "I don't have one"), then other channels (optional multi-select). | Observed |
| CS-06 | Step 5: apps to connect (optional multi-select: HubSpot, Salesforce, Zoho, Vtex, Google Sheets, Shopify, booking tools, Other). | Observed |
| CS-07 | Step 6: Name and Contact number required (country picker with search, defaulted to +62); "Enter a valid phone number."; "I prefer not to receive newsletters" unticked; "Get started" disabled until valid. | Observed |
| LD-01 | Lands on a goal-based checklist, e.g. "Set up shared Inbox" with 3 steps that include the chosen channel; banner "Your 7-day Pro trial starts today"; "Book a demo"; help button. | Observed |
| LD-02 | Trial: Pro features, 500 monthly active contacts, no card; user is company Admin. | Observed (500 MAC in profile menu) / [Help Center] |

### A4. Social sign-in, password reset and 2FA

| ID | Behaviour | Source |
| --- | --- | --- |
| SO-01 | Google and Apple buttons on both identifier screens; social sign-up shows no consent checkbox. | Observed |
| SO-02 | New social users go to company setup; returning users go to the app. | [Help Center] / [Assumed] |
| PR-01 | Reset: "Forgot your password?" with one field labelled "EMAIL", pre-filled; "Send link", "Back". URL contains the email. | Observed |
| PR-02 | Any value, including "not an email", lands on "Check Your Email" with "Resend email" (no enumeration, no validation). | Observed |
| TF-01 | 2FA is enabled by Admins per role on selected plans; users get an invite email and must enrol at next login after 24 hours; QR code + 6-digit code; lost device → Support. | [Help Center] |

### A5. Localization, layout and accessibility

| ID | Behaviour | Source |
| --- | --- | --- |
| UX-01 | Language picker with 9 languages; the whole page, marketing panel included, re-renders; Arabic is right-to-left. | Observed |
| UX-02 | Client and server errors are translated (checked in Bahasa Indonesia). | Observed |
| UX-03 | Bahasa Indonesia login page: sign-up link reads "Registre-se" (Portuguese); field label "Email atau username" mixes languages. | Observed |
| UX-04 | ≤ 1000 px: one column, marketing below or hidden. 1001–1213 px: two columns that need ~1214 px, so the card is cut off and the page scrolls sideways. ≥ ~1214 px: fits. | Observed (CSS breakpoint 1000 px; form column min-width 543 px) |
| UX-05 | Every input has a label and an error element; a live region announces errors; password toggle is a labelled switch. | Observed |
| UX-06 | Sign-up pages are titled "Log in \| SleekFlow". | Observed |
| UX-07 | Page reports `webauthn-available`; passkeys not offered. PostHog anonymous ID on sign-up. No visible CAPTCHA. | Observed |

## Appendix B — Error message catalogue

English strings as read from the live pages. "Seen" = triggered on screen; "In page" = in the markup, not triggered.

| Screen | Trigger | Message | Status |
| --- | --- | --- | --- |
| Login – identifier | Empty | Email address or username is required | Seen |
| Login – identifier | Bad username | Username can only contain alphanumeric characters or: '_', '+', '-', '.', '!', '#', '$', '^', '`', '~', '@', '''. Username should have between 5 and 128 characters. | Seen |
| Login – identifier | Pattern mismatch | Enter a valid email address or username | In page |
| Login – password | Empty | Password is required | Seen |
| Sign-up – email | Empty | Please enter an email address | Seen |
| Sign-up – email | Malformed | Email is not valid. | Seen |
| Sign-up – email | Consent unticked | (no visible text; label turns red; screen reader: "This is required") | Seen |
| Sign-up – password | Empty username | Username is required | In page |
| Sign-up – password | Empty / weak password | Password is required / The password is too weak | In page |
| Reset – request | Empty | Email is required | In page |
| Reset – request | Pattern mismatch | Username can only contain alphanumeric characters or: ''. Username should have between  and  characters. | In page (broken) |
| Reset – confirmation | Any value | Please check the email address associated with the username {value} for instructions to reset your password. | Seen |
| Setup step 1 | Empty name / bad URL | Required / Please enter a valid website URL | Seen |
| Setup step 6 | Short phone | Enter a valid phone number. | Seen |
| Any auth page | Missing or expired `state` | Oops!, something went wrong — invalid_request: … we couldn't find your session … + tracking ID | Seen |

## Sources

- Live walkthrough of `sso.sleekflow.io` and `app.sleekflow.io`, 12 Nov 2026.
- [Setting up a company account — SleekFlow Help Center](https://help.sleekflow.io/en_US/setting-up-a-company-account)
- [Trying SleekFlow with a free trial — SleekFlow Help Center](https://help.sleekflow.io/en_US/trying-sleekflow-with-a-free-trial)
- [Setting up 2FA for your SleekFlow account — SleekFlow Help Center](https://help.sleekflow.io/en_US/atur-2fa-akun-sleekflow)
- [Setting up 2FA for your organization — SleekFlow Help Center](https://help.sleekflow.io/en_US/atur-2fa-perusahaan-sleekflow)
- [SleekFlow Two-Factor Authentication — SleekFlow Docs](https://docs.sleekflow.io/settings/sleekflow-two-factor-authentication)
- [Personal settings — SleekFlow Help Center](https://help.sleekflow.io/en_US/general-settings/personal-settings)
- [Error "You may have pressed the back button" — Auth0 Support](https://support.auth0.com/center/s/article/Users-occasionally-see-an-error-You-may-have-pressed-the-back-button)
- [Configure default login routes — Auth0 Docs](https://auth0.com/docs/universal-login/default-login-url)
- [How to combat fraudulent sign-ups from disposable email services — Auth0 Support](https://support.auth0.com/center/s/article/How-to-combat-fradulent-signups-from-disposable-email-services)
- [Pre-User Registration does not run for social connections — Auth0 Community](https://community.auth0.com/t/blocking-users-from-signing-up/121729)
