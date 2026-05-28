import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type JournalHistoryEntry = {
  id: string;
  entryDate: string;
  createdAt: string;
  categoryId: string | null;
  categoryName: string | null;
  content: string; // HTML
};

export type JournalHistoryFilters = {
  from?: string | null;
  to?: string | null;
  categoryId?: string | null;
};

export async function listJournalHistory(
  userId: string,
  filters: JournalHistoryFilters = {},
): Promise<JournalHistoryEntry[]> {
  const binds: Record<string, unknown> = { userId };
  const where: string[] = ['j.user_id = :userId'];

  if (filters.from) {
    where.push("j.entry_date >= TO_DATE(:fromDate, 'YYYY-MM-DD')");
    binds.fromDate = filters.from;
  }
  if (filters.to) {
    where.push("j.entry_date <= TO_DATE(:toDate, 'YYYY-MM-DD')");
    binds.toDate = filters.to;
  }
  if (filters.categoryId) {
    where.push('j.category_id = :categoryId');
    binds.categoryId = filters.categoryId;
  }

  const sql = `
    SELECT j.id          AS ID,
           j.entry_date  AS ENTRY_DATE,
           j.created_at  AS CREATED_AT,
           j.category_id AS CATEGORY_ID,
           c.name        AS CATEGORY_NAME,
           j.content     AS CONTENT
      FROM journal_entries j
      LEFT JOIN categories c ON c.id = j.category_id
     WHERE ${where.join('\n       AND ')}
     ORDER BY j.entry_date DESC, j.created_at DESC
  `;

  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: { CONTENT: { type: oracledb.STRING } }, // CLOB as string
    });
    const rows =
      (result.rows as Array<{
        ID: string;
        ENTRY_DATE: Date;
        CREATED_AT: Date;
        CATEGORY_ID: string | null;
        CATEGORY_NAME: string | null;
        CONTENT: string | null;
      }> | undefined) ?? [];

    return rows.map((r) => ({
      id: r.ID,
      entryDate: r.ENTRY_DATE.toISOString().slice(0, 10),
      createdAt: r.CREATED_AT.toISOString(),
      categoryId: r.CATEGORY_ID,
      categoryName: r.CATEGORY_NAME,
      content: r.CONTENT ?? '',
    }));
  } finally {
    await connection.close();
  }
}
