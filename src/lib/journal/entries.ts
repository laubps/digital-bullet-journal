import { randomUUID } from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type CreateJournalInput = {
  userId: string;
  entryDate: string; // YYYY-MM-DD
  content: string; // HTML (Tiptap output)
  categoryId: string | null;
};

export type CreateJournalResult = {
  journalEntryId: string;
};

export class InvalidCategoryError extends Error {
  constructor(categoryId: string) {
    super(`category ${categoryId} does not belong to user`);
    this.name = 'InvalidCategoryError';
  }
}

export async function createJournalEntry(
  input: CreateJournalInput,
): Promise<CreateJournalResult> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    if (input.categoryId) {
      const cat = await connection.execute(
        `SELECT 1 FROM categories WHERE id = :categoryId AND user_id = :userId`,
        { categoryId: input.categoryId, userId: input.userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const rows = cat.rows as unknown[] | undefined;
      if ((rows?.length ?? 0) === 0) {
        throw new InvalidCategoryError(input.categoryId);
      }
    }

    const journalEntryId = randomUUID();
    await connection.execute(
      `INSERT INTO journal_entries (id, user_id, category_id, content, entry_date)
       VALUES (:id, :userId, :categoryId, :content, TO_DATE(:entryDate, 'YYYY-MM-DD'))`,
      {
        id: journalEntryId,
        userId: input.userId,
        categoryId: input.categoryId,
        content: { val: input.content, type: oracledb.CLOB },
        entryDate: input.entryDate,
      },
    );

    await connection.commit();
    return { journalEntryId };
  } catch (err) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    throw err;
  } finally {
    await connection.close();
  }
}
