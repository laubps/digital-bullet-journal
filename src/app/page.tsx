import { redirect } from 'next/navigation';

/**
 * Root page — unauthenticated users land on login.
 * The middleware handles authenticated redirects to /dashboard.
 */
export default function HomePage() {
  redirect('/login');
}
