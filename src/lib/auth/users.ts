import oracledb from 'oracledb';
import { getPool } from '@/lib/db';

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
};

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(
      `SELECT id, email, password_hash, first_name, last_name
         FROM users
        WHERE LOWER(email) = LOWER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const rows = result.rows as Array<{
      ID: string;
      EMAIL: string;
      PASSWORD_HASH: string;
      FIRST_NAME: string | null;
      LAST_NAME: string | null;
    }> | undefined;
    const row = rows?.[0];
    if (!row) return null;
    return {
      id: row.ID,
      email: row.EMAIL,
      passwordHash: row.PASSWORD_HASH,
      firstName: row.FIRST_NAME,
      lastName: row.LAST_NAME,
    };
  } finally {
    await connection.close();
  }
}

export async function emailExists(email: string): Promise<boolean> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(
      `SELECT 1 FROM users WHERE LOWER(email) = LOWER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const rows = result.rows as unknown[] | undefined;
    return (rows?.length ?? 0) > 0;
  } finally {
    await connection.close();
  }
}

export type CreateUserInput = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
};

export async function createUser(input: CreateUserInput): Promise<void> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name)
       VALUES (:id, :email, :passwordHash, :firstName, :lastName)`,
      {
        id: input.id,
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
      { autoCommit: true },
    );
  } finally {
    await connection.close();
  }
}
