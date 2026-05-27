import { redirect } from 'next/navigation';

/**
 * Root page — middleware handles all redirects:
 *   authenticated   → /dashboard
 *   unauthenticated → /login
 * This fallback should never be reached in practice.
 */
export default function HomePage() {
  redirect('/login');
}
