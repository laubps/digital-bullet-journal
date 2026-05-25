import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

type DbStatus = 'connected' | 'error';

/**
 * GET /api/health
 * Checks both server liveness and DB connectivity.
 *
 * Responses:
 *   200 { status: "ok",       db: "connected", timestamp }
 *   503 { status: "degraded", db: "error",     timestamp }
 */
export async function GET() {
  let dbStatus: DbStatus = 'error';

  try {
    const pool = await getPool();
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();
    dbStatus = 'connected';
  } catch (err) {
    console.error('[health] DB check failed:', err);
  }

  const ok = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
