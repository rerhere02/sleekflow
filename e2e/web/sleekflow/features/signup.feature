@no-auth @prod-safe
Feature: Signup
  Covers: identifier step, password step, email validation, consent,
  social OAuth, existing-email handling, and the full end-to-end journey
  (signup → email verification → company setup → onboarding).

  # ═══════════════════════════════════════════════════════════════
  # Identifier Step
  # ═══════════════════════════════════════════════════════════════

  @TC-199 @medium @sanity
  Scenario: TC-199 Signup page loads with email field and unticked consent
    Given user is on the signup identifier page
    Then the signup identifier page is displayed
    And the consent checkbox is unticked

  @TC-200 @critical @regression @smoke
  Scenario: TC-200 Password step reached with valid email and ticked consent
    Given user is on the signup identifier page
    When user enter email "qa+signup@sleekflow.io"
    And user accept the Terms of Service
    And user click the Sign up button
    Then the password step is displayed

  @TC-201 @high @regression
  Scenario: TC-201 Error when email is empty
    Given user is on the signup identifier page
    When user accept the Terms of Service
    And user click the Sign up button
    Then an inline error is displayed

  @TC-202 @high @regression
  Scenario Outline: TC-202 Error when email is malformed (<email>)
    Given user is on the signup identifier page
    When user enter email "<email>"
    And user accept the Terms of Service
    And user click the Sign up button
    Then the error "Email is not valid." is displayed

    Examples:
      | email          |
      | not-an-email   |
      | missing@dot    |
      | @no-local.com  |

  @TC-203 @TC-204 @high @regression
  Scenario: TC-203/204 Consent error — visible, focused, announced via live region
    Given user is on the signup identifier page
    When user enter email "qa+consent@sleekflow.io"
    And user click the Sign up button
    Then the consent error is visible under the checkbox
    And focus is on the consent checkbox
    And the live region announces the consent error

  @TC-209 @low
  Scenario: TC-209 Terms and Privacy Policy links are navigable
    Given user is on the signup identifier page
    Then the Terms of Service link is navigable
    And the Privacy Policy link is navigable

  # ═══════════════════════════════════════════════════════════════
  # Password Step
  # ═══════════════════════════════════════════════════════════════

  @TC-211 @TC-212 @TC-213 @high @regression @smoke
  Scenario: TC-211/212/213 Password checklist, criteria tracking, and show/hide toggle
    Given user is on the signup password step
    When user enter password "a"
    Then the password checklist is displayed
    And the password checklist marks only "lower-case" as met
    When user enter password "Aa1!xxxx"
    Then the password checklist reflects all criteria met
    When user click the show/hide password toggle
    Then password text is "visible"
    When user click the show/hide password toggle
    Then password text is "masked"

  @TC-214 @TC-216 @high @regression
  Scenario: TC-214/216 Email is non-editable, Edit returns to identifier step
    Given user is on the signup password step
    Then the email field is non-editable on the password step
    When user click the "Edit" link
    Then the signup identifier page is displayed
    And no error is displayed

  @TC-217 @high @regression
  Scenario: TC-217 Error when password is empty
    Given user is on the signup password step
    When user click the Sign up button
    Then an inline error is displayed

  @TC-218 @high @regression
  Scenario Outline: TC-218 Error when password is too weak (<weak_password>)
    Given user is on the signup password step
    When user enter password "<weak_password>"
    And user click the Sign up button
    Then an inline error is displayed

    Examples:
      | weak_password |
      | short1!       |
      | alllowercase  |
      | ALLUPPERCASE  |

  @TC-219 @critical @regression @creates-account
  Scenario: TC-219 Signup advances when password meets all criteria
    Given user is on the signup password step
    When user enter password "Str0ng!Pass"
    And user click the Sign up button
    Then the signup advances past the password step

  # ═══════════════════════════════════════════════════════════════
  # Existing Email Handling
  # ═══════════════════════════════════════════════════════════════

  @TC-231 @TC-232 @high @regression
  Scenario: TC-231/232 Existing email — no early error, registration fails after password
    Given user is on the signup identifier page
    When user enter email "existing-user@sleekflow.io"
    And user accept the Terms of Service
    And user click the Sign up button
    Then the password step is displayed
    And no account-exists notice is displayed
    When user enter password "Str0ng!Pass"
    And user click the Sign up button
    Then the registration failure message is displayed

  # ═══════════════════════════════════════════════════════════════
  # Social / OAuth Signup
  # ═══════════════════════════════════════════════════════════════

  @TC-224 @high @regression
  Scenario: TC-224 Google and Apple buttons visible on signup page
    Given user is on the signup identifier page
    Then the Google and Apple buttons are visible

  @TC-225 @critical @regression @third-party @staging-only @creates-account
  Scenario Outline: TC-225 OAuth redirect to <provider> consent screen
    Given user is on the signup identifier page
    When user click the "Continue with <provider>" button
    Then user is redirected to "<provider>" OAuth consent

    Examples:
      | provider |
      | Google   |
      | Apple    |

  # ═══════════════════════════════════════════════════════════════
  # Full End-to-End Journey
  # Signup → Email Verification → Company Setup → Onboarding
  # ═══════════════════════════════════════════════════════════════

  @TC-311 @TC-242 @TC-259 @TC-266 @TC-268 @critical @regression @smoke @creates-account @serial
  Scenario: TC-311 Full signup to onboarding journey
    Given user is on the signup identifier page
    When user enter a fresh test email
    And user accept the Terms of Service
    And user click the Sign up button
    Then the password step is displayed
    When user enter password "Str0ng!Pass"
    And user click the Sign up button
    # Email Verification
    Then the email verification screen is displayed
    When user complete email verification
    # Company Setup
    Then the company setup page is displayed with progress dots
    When user fill company name with "QA Auto Corp"
    And user fill company website with "https://qatest.io"
    And user click the Next button
    And user select industry "Education"
    And user click the Next button
    And user select goal "A shared Inbox for my team"
    And user click the Next button
    And user select channel "WhatsApp"
    And user click the Next button
    And user click the Next button
    And user fill contact name with "QA Tester"
    And user fill contact number with "81234567890"
    And user click the Get started button
    # Onboarding
    Then the onboarding checklist is displayed
    And the trial banner is visible
    # Cleanup
    When user delete the test account via API
