import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { hashPassword } from '@/lib/auth/password';
import { signSession } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';
import { emailExists, createUser } from '@/lib/auth/users';
import { validateSignupInput } from '@/lib/auth/validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const validation = validateSignupInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }
  const { firstName, lastName, email, password } = validation.fields;

  try {
    const exists = await emailExists(email);
    if (exists) {
      return NextResponse.json(
        { error: 'an account with this email already exists', field: 'email' },
        { status: 409 },
      );
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    await createUser({ id, email, passwordHash, firstName, lastName });

    const token = await signSession({ sub: id, email });
    const response = NextResponse.json({ id, email, firstName, lastName }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[auth/signup] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
