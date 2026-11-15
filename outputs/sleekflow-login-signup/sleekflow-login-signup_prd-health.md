# PRD Health Report: SleekFlow Login & Sign-up

**Health Score: 63/100  YELLOW**

---

## Vague ACs (1) → −5

| Ref | AC Text | Issue |
|-----|---------|-------|
| P1-6 | "Given gmail.com, yahoo.com, outlook.com, icloud.com **or similar**, setup step 1 shows empty company fields." | "or similar" is unmeasurable — no definitive free-mail domain list specified. Testers cannot determine the boundary. |

## Blocking TBDs (2) → −20

| Ref | TBD | Impact |
|-----|-----|--------|
| D1 → P1-5 | What happens when signing up with an existing email? AC says "Per decision D1." | Entire AC is untestable — no deterministic outcome defined. Cannot design tests until Product + Security decide between option (a) silent + email notification or (b) on-screen "account exists" message. |
| D2 → P0-4 | How is Terms consent captured for Google/Apple sign-ups? | Two fundamentally different implementations: (a) implied consent text under social buttons vs (b) required checkbox on first in-app screen. Test design differs completely between options. Blocked until Legal decides. |

## Contradictions (1) → −8

| Ref | Conflict |
|-----|----------|
| SU-05 vs Help Center (P1-7) | Product shows password checklist requiring all 5 types (lower, upper, number, special, 8+ chars). Help Center says "8 characters + any 3 of 4 types." PRD acknowledges this (P1-7 is the fix), but until aligned, tests must handle both rules. |

## Happy-Path-Only Sections (2) → −4

| Ref | Section | Gap |
|-----|---------|-----|
| P2-2 | Validate email format on blur | Only describes the desired behavior, no failure/edge cases (what if the user focuses and blurs repeatedly? Paste vs typing? International email formats?) |
| P2-5 | "Keep me signed in" default + session lengths | No AC defined — entirely pending D5. No failure scenario for session expiry, shared device logout, or concurrent sessions. |

## NFR Gaps (informational)

| Category | Status |
|----------|--------|
| **Performance** | ⚠ No SLAs for Auth0 response times, no rate-limit thresholds defined. LG-09 mentions throttling as "[Assumed]" with no numbers. |
| **Security** | ✅ Good coverage: no-enumeration stance, email removal from URLs, disposable domain blocking, consent recording. |
| **Accessibility** | ✅ Good: WCAG 1.4.1 and 3.3.1 cited (P0-2), live regions, screen reader announcements noted. |
| **Resilience** | ⚠ No mention of Auth0 outage handling, retry behavior, or degraded-mode user experience. |

## Untested Areas (from PRD "Open Questions")

These are not scored but represent test coverage risks:

1. Wrong-password message, lockout threshold, and resend-rate-limit — no values specified.
2. Existing-email sign-up behavior after password step — feeds D1.
3. Google/Apple social path: email verification required? Social email matches existing password account?
4. Verification code and reset link expiry times.
5. Setup mid-way abandon and resume behavior.
6. Invited-teammate flow, mobile apps, keyboard-only, Safari/Firefox.
7. Strings in 6 of 9 languages (other than EN, ID, AR).

## Strengths

- Exceptionally detailed current-state spec (Appendix A: 30+ observed behaviors with source attribution)
- Complete error message catalogue (Appendix B) — invaluable for assertion design
- Clear prioritization (P0/P1/P2) with effort estimates and ownership
- Honest about gaps: 6 decisions + 7 open questions explicitly listed
- Testable ACs with exact error message strings for P0-1, P0-2, P0-3, P0-5, P1-2, P1-3

---

## Score Breakdown

| Deduction | Count | Points |
|-----------|-------|--------|
| Vague ACs | 1 | −5 |
| Missing-outcome ACs | 0 | 0 |
| Blocking TBDs | 2 | −20 |
| Contradictions | 1 | −8 |
| Actor-less flows | 0 | 0 |
| Happy-path-only sections | 2 | −4 |
| **Total** | | **63/100** |

**Recommendation: PROCEED WITH WARNINGS** — The PRD is well-structured with high-quality ACs for P0/P1 items. The two blocking TBDs (D1, D2) prevent test design for P1-5 and partially for P0-4. Generate tests for all other items and flag P1-5 and P0-4 as pending-decision.

---

## Warning Propagation

| Warning | Type | Affected Feature | Propagate to Ticket Slug |
|---------|------|------------------|--------------------------|
| D1 undecided — P1-5 AC is "Per decision D1"; cannot design tests | Blocking TBD | Existing-email sign-up behavior | sleekflow-login-signup-005 |
| D2 undecided — P0-4 has two implementation paths | Blocking TBD | Social sign-up consent | sleekflow-login-signup-004 |
| Password rules contradiction: product ≠ Help Center | Contradiction | Sign-up password validation | sleekflow-login-signup-002 |
| P1-6 "or similar" — no definitive free-mail domain list | Vague AC | Company setup pre-fill | sleekflow-login-signup-006 |
| Lockout thresholds/rate limits unknown | Untested area | Login negative cases | sleekflow-login-signup-001 |
