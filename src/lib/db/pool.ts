import type { Pool } from 'oracledb';
import { getCredentials } from './vault';

/** Singleton pool — one per Node.js process. */
let pool: Pool | null = null;

/**
 * Returns the shared connection pool, creating it on first call.
 *
 * oracledb is dynamically imported inside this function so webpack never
 * encounters it during compilation. This prevents the build from hanging
 * when analysing native modules.
 *
 * mTLS is configured via the Oracle wallet at DB_WALLET_LOCATION:
 *   - walletLocation  → directory with ewallet.p12
 *   - walletPassword  → decrypts ewallet.p12
 *   - configDir       → directory with tnsnames.ora for TNS alias resolution
 */
export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  const walletLocation = process.env.DB_WALLET_LOCATION;
  if (!walletLocation) {
    throw new Error('Missing required environment variable: DB_WALLET_LOCATION');
  }

  const credentials = await getCredentials();

  // Dynamic import — invisible to webpack at build time
  const { default: oracledb } = await import('oracledb');

  pool = await oracledb.createPool({
    user: credentials.db_user,
    password: credentials.db_password,
    connectString: credentials.connection_string,
    walletLocation,
    walletPassword: credentials.wallet_password,
    configDir: walletLocation,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60,
  });

  return pool;
}

/**
 * Gracefully drains and closes the pool.
 * Call this during server shutdown (e.g. SIGTERM handler).
 */
export async function closePool(): Promise<void> {
  if (!pool) return;
  await pool.close(0);
  pool = null;
}

/** Resets the pool singleton. Exposed for testing only. */
export function _resetPool(): void {
  pool = null;
}
