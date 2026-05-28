import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type MoodSummary = {
  today: string[]; // emotion names recorded on the given local date, oldest → newest
  last: { mood: string; entryDate: string; createdAt: string } | null;
};

/**
 * Returns the moods recorded by the user on `today` (YYYY-MM-DD, in the user's
 * local calendar) plus the single most recent mood overall.
 *
 * `today` is bound as a string and converted via TO_DATE so DATE comparison is
 * exact regardless of server timezone.
 */
export async function getMoodSummary(userId: string, today: string): Promise<MoodSummary> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const todayRes = await connection.execute(
      `SELECT e.name AS NAME
         FROM mood_entries m
         JOIN emotions e ON e.id = m.emotion_id
        WHERE m.user_id = :userId
          AND m.entry_date = TO_DATE(:today, 'YYYY-MM-DD')
        ORDER BY m.created_at ASC`,
      { userId, today },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const todayRows = (todayRes.rows as Array<{ NAME: string }> | undefined) ?? [];
    const todayMoods = todayRows.map((r) => r.NAME);

    const lastRes = await connection.execute(
      `SELECT e.name        AS NAME,
              m.entry_date  AS ENTRY_DATE,
              m.created_at  AS CREATED_AT
         FROM mood_entries m
         JOIN emotions e ON e.id = m.emotion_id
        WHERE m.user_id = :userId
        ORDER BY m.created_at DESC
        FETCH FIRST 1 ROWS ONLY`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const lastRows = lastRes.rows as
      | Array<{ NAME: string; ENTRY_DATE: Date; CREATED_AT: Date }>
      | undefined;
    const lastRow = lastRows?.[0];

    return {
      today: todayMoods,
      last: lastRow
        ? {
            mood: lastRow.NAME,
            entryDate: lastRow.ENTRY_DATE.toISOString().slice(0, 10),
            createdAt: lastRow.CREATED_AT.toISOString(),
          }
        : null,
    };
  } finally {
    await connection.close();
  }
}
