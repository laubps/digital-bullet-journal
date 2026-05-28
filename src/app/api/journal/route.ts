import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require-session';
import { validateJournalInput } from '@/lib/journal/validation';
import { createJournalEntry, InvalidCategoryError } from '@/lib/journal/entries';

export const runtime = 'nodejs';

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

  const validation = validateJournalInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  try {
    const result = await createJournalEntry({
      userId: session.userId,
      entryDate: validation.fields.entryDate,
      content: validation.fields.content,
      categoryId: validation.fields.categoryId,
    });
    return NextResponse.json(
      {
        journalEntryId: result.journalEntryId,
        entryDate: validation.fields.entryDate,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof InvalidCategoryError) {
      return NextResponse.json(
        { error: 'invalid category', field: 'categoryId' },
        { status: 400 },
      );
    }
    console.error('[api/journal] error:', err);
    return NextResponse.json({ error: 'something went wrong, try again' }, { status: 500 });
  }
}
