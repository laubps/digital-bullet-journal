import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { listJournalHistory } from '@/lib/journal/history';

export const runtime = 'nodejs';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const categoryId = url.searchParams.get('categoryId');

  if (from && !DATE_REGEX.test(from)) {
    return NextResponse.json({ error: 'from must be YYYY-MM-DD', field: 'from' }, { status: 400 });
  }
  if (to && !DATE_REGEX.test(to)) {
    return NextResponse.json({ error: 'to must be YYYY-MM-DD', field: 'to' }, { status: 400 });
  }
  if (from && to && from > to) {
    return NextResponse.json(
      { error: 'from must be on or before to', field: 'from' },
      { status: 400 },
    );
  }
  if (categoryId && !UUID_REGEX.test(categoryId)) {
    return NextResponse.json(
      { error: 'invalid category', field: 'categoryId' },
      { status: 400 },
    );
  }

  try {
    const entries = await listJournalHistory(session.userId, { from, to, categoryId });
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('[api/journal/history] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
