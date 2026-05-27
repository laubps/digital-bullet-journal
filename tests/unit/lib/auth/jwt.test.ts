/** @jest-environment node */

import { signSession, verifySession } from '@/lib/auth/jwt';

const ORIGINAL_SECRET = process.env.JWT_SECRET;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-which-is-sufficiently-long-for-hs256-signing';
});

afterAll(() => {
  process.env.JWT_SECRET = ORIGINAL_SECRET;
});

describe('signSession / verifySession', () => {
  it('signs and verifies a session token round-trip', async () => {
    const token = await signSession({ sub: 'user-1', email: 'a@b.co' });
    const claims = await verifySession(token);
    expect(claims.sub).toBe('user-1');
    expect(claims.email).toBe('a@b.co');
  });

  it('throws on a tampered token', async () => {
    const token = await signSession({ sub: 'user-1', email: 'a@b.co' });
    const tampered = token.slice(0, -2) + 'AA';
    await expect(verifySession(tampered)).rejects.toBeDefined();
  });

  it('throws when JWT_SECRET is missing at sign time', async () => {
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      await expect(signSession({ sub: 'x', email: 'y@z.co' })).rejects.toThrow(/JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = saved;
    }
  });
});
