import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DatabaseAdapter } from '../orm';

const sqlite = CapacitorSQLite;

async function openConnection(): Promise<SQLiteDBConnection> {
  const connection = await sqlite.createConnection({
    database: 'todo-app',
    version: 1,
    encrypted: false,
    mode: 'no-encryption'
  });
  await connection.open();
  return connection;
}

export async function createCapacitorAdapter(): Promise<DatabaseAdapter> {
  const connection = await openConnection();

  return {
    async execute(sql, params = []) {
      await connection.run(sql, params);
    },
    async query(sql, params = []) {
      const result = await connection.query(sql, params);
      return result.values ?? [];
    },
    async transaction(fn) {
      await connection.execute('BEGIN TRANSACTION');
      try {
        const result = await fn();
        await connection.execute('COMMIT');
        return result;
      } catch (error) {
        await connection.execute('ROLLBACK');
        throw error;
      }
    }
  };
}
