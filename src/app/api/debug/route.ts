import { NextResponse } from 'next/server';

/**
 * GET /api/debug
 * TEMPORARY — remove after diagnosing env var loading.
 * Shows which env vars are present (values masked for security).
 */
export async function GET() {
  const vars = [
    'OCI_CONFIG_FILE',
    'OCI_CONFIG_PROFILE',
    'VAULT_SECRET_OCID',
    'DB_WALLET_LOCATION',
  ];

  const result: Record<string, string> = {};
  for (const key of vars) {
    const val = process.env[key];
    if (val === undefined) {
      result[key] = '❌ NOT SET';
    } else if (val === '') {
      result[key] = '⚠️ SET BUT EMPTY';
    } else {
      // Show first 10 chars so we can confirm the value without exposing secrets
      result[key] = `✅ "${val.slice(0, 10)}..." (${val.length} chars)`;
    }
  }

  return NextResponse.json(result);
}
