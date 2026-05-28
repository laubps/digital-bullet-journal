import { randomUUID } from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/db';
import type { Mood } from './validation';

export type CreateMoodInput = {
  userId: string;
  mood: Mood;
  entryDate: string; // YYYY-MM-DD (already validated)
  note: string | null;
  categoryId: string | null;
};

export type CreateMoodResult = {
  moodEntryId: string;
  journalEntryId: string | null;
};

export class UnknownMoodError extends Error {
  constructor(mood: string) {
    super(`unknown mood: ${mood}`);
    this.name = 'UnknownMoodError';
  }
}

export class InvalidCategoryError extends Error {
  constructor(categoryId: string) {
    super(`category ${categoryId} does not belong to user`);
    this.name = 'InvalidCategoryError';
  }
}

export class DuplicateMoodError extends Error {
  constructor(mood: string, entryDate: string) {
    super(`mood "${mood}" already recorded for ${entryDate}`);
    this.name = 'DuplicateMoodError';
  }
}

/** Oracle unique-constraint violation code. */
const ORA_UNIQUE_VIOLATION = 1;

/**
 * Inserts a mood entry, and — if a note is provided — a journal entry for the
 * same date, in a single transaction. Rolls back on any failure so we never
 * leave a half-written record.
 *
 * entry_date is bound as a string and converted to DATE via TO_DATE; oracledb
 * does not auto-convert JS Date for DATE columns reliably across drivers.
 */
export async function createMoodWithOptionalJournal(
  input: CreateMoodInput,
): Promise<CreateMoodResult> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    // Resolve emotion_id from the seeded reference table.
    const emotionLookup = await connection.execute(
      `SELECT id FROM emotions WHERE name = :name`,
      { name: input.mood },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const emotionRows = emotionLookup.rows as Array<{ ID: string }> | undefined;
    const emotionId = emotionRows?.[0]?.ID;
    if (!emotionId) {
      throw new UnknownMoodError(input.mood);
    }

    // Verify category ownership (if provided) on the same connection.
    if (input.categoryId) {
      const catLookup = await connection.execute(
        `SELECT 1 FROM categories WHERE id = :categoryId AND user_id = :userId`,
        { categoryId: input.categoryId, userId: input.userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const catRows = catLookup.rows as unknown[] | undefined;
      if ((catRows?.length ?? 0) === 0) {
        throw new InvalidCategoryError(input.categoryId);
      }
    }

    // Prevent the same mood being logged twice on the same calendar day.
    const dupCheck = await connection.execute(
      `SELECT 1 FROM mood_entries
        WHERE user_id   = :userId
          AND emotion_id = :emotionId
          AND entry_date = TO_DATE(:entryDate, 'YYYY-MM-DD')`,
      { userId: input.userId, emotionId, entryDate: input.entryDate },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const dupRows = dupCheck.rows as unknown[] | undefined;
    if ((dupRows?.length ?? 0) > 0) {
      throw new DuplicateMoodError(input.mood, input.entryDate);
    }

    const moodEntryId = randomUUID();
    try {
      await connection.execute(
        `INSERT INTO mood_entries (id, user_id, category_id, emotion_id, entry_date)
         VALUES (:id, :userId, :categoryId, :emotionId, TO_DATE(:entryDate, 'YYYY-MM-DD'))`,
        {
          id: moodEntryId,
          userId: input.userId,
          categoryId: input.categoryId,
          emotionId,
          entryDate: input.entryDate,
        },
      );
    } catch (insertErr) {
      // Race condition: another request inserted the same (user, day, mood)
      // between our SELECT and INSERT. The UNIQUE constraint catches it.
      if (
        (insertErr as { errorNum?: number }).errorNum === ORA_UNIQUE_VIOLATION
      ) {
        throw new DuplicateMoodError(input.mood, input.entryDate);
      }
      throw insertErr;
    }

    let journalEntryId: string | null = null;
    if (input.note) {
      journalEntryId = randomUUID();
      const htmlContent = `<p>${escapeHtml(input.note)}</p>`;
      await connection.execute(
        `INSERT INTO journal_entries (id, user_id, category_id, content, entry_date)
         VALUES (:id, :userId, :categoryId, :content, TO_DATE(:entryDate, 'YYYY-MM-DD'))`,
        {
          id: journalEntryId,
          userId: input.userId,
          categoryId: input.categoryId,
          content: { val: htmlContent, type: oracledb.CLOB },
          entryDate: input.entryDate,
        },
      );
    }

    await connection.commit();
    return { moodEntryId, journalEntryId };
  } catch (err) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failures; surface the original error below.
    }
    throw err;
  } finally {
    await connection.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
