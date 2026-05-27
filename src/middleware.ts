import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Paths that only unauthenticated users should see. */
const AUTH_ONLY_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token');
  const isAuthenticated = Boolean(token);

  const isAuthPage = AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Authenticated user trying to access login/signup or root → send to dashboard
  if (isAuthenticated && (isAuthPage || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user trying to access a protected route → send to login
  if (!isAuthenticated && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|videos/|images/|fonts/).*)',],
};
