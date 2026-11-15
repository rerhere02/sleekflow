# Analysis: sleekflow-login-signup-007-company-setup

## AC Extraction

| AC | Text |
|---|---|
| AC1 | Setup at /en/register-company: 6 progress dots, Back on steps 2–6, Next or Enter to proceed, "Server region: Singapore" read-only. |
| AC2 | Company name (required — shows "Required" on empty) and website ("Please enter a valid website URL" on invalid), both pre-filled from email domain. |
| AC3 | Industry, single choice of 10 options, moves on when picked; "Others" opens "Please specify your industry" text input. |
| AC4 | Goal, single choice of 5: shared Inbox, AI agent, marketing campaign, WhatsApp experience, Live Chat widget. |
| AC5 | Main channel (single of 10, incl. "I don't have one"), then other channels (optional multi-select). |
| AC6 | Apps to connect (optional multi-select: HubSpot, Salesforce, Zoho, Vtex, Google Sheets, Shopify, booking tools, Other). |
| AC7 | Name and Contact number required (country picker with search, defaulted to +62 for ID users); "Enter a valid phone number." on invalid; "Get started" disabled until valid. |
| AC8 | Setup step 6 newsletter checkbox reads "Send me product news and offers", unticked by default. Only a ticked box sets marketing consent with timestamp. Current text reads "I prefer not to receive newsletters" (opt-out). |
| AC9 | Given gmail.com, yahoo.com, outlook.com, icloud.com or similar, setup step 1 shows empty company fields instead of pre-filling domain-based company name. |

## SFDIPOT Risk Scan

| Dimension | Risk |
|---|---|
| Structure | 6-step sequential flow; Back available on 2–6; each step has distinct entry/exit conditions. |
| Function | Pre-fill logic differs by domain type (business vs free-mail). "Others" industry triggers conditional text field. "Get started" disables until valid input. |
| Data | Company name required, website optional with URL validation, phone required with format validation. Free-mail domain list open-ended ("or similar"). |
| Interface | Country picker with search. Progress dot indicator. Step transitions via Next/Enter. |
| Platform | Web only. |
| Operations | Partial completion / mid-flow back navigation. Marketing consent audit timestamp. |
| Time | Consent timestamp must be stored with the marketing opt-in. |

## Risk Signals

- Role/permission: consent checkbox defaulted OFF — opt-in model change from opt-out (P0-5).
- Conditional field: "Others" industry option reveals additional text input.
- State transition: "Get started" button disabled state enforcement.
- Data constraint: free-mail domain detection (open item — test named domains).
- Audit: marketing consent timestamp must be captured.

## Test Case Plan (TC-247 to TC-265)

| TC | Title Summary | AC | Priority | Tags |
|---|---|---|---|---|
| TC-247 | Company setup flow opens with 6 progress dots and read-only server region after email verification | AC1 | Critical | positive, sanity, regression, onboarding |
| TC-248 | "Required" error appears on company name when user proceeds with empty company name | AC2 | High | negative, regression, onboarding |
| TC-249 | "Please enter a valid website URL" error appears when invalid website is submitted | AC2 | Medium | negative, regression, onboarding |
| TC-250 | Company name and website are pre-filled from email domain on step 1 | AC2 | High | positive, sanity, regression, onboarding |
| TC-251 | Step 1 company fields are blank when a free-mail domain email is used | AC9 | High | functionality, regression, onboarding |
| TC-252 | Step 2 advances automatically when an industry option is selected | AC3 | Medium | positive, sanity, onboarding |
| TC-253 | "Please specify your industry" text input appears when Others is selected in step 2 | AC3 | Medium | functionality, regression, onboarding |
| TC-254 | Step 3 goal selection shows all 5 options and advances when one is chosen | AC4 | Medium | positive, sanity, onboarding |
| TC-255 | Step 4 main channel accepts single selection including "I don't have one" | AC5 | Medium | positive, sanity, onboarding |
| TC-256 | Step 4 other channels can be multi-selected independently of main channel | AC5 | Medium | functionality, onboarding |
| TC-257 | Step 5 apps-to-connect multi-select can be skipped without selection | AC6 | Medium | functionality, onboarding |
| TC-258 | "Get started" button remains disabled when contact number is invalid on step 6 | AC7 | High | negative, regression, onboarding |
| TC-259 | Setup is completed successfully when all required fields on step 6 are valid | AC7 | Critical | positive, sanity, regression, onboarding |
| TC-260 | Country code defaults to +62 for Indonesia-locale users on step 6 | AC7 | Medium | functionality, onboarding |
| TC-261 | "Enter a valid phone number." error appears when an invalid phone number is entered on step 6 | AC7 | Medium | negative, regression, onboarding |
| TC-262 | Newsletter checkbox is unticked by default and reads "Send me product news and offers" on step 6 | AC8 | High | positive, sanity, regression, onboarding |
| TC-263 | Marketing consent with timestamp is stored when newsletter checkbox is ticked and form submitted | AC8 | High | functionality, regression, onboarding |
| TC-264 | Marketing consent is not set when newsletter checkbox remains unticked on submission | AC8 | High | functionality, regression, onboarding |
| TC-265 | Back navigation from step 6 to step 5 preserves previously entered data | AC1 | Medium | functionality, onboarding |
