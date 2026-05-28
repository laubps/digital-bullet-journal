import { randomUUID } from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/db';
import { HabitNotFoundError } from './entries';

export class CheckDateOutOfRangeError extends Error {
  constructor(checkDate: string) {
    super(`check date ${checkDate} is outside the habit's window`);
    this.name = 'CheckDateOutOfRangeError';
  }
}

/**
 * Marks a check-in for the given date. If `done` is true, upserts a row with
 * done=1. If `done` is false, deletes any existing row for that date.
 *
 * Validates the habit exists for the user and that the date falls between the
 * habit's start (created_at) and start + target_days.
 */
export async function setCheckin(
  habitId: string,
  userId: string,
  checkDate: string,
  done: boolean,
): Promise<void> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const own = await connection.execute(
      `SELECT TRUNC(created_at) AS START_DATE, target_days AS TARGET_DAYS
         FROM habits
        WHERE id = :id AND user_id = :userId`,
      { id: habitId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const ownRows = own.rows as Array<{ START_DATE: Date; TARGET_DAYS: number }> | undefined;
    const row = ownRows?.[0];
    if (!row) throw new HabitNotFoundError(habitId);

    const startIso = row.START_DATE.toISOString().slice(0, 10);
    const endDate = new Date(row.START_DATE);
    endDate.setUTCDate(endDate.getUTCDate() + row.TARGET_DAYS - 1);
    const endIso = endDate.toISOString().slice(0, 10);

    if (checkDate < startIso || checkDate > endIso) {
      throw new CheckDateOutOfRangeError(checkDate);
    }

    if (done) {
      await connection.execute(
        `MERGE INTO habit_checkins t
         USING (SELECT :habitId AS habit_id,
                       :userId  AS user_id,
                       TO_DATE(:checkDate, 'YYYY-MM-DD') AS check_date
                  FROM dual) s
            ON (t.habit_id = s.habit_id AND t.check_date = s.check_date)
         WHEN MATCHED THEN
           UPDATE SET t.done = 1
         WHEN NOT MATCHED THEN
           INSERT (id, habit_id, user_id, check_date, done)
           VALUES (:id, s.habit_id, s.user_id, s.check_date, 1)`,
        {
          id: randomUUID(),
          habitId,
          userId,
          checkDate,
        },
        { autoCommit: true },
      );
    } else {
      await connection.execute(
        `DELETE FROM habit_checkins
          WHERE habit_id = :habitId
            AND user_id = :userId
            AND check_date = TO_DATE(:checkDate, 'YYYY-MM-DD')`,
        { habitId, userId, checkDate },
        { autoCommit: true },
      );
    }
  } finally {
    await connection.close();
  }
}
