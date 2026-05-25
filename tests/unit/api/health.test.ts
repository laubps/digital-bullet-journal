/**
 * @jest-environment node
 *
 * API route tests must run in the Node.js environment so that the
 * Web Fetch globals (Request, Response, Headers) that Next.js relies
 * on are available natively (Node 18+).
 */
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns HTTP 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns status "ok"', async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  it('returns an ISO timestamp', async () => {
    const before = new Date().toISOString();
    const response = await GET();
    const after = new Date().toISOString();
    const body = await response.json();

    expect(typeof body.timestamp).toBe('string');
    // Timestamp must fall within the window of this test run
    expect(body.timestamp >= before).toBe(true);
    expect(body.timestamp <= after).toBe(true);
  });
});
