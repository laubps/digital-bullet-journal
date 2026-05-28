import { cookies } from 'next/headers';
import { verifySession, type SessionClaims } from './jwt';
import { SESSION_COOKIE } from './session';

export type Session = { userId: string; email: string };

/**
 * Reads and verifies the session JWT from the httpOnly cookie.
 * Returns null when the cookie is missing or the token is invalid/expired.
 * Use this inside Route Handlers (App Router) to gate access.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const claims: SessionClaims = await verifySession(token);
    return { userId: claims.sub, email: claims.email };
  } catch {
    return null;
  }
}
