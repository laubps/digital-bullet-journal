/**
 * Public surface for DB access.
 * All other modules import from here — never directly from pool.ts or vault.ts.
 */
export { getPool, closePool } from './pool';
