@prod-safe
Feature: Login, Logout, Password Reset, Accessibility & Responsive

  # ═══════════════════════════════════════════════════════════════
  # Login — Identifier Step
  # ═══════════════════════════════════════════════════════════════

  Rule: Login identifier step
    Background:
      Given user is on the login identifier page

    @TC-183 @TC-186 @high @regression @no-auth
    Scenario: TC-183/186 Identifier step — autofocus and empty submit error
      Then the email field is autofocused
      When user click the Continue button
      Then an inline error is displayed

    @TC-184 @critical @regression @smoke @no-auth
    Scenario Outline: TC-184 Identifier accepted — password step (<identifier>)
      When user enter email "<identifier>"
      And user click the Continue button
      Then the password step is displayed

      Examples:
        | identifier                     |
        | sftest_owner@mailinator.com    |
        | sftest_owner                   |

  # ═══════════════════════════════════════════════════════════════
  # Login — Password Step (shared login flow as Background)
  # ═══════════════════════════════════════════════════════════════

  Rule: Login password step
    Background:
      Given user is on the login password step

    @TC-191 @TC-192 @TC-193 @TC-189 @high @regression @no-auth
    Scenario: TC-191/192/193/189 Password step — read-only id, edit, toggle, signup link
      Then the identifier is displayed as read-only
      And the Edit link is visible
      And the password field is visible with show/hide toggle
      And the Sign up link preserves session state
      When user click the show/hide password toggle
      Then password text is "visible"
      When user click the show/hide password toggle
      Then password text is "masked"
      When user click the "Edit" link
      Then the identifier step is restored

    @TC-194 @TC-195 @TC-198 @high @regression @no-auth
    Scenario Outline: Login with <case> password — <expected>
      When user enter password "<password>"
      And user click the Sign in button
      Then <expected>

      @critical @smoke
      Examples: Valid
        | case       | password | expected                                    |
        | valid      | [env]    | the dashboard is displayed                  |

      Examples: Invalid
        | case       | password        | expected                     |
        | empty      |                 | an inline error is displayed |
        | incorrect  | WrongPassword1! | an inline error is displayed |

  # ═══════════════════════════════════════════════════════════════
  # Logout & Session Management
  # ═══════════════════════════════════════════════════════════════

  Rule: Session management
    Background:
      Given user is logged into the app

    @TC-350 @TC-351 @critical @regression @smoke @serial
    Scenario: TC-350/351 Logout terminates session and protected pages redirect
      When user logs out
      Then user is redirected to the login page
      When user navigates to the app
      Then user is redirected to the login page

    @TC-352 @high @regression
    Scenario: TC-352 Session persists across page reload
      When user navigates to the app
      Then the dashboard is displayed

  # ═══════════════════════════════════════════════════════════════
  # Social Login
  # ═══════════════════════════════════════════════════════════════

  Rule: Social login

    @TC-224L @high @regression @no-auth
    Scenario: TC-224L Google and Apple buttons visible on login identifier page
      Given user is on the login identifier page
      Then the Google and Apple buttons are visible on the login page

    @TC-225L @critical @regression @third-party @staging-only @no-auth
    Scenario Outline: TC-225L OAuth redirect to <provider> from login page
      Given user is on the login identifier page
      When user click the "Continue with <provider>" button
      Then user is redirected to "<provider>" OAuth consent

      Examples:
        | provider |
        | Google   |
        | Apple    |

    @TC-191L @high @regression @no-auth
    Scenario: TC-191L Social buttons hidden on password step
      Given user is on the login password step
      Then the social login buttons are not visible

  # ═══════════════════════════════════════════════════════════════
  # Password Reset
  # ═══════════════════════════════════════════════════════════════

  Rule: Password reset
    Background:
      Given user is on the forgot password page from login

    @TC-276 @TC-277 @critical @regression @no-auth
    Scenario: TC-276/277 Reset form pre-filled and Back returns to login
      Then the reset email field is pre-filled with "test@example.com"
      When user click the "Back" button
      Then the login screen is displayed without errors

    @TC-282 @TC-283 @TC-284 @TC-285 @critical @regression @no-auth
    Scenario: TC-282/283/284/285 Reset submission — empty error, valid email confirmation
      When user submit reset email ""
      Then an inline error is displayed
      When user submit reset email "test@example.com"
      Then the Check Your Email page is displayed
      And the confirmation shows email "test@example.com"
      And the resend link is visible

  # ═══════════════════════════════════════════════════════════════
  # Accessibility & Page Quality
  # ═══════════════════════════════════════════════════════════════

  Rule: Accessibility and page quality

    @TC-301 @TC-302 @TC-303 @high @regression @no-auth
    Scenario: TC-301/302/303 Input labels, live region, and password toggle a11y
      Given user is on the login page with language "English"
      Then every input has a label
      When user click the Continue button
      Then a live region exists on the page
      Given user is on the login password step
      Then the password toggle has an accessible label

    @TC-306 @TC-307 @TC-308 @high @regression @no-auth
    Scenario: TC-306/307/308 Page titles and sentence-case labels
      Given user is on the login page with language "English"
      Then form labels use sentence case
      Given user is on the signup identifier page
      Then the page title contains "SleekFlow"
      And form labels use sentence case
      When user enter email "qa+title@sleekflow.io"
      And user accept the Terms of Service
      And user click the Sign up button
      Then the password step is displayed
      And the page title contains "SleekFlow"

  # ═══════════════════════════════════════════════════════════════
  # Responsive Layout
  # ═══════════════════════════════════════════════════════════════

  Rule: Responsive layout

    @TC-288 @high @regression @no-auth
    Scenario Outline: TC-288 No horizontal scroll at <width>px on <page>
      Given user is on the "<page>" page at viewport width <width>px
      Then no horizontal scrollbar is present

      Examples:
        | page           | width |
        | login          |   375 |
        | login          |   768 |
        | login          |  1280 |
        | signup         |   375 |
        | signup         |   768 |
        | signup         |  1280 |
        | forgot-password|   375 |
        | forgot-password|   768 |
        | forgot-password|  1280 |

    @TC-289 @TC-290 @TC-292 @high @regression @no-auth
    Scenario: TC-289/290/292 Layout — single-column at 768, two-column and form visible at 1280
      Given user is on the login page at viewport width 768px
      Then the layout is single-column
      Given user is on the login page at viewport width 1280px
      Then the layout has two columns
      And the form card is fully visible
