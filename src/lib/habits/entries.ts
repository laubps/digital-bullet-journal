import { randomUUID } from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type CreateHabitInput = {
  userId: string;
  name: string;
  targetDays: number;
  categoryId: string | null;
};

export type CreateHabitResult = {
  habitId: string;
};

export class InvalidCategoryError extends Error {
  constructor(categoryId: string) {
    super(`category ${categoryId} does not belong to user`);
    this.name = 'InvalidCategoryError';
  }
}

export class HabitNotFoundError extends Error {
  constructor(habitId: string) {
    super(`habit ${habitId} not found`);
    this.name = 'HabitNotFoundError';
  }
}

export async function createHabit(input: CreateHabitInput): Promise<CreateHabitResult> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    if (input.categoryId) {
      const cat = await connection.execute(
        `SELECT 1 FROM categories WHERE id = :categoryId AND user_id = :userId`,
        { categoryId: input.categoryId, userId: input.userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      if (((cat.rows as unknown[] | undefined)?.length ?? 0) === 0) {
        throw new InvalidCategoryError(input.categoryId);
      }
    }

    const habitId = randomUUID();
    await connection.execute(
      `INSERT INTO habits (id, user_id, category_id, name, target_days, is_active)
       VALUES (:id, :userId, :categoryId, :name, :targetDays, 1)`,
      {
        id: habitId,
        userId: input.userId,
        categoryId: input.categoryId,
        name: input.name,
        targetDays: input.targetDays,
      },
      { autoCommit: true },
    );
    return { habitId };
  } finally {
    await connection.close();
  }
}

export type UpdateHabitInput = {
  habitId: string;
  userId: string;
  targetDays?: number;
  categoryId?: string | null;
  isActive?: boolean;
};

export async function updateHabit(input: UpdateHabitInput): Promise<void> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    // Ownership check + ensures exists.
    const own = await connection.execute(
      `SELECT 1 FROM habits WHERE id = :id AND user_id = :userId`,
      { id: input.habitId, userId: input.userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (((own.rows as unknown[] | undefined)?.length ?? 0) === 0) {
      throw new HabitNotFoundError(input.habitId);
    }

    if (input.categoryId) {
      const cat = await connection.execute(
        `SELECT 1 FROM categories WHERE id = :categoryId AND user_id = :userId`,
        { categoryId: input.categoryId, userId: input.userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      if (((cat.rows as unknown[] | undefined)?.length ?? 0) === 0) {
        throw new InvalidCategoryError(input.categoryId);
      }
    }

    const sets: string[] = [];
    const binds: Record<string, unknown> = { id: input.habitId, userId: input.userId };
    if (input.targetDays !== undefined) {
      sets.push('target_days = :targetDays');
      binds.targetDays = input.targetDays;
    }
    if (input.categoryId !== undefined) {
      sets.push('category_id = :categoryId');
      binds.categoryId = input.categoryId;
    }
    if (input.isActive !== undefined) {
      sets.push('is_active = :isActive');
      binds.isActive = input.isActive ? 1 : 0;
    }
    if (sets.length === 0) return;

    await connection.execute(
      `UPDATE habits SET ${sets.join(', ')} WHERE id = :id AND user_id = :userId`,
      binds,
      { autoCommit: true },
    );
  } finally {
    await connection.close();
  }
}
