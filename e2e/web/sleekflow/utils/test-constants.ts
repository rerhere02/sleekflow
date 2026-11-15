/** Generate a unique test email for signup flows. Uses Gmail so verification emails are actually delivered. */
let emailCounter = 0;
export function generateTestEmail(): string {
  const ts = Date.now();
  const suffix = (++emailCounter).toString(36);
  return `sftestq+${ts}${suffix}@gmail.com`;
}

/** Primary test account — set via TEST_EMAIL / TEST_PASSWORD env vars. */
export const TEST_EMAIL = process.env.TEST_EMAIL ?? 'sftestq+owner@gmail.com';
export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'P@ssword123';

export const DEFAULT_TEST_PASSWORD = 'TestP@ss1!';

export const SEED_EMAILS = {
  OWNER: 'sftest_owner@mailinator.com',
  UNVERIFIED: 'sftest_unverified@mailinator.com',
} as const;
