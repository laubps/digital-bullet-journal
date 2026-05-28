import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { listCategoriesForUser } from '@/lib/categories/list';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const categories = await listCategoriesForUser(session.userId);
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('[api/categories] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
