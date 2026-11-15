# Ticket 010 — Responsive Layout: Analysis

## Extracted Acceptance Criteria

| AC | Summary |
|---|---|
| AC1 | At 1001, 1024, 1100, 1200, and 1280 px viewport widths: no horizontal scroll, full form card visible (P1-3 fix) |
| AC2 | ≤ 1000 px: single column, marketing panel below or hidden (UX-04) |
| AC3 | 1001–1213 px: currently two-column layout causes horizontal overflow / cut-off card — to be fixed by P1-3 (UX-04) |
| AC4 | ≥ ~1214 px: layout fits correctly (UX-04) |

## SFDIPOT Risk Scan

| Dimension | Risk | Notes |
|---|---|---|
| **Structure** | High | The layout is broken for a range of widely-used viewport widths (1024 px = iPad landscape, 1280 px = standard laptop) |
| **Function** | Medium | Form card being cut off at common viewports prevents form completion — functional blocker |
| **Data** | Low | No data at risk; purely visual |
| **Interface** | High | CSS breakpoint at 1000 px; min-width 543 px creates overflow between 1001–1213 px; affects ALL auth pages |
| **Platform** | Medium | All desktop browsers at affected widths; affects login, sign-up, reset, verification, setup pages |
| **Operations** | Low | No operational risk |
| **Time** | Low | Prerequisite: sleekflow-login-signup-000-auth-error-handling.md must be deployed first |

## Risk Flags

- **Wide impact**: ALL auth pages affected — login identifier, login password, sign-up identifier, sign-up password, reset password.
- **High-traffic viewport widths**: 1024 px (iPad Pro landscape) and 1280 px (most laptop screens) are commonly used by real users.
- **Boundary condition**: 1001 px is the first pixel after the mobile breakpoint; needs explicit testing.
- **Fix boundary**: 1214 px is the stated threshold; test at 1213 px (broken) vs 1214 px (fixed) to confirm exact boundary.

## Test Case Plan (TC-286 to TC-293)

| TC | AC | Title (draft) | Priority | Tags |
|---|---|---|---|---|
| TC-286 | AC1 | No horizontal scroll and full form card is visible at 1024 px viewport width | Critical | positive, sanity, regression, ui |
| TC-287 | AC1 | No horizontal scroll and full form card is visible at 1280 px viewport width | Critical | positive, sanity, regression, ui |
| TC-288 | AC1,AC3 | No horizontal scroll appears at all specified breakpoints (1001, 1024, 1100, 1200, 1280 px) on all auth pages | High | functionality, regression, ui |
| TC-289 | AC2 | Single-column layout is displayed with marketing panel below or hidden at 1000 px and below | High | positive, sanity, regression, ui |
| TC-290 | AC4 | Full two-column layout is displayed correctly at 1214 px and above | High | positive, sanity, regression, ui |
| TC-291 | AC3 | Horizontal scroll is absent at 1001 px (first pixel past mobile breakpoint) | High | functionality, regression, ui |
| TC-292 | AC1 | Full form card is visible without clipping at 1100 px viewport width | Medium | positive, sanity, ui |
| TC-293 | AC1,AC3 | Reset password page has no horizontal scroll at 1024 px | High | functionality, regression, ui |
