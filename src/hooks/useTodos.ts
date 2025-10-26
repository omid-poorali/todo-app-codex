import { useEffect, useState, useCallback } from 'react';
import type { Todo } from '../db/schema';
import { getORM } from '../db/client';

interface UseTodosResult {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const orm = await getORM();
        const initial = await orm.getTodos();
        if (active) {
          setTodos(initial);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const addTodo = useCallback(async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const orm = await getORM();
    const newTodo = await orm.addTodo(trimmed);
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    const existing = todos.find((todo) => todo.id === id);
    if (!existing) return;
    const orm = await getORM();
    const updated = await orm.toggleTodo(id, !existing.completed);
    setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
  }, [todos]);

  const deleteTodo = useCallback(async (id: number) => {
    const orm = await getORM();
    await orm.deleteTodo(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return { todos, loading, error, addTodo, toggleTodo, deleteTodo };
}
