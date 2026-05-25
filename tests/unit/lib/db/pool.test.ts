/**
 * @jest-environment node
 *
 * pool.ts manages the oracledb connection pool singleton.
 * oracledb and vault are both fully mocked — no real DB or Vault calls.
 *
 * Note: jest.mock() factories must NOT reference variables declared outside
 * them — SWC hoists jest.mock() before those declarations, causing a TDZ error.
 * All mock wiring is done in beforeEach() instead.
 */

jest.mock('oracledb', () => ({
  __esModule: true,
  default: { createPool: jest.fn() },
}));

jest.mock('@/lib/db/vault', () => ({
  getCredentials: jest.fn().mockResolvedValue({
    db_user: 'testuser',
    db_password: 'testpass',
    wallet_password: 'walletpass',
    connection_string: 'journaldb_medium',
  }),
}));

import oracledb from 'oracledb';
import { getPool, closePool, _resetPool } from '@/lib/db/pool';

// Typed references to the mocks — defined here (after hoisting), not inside factories
const createPool = oracledb.createPool as jest.Mock;
const mockPoolClose = jest.fn();
const mockPool = { close: mockPoolClose };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('getPool()', () => {
  beforeEach(() => {
    _resetPool();
    createPool.mockReset();
    createPool.mockResolvedValue(mockPool);
    process.env.DB_WALLET_LOCATION = '/mock/wallet';
  });

  it('creates a pool with the correct mTLS configuration', async () => {
    await getPool();
    expect(createPool).toHaveBeenCalledWith(
      expect.objectContaining({
        user: 'testuser',
        password: 'testpass',
        connectString: 'journaldb_medium',
        walletLocation: '/mock/wallet',
        walletPassword: 'walletpass',
        configDir: '/mock/wallet',
      }),
    );
  });

  it('returns the same pool instance on subsequent calls (singleton)', async () => {
    const first = await getPool();
    const second = await getPool();
    expect(first).toBe(second);
    expect(createPool).toHaveBeenCalledTimes(1);
  });

  it('throws when DB_WALLET_LOCATION env var is missing', async () => {
    delete process.env.DB_WALLET_LOCATION;
    await expect(getPool()).rejects.toThrow('DB_WALLET_LOCATION');
  });
});

describe('closePool()', () => {
  beforeEach(() => {
    _resetPool();
    createPool.mockReset();
    mockPoolClose.mockReset();
    createPool.mockResolvedValue(mockPool);
    process.env.DB_WALLET_LOCATION = '/mock/wallet';
  });

  it('closes the pool with drain timeout 0 and resets the singleton', async () => {
    await getPool();
    await closePool();
    expect(mockPoolClose).toHaveBeenCalledWith(0);
    // After closing, getPool() must create a fresh pool
    await getPool();
    expect(createPool).toHaveBeenCalledTimes(2);
  });

  it('does nothing when called before the pool is initialised', async () => {
    await expect(closePool()).resolves.not.toThrow();
    expect(mockPoolClose).not.toHaveBeenCalled();
  });
});
