import type { OrmApi } from '../db/orm';
import type { Todo } from '../db/schema';

export async function createRendererBridge(): Promise<OrmApi> {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API is not available.');
  }

  await api.init();
  await api.seedDefaults();

  const bridge: OrmApi = {
    init: api.init,
    seedDefaults: api.seedDefaults,
    getTodos: (): Promise<Todo[]> => api.getTodos(),
    addTodo: (title: string) => api.addTodo(title),
    toggleTodo: (id: number, completed: boolean) => api.toggleTodo(id, completed),
    deleteTodo: (id: number) => api.deleteTodo(id)
  };

  return bridge;
}
