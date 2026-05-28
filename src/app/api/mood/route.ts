import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { validateMoodInput } from '@/lib/mood/validation';
import {
  createMoodWithOptionalJournal,
  UnknownMoodError,
  InvalidCategoryError,
  DuplicateMoodError,
} from '@/lib/mood/entries';
import { getMoodSummary } from '@/lib/mood/queries';

export const runtime = 'nodejs';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: 'date query param must be YYYY-MM-DD', field: 'date' },
      { status: 400 },
    );
  }

  try {
    const summary = await getMoodSummary(session.userId, date);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('[api/mood GET] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const validation = validateMoodInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  try {
    const result = await createMoodWithOptionalJournal({
      userId: session.userId,
      mood: validation.fields.mood,
      entryDate: validation.fields.entryDate,
      note: validation.fields.note,
      categoryId: validation.fields.categoryId,
    });
    return NextResponse.json(
      {
        moodEntryId: result.moodEntryId,
        journalEntryId: result.journalEntryId,
        mood: validation.fields.mood,
        entryDate: validation.fields.entryDate,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof UnknownMoodError) {
      return NextResponse.json(
        { error: 'unknown mood', field: 'mood' },
        { status: 400 },
      );
    }
    if (err instanceof InvalidCategoryError) {
      return NextResponse.json(
        { error: 'invalid category', field: 'categoryId' },
        { status: 400 },
      );
    }
    if (err instanceof DuplicateMoodError) {
      return NextResponse.json(
        { error: 'this mood is already saved for that day', field: 'mood' },
        { status: 409 },
      );
    }
    console.error('[api/mood] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
