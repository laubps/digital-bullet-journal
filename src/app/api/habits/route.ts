import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { validateCreateHabit } from '@/lib/habits/validation';
import { createHabit, InvalidCategoryError } from '@/lib/habits/entries';
import { listHabits } from '@/lib/habits/queries';

export const runtime = 'nodejs';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const validation = validateCreateHabit(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  try {
    const result = await createHabit({
      userId: session.userId,
      name: validation.fields.name,
      targetDays: validation.fields.targetDays,
      categoryId: validation.fields.categoryId,
    });
    return NextResponse.json({ habitId: result.habitId }, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidCategoryError) {
      return NextResponse.json({ error: 'invalid category', field: 'categoryId' }, { status: 400 });
    }
    console.error('[api/habits POST] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const activeParam = url.searchParams.get('active');
  // default = true; explicit "false" turns the filter off (show all)
  const activeOnly = activeParam !== 'false';
  const from = url.searchParams.get('from');
  const categoryId = url.searchParams.get('categoryId');

  if (from && !DATE_REGEX.test(from)) {
    return NextResponse.json({ error: 'from must be YYYY-MM-DD', field: 'from' }, { status: 400 });
  }
  if (categoryId && !UUID_REGEX.test(categoryId)) {
    return NextResponse.json({ error: 'invalid category', field: 'categoryId' }, { status: 400 });
  }

  try {
    const habits = await listHabits(session.userId, { activeOnly, from, categoryId });
    return NextResponse.json({ habits });
  } catch (err) {
    console.error('[api/habits GET] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
