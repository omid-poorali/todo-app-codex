import type { DatabaseAdapter } from '../orm';
import type { TodoRecord } from '../schema';

const STORAGE_KEY = 'todo-app-web-storage';

interface PersistedData {
  todos: TodoRecord[];
  lastId: number;
  migrations: number[];
}

function readState(): PersistedData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { todos: [], lastId: 0, migrations: [] };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    return {
      todos: parsed.todos ?? [],
      lastId: parsed.lastId ?? 0,
      migrations: parsed.migrations ?? []
    };
  } catch (error) {
    console.warn('Failed to parse storage state', error);
    return { todos: [], lastId: 0, migrations: [] };
  }
}

function writeState(state: PersistedData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createWebAdapter(): DatabaseAdapter {
  return {
    async execute(sql, params = []) {
      const state = readState();

      if (sql.startsWith('CREATE TABLE')) {
        return;
      }

      if (sql.startsWith('CREATE INDEX')) {
        return;
      }

      if (sql.startsWith('INSERT INTO __migrations')) {
        const [version] = params as [number, string, string];
        if (!state.migrations.includes(version)) {
          state.migrations.push(version);
          state.migrations.sort((a, b) => a - b);
          writeState(state);
        }
        return;
      }

      if (sql.startsWith('INSERT INTO todos')) {
        const [title, completed, createdAt] = params as [string, number, string];
        const id = state.lastId + 1;
        state.todos.unshift({
          id,
          title,
          completed,
          created_at: createdAt,
          updated_at: null
        });
        state.lastId = id;
        writeState(state);
        return;
      }

      if (sql.startsWith('UPDATE todos')) {
        const [completed, updatedAt, id] = params as [number, string, number];
        state.todos = state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed, updated_at: updatedAt } : todo
        );
        writeState(state);
        return;
      }

      if (sql.startsWith('DELETE FROM todos')) {
        const [id] = params as [number];
        state.todos = state.todos.filter((todo) => todo.id !== id);
        writeState(state);
      }
    },
    async query(sql, params = []) {
      const state = readState();

      if (sql.startsWith('SELECT version FROM __migrations')) {
        return state.migrations.map((version) => ({ version })) as unknown[];
      }

      if (sql.startsWith('SELECT COUNT(1)')) {
        return [{ count: state.todos.length }] as unknown[];
      }

      if (sql.includes('WHERE created_at = ?')) {
        const [createdAt] = params as [string];
        return state.todos.filter((todo) => todo.created_at === createdAt) as unknown[];
      }

      if (sql.includes('WHERE id = ?')) {
        const [id] = params as [number];
        return state.todos.filter((todo) => todo.id === id) as unknown[];
      }

      return [...state.todos] as unknown[];
    },
    async transaction(fn) {
      return fn();
    }
  };
}
