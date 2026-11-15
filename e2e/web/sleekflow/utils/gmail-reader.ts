/**
 * Gmail IMAP helper — reads verification codes from Gmail.
 * Uses the signup email (+tag address) as the IMAP username.
 * Gmail treats +tag addresses as the same account, so the same app password works.
 * Requires env vars: TEST_EMAIL, GMAIL_APP_PASSWORD
 */
import { ImapFlow } from 'imapflow';

export async function getVerificationCode(
  recipientEmail: string,
  timeoutMs = 90_000,
  signupTimestamp = Date.now(),
): Promise<string> {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error('GMAIL_APP_PASSWORD must be set in .env to read verification emails');
  }

  // Gmail IMAP auth requires the base email (without +tag) — strip it
  const baseEmail = recipientEmail.replace(/\+[^@]*/, '');

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: baseEmail, pass },
    logger: false,
    emitLogs: false,
  });

  // Suppress unhandled socket errors (ECONNRESET on close)
  client.on('error', () => {});

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      // Search emails since 1 minute before signup — tight window to avoid stale matches
      const since = new Date(signupTimestamp - 60_000);
      const results = await client.search({
        since,
      }) as number[] | false;

      if (results && results.length > 0) {
        // Iterate newest-first to find the code for the specific recipient
        for (let i = results.length - 1; i >= 0; i--) {
          const uid = results[i];
          const msg = await client.fetchOne(uid, { source: true }) as { source: Buffer };
          const raw = msg.source.toString();

          // Verify this email is actually addressed to the specific +tag recipient
          if (!raw.includes(recipientEmail)) continue;

          // Match the SleekFlow subject pattern: "XXXXXX is your SleekFlow verification code"
          const codeMatch = raw.match(/(\d{6})\s+is your SleekFlow verification code/i)
            ?? raw.match(/verification\s+code[:\s]+(\d{6})/i)
            ?? raw.match(/Subject:.*?(\d{6})/);
          if (codeMatch) {
            console.log(`[GMAIL] Verification code found: ${codeMatch[1]} (for ${recipientEmail})`);
            return codeMatch[1];
          }
        }
      }

      console.log(`[GMAIL] No code yet for ${recipientEmail}, polling...`);
      await new Promise(r => setTimeout(r, 5_000));
    }

    throw new Error(
      `No verification code found for ${recipientEmail} within ${timeoutMs / 1000}s`,
    );
  } finally {
    try { await client.logout(); } catch { /* ignore close errors */ }
  }
}
