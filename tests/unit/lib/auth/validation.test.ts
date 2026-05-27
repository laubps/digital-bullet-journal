/** @jest-environment node */

import { validateLoginInput, EMAIL_REGEX } from '@/lib/auth/validation';

describe('EMAIL_REGEX', () => {
  it.each([
    'a@b.co',
    'first.last@example.com',
    'user+tag@example.io',
  ])('accepts valid email: %s', (e) => {
    expect(EMAIL_REGEX.test(e)).toBe(true);
  });

  it.each([
    '',
    'plainaddress',
    '@missing-local.com',
    'missing-domain@',
    'no-at-symbol.com',
    'no.dot@nodot',
    'spaces in@email.com',
  ])('rejects invalid email: %s', (e) => {
    expect(EMAIL_REGEX.test(e)).toBe(false);
  });
});

describe('validateLoginInput', () => {
  it('returns ok with trimmed email when valid', () => {
    const result = validateLoginInput('  user@example.com  ', 'pw');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('pw');
    }
  });

  it('rejects missing email', () => {
    const result = validateLoginInput('', 'pw');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe('email');
  });

  it('rejects whitespace-only email', () => {
    const result = validateLoginInput('   ', 'pw');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe('email');
  });

  it('rejects non-string email', () => {
    const result = validateLoginInput(123 as unknown, 'pw');
    expect(result.ok).toBe(false);
  });

  it('rejects malformed email', () => {
    const result = validateLoginInput('not-an-email', 'pw');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('email');
      expect(result.error.message).toMatch(/email/i);
    }
  });

  it('rejects missing password', () => {
    const result = validateLoginInput('user@example.com', '');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe('password');
  });

  it('rejects non-string password', () => {
    const result = validateLoginInput('user@example.com', null as unknown);
    expect(result.ok).toBe(false);
  });
});
