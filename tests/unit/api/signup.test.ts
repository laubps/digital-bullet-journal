/**
 * @jest-environment node
 */

jest.mock('@/lib/auth/users', () => ({
  emailExists: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn(),
}));
jest.mock('@/lib/auth/jwt', () => ({
  signSession: jest.fn(),
}));

import { emailExists, createUser } from '@/lib/auth/users';
import { hashPassword } from '@/lib/auth/password';
import { signSession } from '@/lib/auth/jwt';
import { POST } from '@/app/api/auth/signup/route';

const mockEmailExists = emailExists as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockHash = hashPassword as jest.Mock;
const mockSign = signSession as jest.Mock;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: 'Laura',
  lastName: 'Pérez',
  email: 'laura@example.com',
  password: 'securePass1',
  confirmPassword: 'securePass1',
};

beforeEach(() => {
  mockEmailExists.mockReset();
  mockCreateUser.mockReset();
  mockHash.mockReset();
  mockSign.mockReset();
});

describe('POST /api/auth/signup — validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when firstName missing', async () => {
    const res = await POST(makeRequest({ ...validBody, firstName: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('firstName');
  });

  it('returns 400 when lastName missing', async () => {
    const res = await POST(makeRequest({ ...validBody, lastName: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('lastName');
  });

  it('returns 400 on malformed email', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'bad' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('email');
  });

  it('returns 400 when password too short', async () => {
    const res = await POST(makeRequest({ ...validBody, password: 'abc', confirmPassword: 'abc' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('password');
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await POST(makeRequest({ ...validBody, confirmPassword: 'different' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('confirmPassword');
  });
});

describe('POST /api/auth/signup — business logic', () => {
  it('returns 409 when email already exists', async () => {
    mockEmailExists.mockResolvedValue(true);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.field).toBe('email');
  });

  it('returns 201 + session cookie on successful signup', async () => {
    mockEmailExists.mockResolvedValue(false);
    mockHash.mockResolvedValue('hashed-pw');
    mockCreateUser.mockResolvedValue(undefined);
    mockSign.mockResolvedValue('signed.jwt');

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.email).toBe('laura@example.com');
    expect(body.firstName).toBe('Laura');
    expect(typeof body.id).toBe('string');

    const cookie = res.headers.get('set-cookie') || '';
    expect(cookie).toMatch(/token=signed\.jwt/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('calls createUser with hashed password, not plain text', async () => {
    mockEmailExists.mockResolvedValue(false);
    mockHash.mockResolvedValue('bcrypt-hash');
    mockCreateUser.mockResolvedValue(undefined);
    mockSign.mockResolvedValue('tok');

    await POST(makeRequest(validBody));

    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'bcrypt-hash' }),
    );
    const call = mockCreateUser.mock.calls[0][0];
    expect(call).not.toHaveProperty('password');
  });

  it('returns 500 when DB throws', async () => {
    mockEmailExists.mockRejectedValue(new Error('DB down'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
