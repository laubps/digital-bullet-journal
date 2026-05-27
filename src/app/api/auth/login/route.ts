import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { signSession } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';
import { findUserByEmail } from '@/lib/auth/users';
import { validateLoginInput } from '@/lib/auth/validation';

export const runtime = 'nodejs';

const GENERIC_INVALID = 'email or password is incorrect';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const { email: rawEmail, password: rawPassword } = (body ?? {}) as Record<string, unknown>;
  const validation = validateLoginInput(rawEmail, rawPassword);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }
  const { email, password } = validation;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: GENERIC_INVALID }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: GENERIC_INVALID }, { status: 401 });
    }

    const token = await signSession({ sub: user.id, email: user.email });
    const response = NextResponse.json({ id: user.id, email: user.email });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[auth/login] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
