import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type Category = { id: string; name: string };

/** Returns all categories owned by the given user, ordered by name. */
export async function listCategoriesForUser(userId: string): Promise<Category[]> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(
      `SELECT id, name
         FROM categories
        WHERE user_id = :userId
        ORDER BY name ASC`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const rows = (result.rows as Array<{ ID: string; NAME: string }> | undefined) ?? [];
    return rows.map((r) => ({ id: r.ID, name: r.NAME }));
  } finally {
    await connection.close();
  }
}

/** Returns true when (categoryId, userId) exists. Used to validate ownership. */
export async function categoryBelongsToUser(
  categoryId: string,
  userId: string,
): Promise<boolean> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(
      `SELECT 1 FROM categories WHERE id = :categoryId AND user_id = :userId`,
      { categoryId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const rows = result.rows as unknown[] | undefined;
    return (rows?.length ?? 0) > 0;
  } finally {
    await connection.close();
  }
}
