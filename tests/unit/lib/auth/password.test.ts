/** @jest-environment node */

import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('hashes a password to a non-empty string that is not the plaintext', async () => {
    const hash = await hashPassword('hunter2');
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('hunter2');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('produces a different hash each call for the same password (salt)', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct-pw');
    expect(await verifyPassword('correct-pw', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('right');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
