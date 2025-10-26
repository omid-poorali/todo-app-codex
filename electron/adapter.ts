import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import type { DatabaseAdapter } from '../src/db/orm';

export function createElectronAdapter(): DatabaseAdapter {
  const userData = app.getPath('userData');
  const db = new Database(join(userData, 'todo-app.sqlite'));

  return {
    async execute(sql, params = []) {
      db.prepare(sql).run(...params);
    },
    async query(sql, params = []) {
      return db.prepare(sql).all(...params);
    },
    async transaction(fn) {
      // better-sqlite3 transactions are synchronous; the ORM operations are synchronous as well,
      // so we execute the callback directly.
      return fn();
    }
  };
}
