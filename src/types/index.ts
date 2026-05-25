/**
 * Global TypeScript types shared across the app.
 * Feature-specific types live alongside their feature code.
 */

// ── Mood Tracker ─────────────────────────────────────────────
/** Fixed emotion set from the data model. */
export type Mood =
  | 'Happy'
  | 'Sad'
  | 'Anxious'
  | 'Calm'
  | 'Angry'
  | 'Excited'
  | 'Tired'
  | 'Neutral';

// ── API ───────────────────────────────────────────────────────
/** Standard envelope for all API responses. */
export type ApiResponse<T = unknown> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ── Auth ─────────────────────────────────────────────────────
/** JWT payload stored in the session cookie. */
export interface JwtPayload {
  sub: string;   // user UUID
  email: string;
  iat: number;
  exp: number;
}
