import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export type SessionClaims = {
  sub: string;
  email: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing required environment variable: JWT_SECRET');
  return new TextEncoder().encode(secret);
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '7d';
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(getExpiresIn())
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, getSecret());
  return claimsFromPayload(payload);
}

function claimsFromPayload(payload: JWTPayload): SessionClaims {
  if (typeof payload.sub !== 'string') throw new Error('Invalid token: missing sub');
  if (typeof payload.email !== 'string') throw new Error('Invalid token: missing email');
  return { sub: payload.sub, email: payload.email };
}
