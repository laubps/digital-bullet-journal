import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type HistoryEntry = {
  id: string;
  mood: string;
  entryDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
  categoryId: string | null;
  categoryName: string | null;
};

export type HistoryFilters = {
  from?: string | null; // YYYY-MM-DD inclusive
  to?: string | null; // YYYY-MM-DD inclusive
  categoryId?: string | null;
  mood?: string | null;
};

/**
 * Returns the user's mood entries, newest first, optionally filtered by
 * date range, category, and mood name. Bind parameters are used everywhere
 * to keep the query safe from injection.
 */
export async function listMoodHistory(
  userId: string,
  filters: HistoryFilters = {},
): Promise<HistoryEntry[]> {
  const binds: Record<string, unknown> = { userId };
  const where: string[] = ['m.user_id = :userId'];

  if (filters.from) {
    where.push("m.entry_date >= TO_DATE(:fromDate, 'YYYY-MM-DD')");
    binds.fromDate = filters.from;
  }
  if (filters.to) {
    where.push("m.entry_date <= TO_DATE(:toDate, 'YYYY-MM-DD')");
    binds.toDate = filters.to;
  }
  if (filters.categoryId) {
    where.push('m.category_id = :categoryId');
    binds.categoryId = filters.categoryId;
  }
  if (filters.mood) {
    where.push('e.name = :moodName');
    binds.moodName = filters.mood;
  }

  const sql = `
    SELECT m.id          AS ID,
           e.name        AS MOOD,
           m.entry_date  AS ENTRY_DATE,
           m.created_at  AS CREATED_AT,
           m.category_id AS CATEGORY_ID,
           c.name        AS CATEGORY_NAME
      FROM mood_entries m
      JOIN emotions e        ON e.id = m.emotion_id
      LEFT JOIN categories c ON c.id = m.category_id
     WHERE ${where.join('\n       AND ')}
     ORDER BY m.entry_date DESC, m.created_at DESC
  `;

  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const rows =
      (result.rows as Array<{
        ID: string;
        MOOD: string;
        ENTRY_DATE: Date;
        CREATED_AT: Date;
        CATEGORY_ID: string | null;
        CATEGORY_NAME: string | null;
      }> | undefined) ?? [];

    return rows.map((r) => ({
      id: r.ID,
      mood: r.MOOD,
      entryDate: r.ENTRY_DATE.toISOString().slice(0, 10),
      createdAt: r.CREATED_AT.toISOString(),
      categoryId: r.CATEGORY_ID,
      categoryName: r.CATEGORY_NAME,
    }));
  } finally {
    await connection.close();
  }
}
