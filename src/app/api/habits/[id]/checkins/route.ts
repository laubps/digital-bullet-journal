import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { validateCheckinInput } from '@/lib/habits/validation';
import { setCheckin, CheckDateOutOfRangeError } from '@/lib/habits/checkins';
import { HabitNotFoundError } from '@/lib/habits/entries';

export const runtime = 'nodejs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const validation = validateCheckinInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  try {
    await setCheckin(id, session.userId, validation.fields.checkDate, validation.fields.done);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HabitNotFoundError) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    if (err instanceof CheckDateOutOfRangeError) {
      return NextResponse.json(
        { error: 'date is outside this habit window', field: 'checkDate' },
        { status: 400 },
      );
    }
    console.error('[api/habits/[id]/checkins] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
