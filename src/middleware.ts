import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Paths accessible without a valid session token. */
const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth pages
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isPublic) return NextResponse.next();

  // Check for session token (set as httpOnly cookie in Step 4)
  const token = request.cookies.get('token');
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Run middleware on all routes except:
   * - Next.js internals (_next/static, _next/image)
   * - favicon
   * - API routes (each API route handles its own auth)
   */
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/).*)',],
};
