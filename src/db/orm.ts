import type { TodoRecord, Todo } from './schema';

export interface QueryResult<T> {
  rows: T[];
}

export interface DatabaseAdapter {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export interface Migration {
  version: number;
  name: string;
  up: (adapter: DatabaseAdapter) => Promise<void>;
}

export interface OrmApi {
  init(): Promise<void>;
  seedDefaults(): Promise<void>;
  getTodos(): Promise<Todo[]>;
  addTodo(title: string): Promise<Todo>;
  toggleTodo(id: number, completed: boolean): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
}

export class ORM implements OrmApi {
  constructor(private readonly adapter: DatabaseAdapter, private readonly migrations: Migration[]) {}

  async init(): Promise<void> {
    await this.adapter.execute(
      `CREATE TABLE IF NOT EXISTS __migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )`
    );

    const applied = await this.adapter.query<{ version: number }>('SELECT version FROM __migrations ORDER BY version');
    const appliedVersions = new Set(applied.map((row) => row.version));

    const sortedMigrations = [...this.migrations].sort((a, b) => a.version - b.version);
    for (const migration of sortedMigrations) {
      if (appliedVersions.has(migration.version)) {
        continue;
      }

      await this.adapter.transaction(async () => {
        await migration.up(this.adapter);
        await this.adapter.execute('INSERT INTO __migrations (version, name, applied_at) VALUES (?, ?, ?)', [
          migration.version,
          migration.name,
          new Date().toISOString()
        ]);
      });
    }
  }

  async seedDefaults(): Promise<void> {
    const todos = await this.adapter.query('SELECT COUNT(1) as count FROM todos');
    if ((todos[0] as { count: number }).count === 0) {
      await this.adapter.execute('INSERT INTO todos (title, completed, created_at) VALUES (?, ?, ?)', [
        'Explore the Todo App',
        0,
        new Date().toISOString()
      ]);
    }
  }

  mapTodo(record: TodoRecord): Todo {
    return {
      id: record.id,
      title: record.title,
      completed: Boolean(record.completed),
      createdAt: new Date(record.created_at),
      updatedAt: record.updated_at ? new Date(record.updated_at) : null
    };
  }

  async getTodos(): Promise<Todo[]> {
    const rows = await this.adapter.query<TodoRecord>('SELECT * FROM todos ORDER BY created_at DESC');
    return rows.map((row) => this.mapTodo(row));
  }

  async addTodo(title: string): Promise<Todo> {
    const now = new Date().toISOString();
    await this.adapter.execute('INSERT INTO todos (title, completed, created_at) VALUES (?, ?, ?)', [title, 0, now]);
    const rows = await this.adapter.query<TodoRecord>('SELECT * FROM todos WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
    const todo = rows[0];
    return this.mapTodo(todo);
  }

  async toggleTodo(id: number, completed: boolean): Promise<Todo> {
    const now = new Date().toISOString();
    await this.adapter.execute('UPDATE todos SET completed = ?, updated_at = ? WHERE id = ?', [completed ? 1 : 0, now, id]);
    const rows = await this.adapter.query<TodoRecord>('SELECT * FROM todos WHERE id = ?', [id]);
    return this.mapTodo(rows[0]);
  }

  async deleteTodo(id: number): Promise<void> {
    await this.adapter.execute('DELETE FROM todos WHERE id = ?', [id]);
  }
}

export type { Todo } from './schema';
