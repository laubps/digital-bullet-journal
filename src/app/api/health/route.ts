import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Basic liveness check — confirms the Next.js server is running.
 * Does NOT verify DB connectivity (that is checked in Step 3).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
