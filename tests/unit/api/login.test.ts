/**
 * @jest-environment node
 *
 * Tests POST /api/auth/login.
 * jest.mock factories cannot reference outer variables (SWC hoists them),
 * so we attach mocks via beforeEach.
 */

jest.mock('@/lib/auth/users', () => ({
  findUserByEmail: jest.fn(),
}));
jest.mock('@/lib/auth/password', () => ({
  verifyPassword: jest.fn(),
}));
jest.mock('@/lib/auth/jwt', () => ({
  signSession: jest.fn(),
}));

import { findUserByEmail } from '@/lib/auth/users';
import { verifyPassword } from '@/lib/auth/password';
import { signSession } from '@/lib/auth/jwt';
import { POST } from '@/app/api/auth/login/route';

const mockFindUser = findUserByEmail as jest.Mock;
const mockVerify = verifyPassword as jest.Mock;
const mockSign = signSession as jest.Mock;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFindUser.mockReset();
  mockVerify.mockReset();
  mockSign.mockReset();
});

describe('POST /api/auth/login — validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(makeRequest('{not json'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email missing', async () => {
    const res = await POST(makeRequest({ password: 'x' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('email');
  });

  it('returns 400 on malformed email', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'x' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('email');
  });

  it('returns 400 when password missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.co' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('password');
  });

  it('trims whitespace from email before lookup', async () => {
    mockFindUser.mockResolvedValue(null);
    await POST(makeRequest({ email: '  user@example.com  ', password: 'pw' }));
    expect(mockFindUser).toHaveBeenCalledWith('user@example.com');
  });
});

describe('POST /api/auth/login — authentication', () => {
  it('returns 401 with generic message when user not found', async () => {
    mockFindUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'pw' }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/incorrect/);
    // Make sure we don't leak which field was wrong
    expect(body.field).toBeUndefined();
  });

  it('returns 401 when password is wrong', async () => {
    mockFindUser.mockResolvedValue({ id: 'u1', email: 'a@b.co', passwordHash: 'h' });
    mockVerify.mockResolvedValue(false);
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'pw' }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/incorrect/);
  });

  it('returns 200 + sets session cookie when credentials are valid', async () => {
    mockFindUser.mockResolvedValue({ id: 'u1', email: 'a@b.co', passwordHash: 'h' });
    mockVerify.mockResolvedValue(true);
    mockSign.mockResolvedValue('signed.jwt.token');

    const res = await POST(makeRequest({ email: 'a@b.co', password: 'pw' }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ id: 'u1', email: 'a@b.co' });

    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toMatch(/token=signed\.jwt\.token/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Path=\//);
  });

  it('returns 500 when DB lookup throws', async () => {
    mockFindUser.mockRejectedValue(new Error('DB down'));
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'pw' }));
    expect(res.status).toBe(500);
  });
});
