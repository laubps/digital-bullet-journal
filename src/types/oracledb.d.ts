/**
 * Minimal type declarations for oracledb.
 * oracledb v6 does not ship a bundled .d.ts file and there is no
 * @types/oracledb package on DefinitelyTyped.
 * Only the surface used by this project is typed here; extend as needed.
 */
declare module 'oracledb' {
  export interface ExecuteResult {
    rows?: unknown[][];
    metaData?: { name: string }[];
    rowsAffected?: number;
    lastRowid?: string;
  }

  export interface Connection {
    execute(sql: string, binds?: unknown, options?: unknown): Promise<ExecuteResult>;
    close(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime: number): Promise<void>;
    readonly connectionsInUse: number;
    readonly connectionsOpen: number;
  }

  export interface PoolAttributes {
    user: string;
    password: string;
    connectString: string;
    walletLocation?: string;
    walletPassword?: string;
    configDir?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
  }

  export function createPool(attrs: PoolAttributes): Promise<Pool>;

  export const OUT_FORMAT_OBJECT: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CLOB: number;
  export const BLOB: number;

  const oracledb: {
    createPool: typeof createPool;
    OUT_FORMAT_OBJECT: number;
    STRING: number;
    NUMBER: number;
    DATE: number;
    CLOB: number;
    BLOB: number;
  };
  export default oracledb;
}
