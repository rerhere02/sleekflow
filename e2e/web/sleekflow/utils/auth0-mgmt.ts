/**
 * Auth0 Management API helper for test lifecycle operations.
 * Requires env vars: AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET
 */
import { getConfig } from './config';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getManagementToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'AUTH0_M2M_CLIENT_ID and AUTH0_M2M_CLIENT_SECRET must be set in .env for email verification and account cleanup',
    );
  }

  const { ssoUrl } = getConfig();
  const resp = await fetch(`${ssoUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `${ssoUrl}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Auth0 M2M token request failed (${resp.status}): ${body}`);
  }

  const data = await resp.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

async function mgmtRequest(method: string, path: string, body?: object): Promise<any> {
  const token = await getManagementToken();
  const { ssoUrl } = getConfig();
  const resp = await fetch(`${ssoUrl}/api/v2${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Auth0 API ${method} ${path} failed (${resp.status}): ${text}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

/** Find Auth0 user by email. Returns the first match or null. */
export async function findUserByEmail(email: string): Promise<{ user_id: string } | null> {
  const users = await mgmtRequest('GET', `/users-by-email?email=${encodeURIComponent(email)}`);
  return users?.[0] ?? null;
}

/** Mark user's email as verified. */
export async function verifyEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error(`User not found: ${email}`);
  await mgmtRequest('PATCH', `/users/${encodeURIComponent(user.user_id)}`, {
    email_verified: true,
  });
  console.log(`[AUTH0] Email verified for ${email}`);
}

/** Delete user from Auth0. */
export async function deleteUser(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) {
    console.log(`[AUTH0] User not found for deletion: ${email}`);
    return;
  }
  await mgmtRequest('DELETE', `/users/${encodeURIComponent(user.user_id)}`);
  console.log(`[AUTH0] User deleted: ${email}`);
}
