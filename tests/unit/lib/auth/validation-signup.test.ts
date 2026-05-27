/** @jest-environment node */

import { validateSignupInput, MIN_PASSWORD_LENGTH } from '@/lib/auth/validation';

const valid = {
  firstName: 'Laura',
  lastName: 'Pérez',
  email: 'laura@example.com',
  password: 'securePass1',
  confirmPassword: 'securePass1',
};

describe('validateSignupInput — happy path', () => {
  it('returns ok with trimmed fields', () => {
    const result = validateSignupInput({ ...valid, firstName: '  Laura  ', email: '  laura@example.com  ' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.firstName).toBe('Laura');
      expect(result.fields.email).toBe('laura@example.com');
    }
  });
});

describe('validateSignupInput — firstName', () => {
  it('rejects empty firstName', () => {
    const r = validateSignupInput({ ...valid, firstName: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('firstName');
  });
  it('rejects whitespace-only firstName', () => {
    const r = validateSignupInput({ ...valid, firstName: '   ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('firstName');
  });
});

describe('validateSignupInput — lastName', () => {
  it('rejects empty lastName', () => {
    const r = validateSignupInput({ ...valid, lastName: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('lastName');
  });
});

describe('validateSignupInput — email', () => {
  it('rejects empty email', () => {
    const r = validateSignupInput({ ...valid, email: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('email');
  });
  it('rejects malformed email', () => {
    const r = validateSignupInput({ ...valid, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('email');
  });
});

describe('validateSignupInput — password', () => {
  it('rejects empty password', () => {
    const r = validateSignupInput({ ...valid, password: '', confirmPassword: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('password');
  });
  it(`rejects password shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    const short = 'abc';
    const r = validateSignupInput({ ...valid, password: short, confirmPassword: short });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('password');
  });
  it('rejects mismatched passwords', () => {
    const r = validateSignupInput({ ...valid, confirmPassword: 'different' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('confirmPassword');
  });
});
