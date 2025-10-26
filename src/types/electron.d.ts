export interface ElectronOrmApi {
  init(): Promise<void>;
  seedDefaults(): Promise<void>;
  getTodos(): Promise<import('../db/schema').Todo[]>;
  addTodo(title: string): Promise<import('../db/schema').Todo>;
  toggleTodo(id: number, completed: boolean): Promise<import('../db/schema').Todo>;
  deleteTodo(id: number): Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronOrmApi;
  }
}
