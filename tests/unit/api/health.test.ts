/**
 * @jest-environment node
 *
 * API route tests must run in the Node.js environment so that the
 * Web Fetch globals (Request, Response, Headers) that Next.js relies
 * on are available natively (Node 18+).
 *
 * Note: jest.mock() factories must NOT reference variables declared outside
 * them — SWC hoists jest.mock() before those declarations, causing a TDZ error.
 * All mock wiring is done in beforeEach() instead.
 */

jest.mock('@/lib/db', () => ({
  getPool: jest.fn(),
}));

import { getPool } from '@/lib/db';
import { GET } from '@/app/api/health/route';

// Typed references — defined here (after hoisting), not inside factories
const mockGetPool = getPool as jest.Mock;
const mockExecute = jest.fn();
const mockConnectionClose = jest.fn();
const mockGetConnection = jest.fn();

// ── helpers ───────────────────────────────────────────────────────────────────

function setupHealthyDb() {
  mockGetConnection.mockResolvedValue({
    execute: mockExecute,
    close: mockConnectionClose,
  });
  mockExecute.mockResolvedValue({});
  mockGetPool.mockResolvedValue({ getConnection: mockGetConnection });
}

function setupUnhealthyDb(message = 'ORA-12541: TNS no listener') {
  mockGetPool.mockResolvedValue({
    getConnection: jest.fn().mockRejectedValue(new Error(message)),
  });
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/health — DB healthy', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockConnectionClose.mockReset();
    mockGetConnection.mockReset();
    setupHealthyDb();
  });

  it('returns HTTP 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns status "ok" and db "connected"', async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');
  });

  it('returns a valid ISO timestamp within the test window', async () => {
    const before = new Date().toISOString();
    const response = await GET();
    const after = new Date().toISOString();
    const body = await response.json();
    expect(typeof body.timestamp).toBe('string');
    expect(body.timestamp >= before).toBe(true);
    expect(body.timestamp <= after).toBe(true);
  });

  it('closes the DB connection after the check', async () => {
    await GET();
    expect(mockConnectionClose).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/health — DB unreachable', () => {
  beforeEach(() => {
    setupUnhealthyDb();
  });

  it('returns HTTP 503', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
  });

  it('returns status "degraded" and db "error"', async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.db).toBe('error');
  });
});
