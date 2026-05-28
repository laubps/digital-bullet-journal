import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type HabitRow = {
  id: string;
  name: string;
  targetDays: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string; // ISO
  startDate: string; // YYYY-MM-DD (local representation of created_at date)
};

export type HabitWithCheckins = HabitRow & {
  checkins: Array<{ checkDate: string; done: boolean }>;
};

export type HabitFilters = {
  activeOnly?: boolean;
  from?: string | null;
  categoryId?: string | null;
};

export async function listHabits(userId: string, filters: HabitFilters = {}): Promise<HabitRow[]> {
  const binds: Record<string, unknown> = { userId };
  const where: string[] = ['h.user_id = :userId'];

  if (filters.activeOnly) {
    where.push('h.is_active = 1');
  }
  if (filters.from) {
    where.push("h.created_at >= TO_TIMESTAMP(:fromDate, 'YYYY-MM-DD')");
    binds.fromDate = filters.from;
  }
  if (filters.categoryId) {
    where.push('h.category_id = :categoryId');
    binds.categoryId = filters.categoryId;
  }

  const sql = `
    SELECT h.id          AS ID,
           h.name        AS NAME,
           h.target_days AS TARGET_DAYS,
           h.is_active   AS IS_ACTIVE,
           h.category_id AS CATEGORY_ID,
           c.name        AS CATEGORY_NAME,
           h.created_at  AS CREATED_AT
      FROM habits h
      LEFT JOIN categories c ON c.id = h.category_id
     WHERE ${where.join('\n       AND ')}
     ORDER BY h.created_at DESC
  `;

  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rows =
      (result.rows as Array<{
        ID: string;
        NAME: string;
        TARGET_DAYS: number;
        IS_ACTIVE: number;
        CATEGORY_ID: string | null;
        CATEGORY_NAME: string | null;
        CREATED_AT: Date;
      }> | undefined) ?? [];
    return rows.map((r) => ({
      id: r.ID,
      name: r.NAME,
      targetDays: r.TARGET_DAYS,
      isActive: r.IS_ACTIVE === 1,
      categoryId: r.CATEGORY_ID,
      categoryName: r.CATEGORY_NAME,
      createdAt: r.CREATED_AT.toISOString(),
      startDate: r.CREATED_AT.toISOString().slice(0, 10),
    }));
  } finally {
    await connection.close();
  }
}

export async function getHabitWithCheckins(
  habitId: string,
  userId: string,
): Promise<HabitWithCheckins | null> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const hRes = await connection.execute(
      `SELECT h.id          AS ID,
              h.name        AS NAME,
              h.target_days AS TARGET_DAYS,
              h.is_active   AS IS_ACTIVE,
              h.category_id AS CATEGORY_ID,
              c.name        AS CATEGORY_NAME,
              h.created_at  AS CREATED_AT
         FROM habits h
         LEFT JOIN categories c ON c.id = h.category_id
        WHERE h.id = :id AND h.user_id = :userId`,
      { id: habitId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const hRows = hRes.rows as Array<{
      ID: string;
      NAME: string;
      TARGET_DAYS: number;
      IS_ACTIVE: number;
      CATEGORY_ID: string | null;
      CATEGORY_NAME: string | null;
      CREATED_AT: Date;
    }> | undefined;
    const h = hRows?.[0];
    if (!h) return null;

    const cRes = await connection.execute(
      `SELECT check_date AS CHECK_DATE, done AS DONE
         FROM habit_checkins
        WHERE habit_id = :habitId AND user_id = :userId
        ORDER BY check_date ASC`,
      { habitId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const cRows =
      (cRes.rows as Array<{ CHECK_DATE: Date; DONE: number }> | undefined) ?? [];

    return {
      id: h.ID,
      name: h.NAME,
      targetDays: h.TARGET_DAYS,
      isActive: h.IS_ACTIVE === 1,
      categoryId: h.CATEGORY_ID,
      categoryName: h.CATEGORY_NAME,
      createdAt: h.CREATED_AT.toISOString(),
      startDate: h.CREATED_AT.toISOString().slice(0, 10),
      checkins: cRows.map((r) => ({
        checkDate: r.CHECK_DATE.toISOString().slice(0, 10),
        done: r.DONE === 1,
      })),
    };
  } finally {
    await connection.close();
  }
}
