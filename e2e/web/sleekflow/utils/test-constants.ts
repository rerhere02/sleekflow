/** Generate a unique test email for signup flows. Uses Gmail so verification emails are actually delivered. */
let emailCounter = 0;
export function generateTestEmail(): string {
  const base = process.env.TEST_EMAIL_BASE ?? TEST_EMAIL.replace(/\+.*@/, '+');
  const domain = TEST_EMAIL.split('@')[1];
  const ts = Date.now();
  const suffix = (++emailCounter).toString(36);
  return `${base}${ts}${suffix}@${domain}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}. See .env.example`);
  return value;
}

/** Primary test account — must be set via TEST_EMAIL / TEST_PASSWORD env vars. */
export const TEST_EMAIL = requireEnv('TEST_EMAIL');
export const TEST_PASSWORD = requireEnv('TEST_PASSWORD');
