import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { getHabitWithCheckins } from '@/lib/habits/queries';
import { updateHabit, InvalidCategoryError, HabitNotFoundError } from '@/lib/habits/entries';
import { validateUpdateHabit } from '@/lib/habits/validation';

export const runtime = 'nodejs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    const habit = await getHabitWithCheckins(id, session.userId);
    if (!habit) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ habit });
  } catch (err) {
    console.error('[api/habits/[id] GET] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const validation = validateUpdateHabit(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  try {
    await updateHabit({
      habitId: id,
      userId: session.userId,
      ...validation.fields,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HabitNotFoundError) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    if (err instanceof InvalidCategoryError) {
      return NextResponse.json({ error: 'invalid category', field: 'categoryId' }, { status: 400 });
    }
    console.error('[api/habits/[id] PATCH] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
