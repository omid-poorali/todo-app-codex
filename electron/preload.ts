import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronOrmApi } from '../src/types/electron';

const api: ElectronOrmApi = {
  init: () => ipcRenderer.invoke('orm:init'),
  seedDefaults: () => ipcRenderer.invoke('orm:seed'),
  getTodos: () => ipcRenderer.invoke('orm:getTodos'),
  addTodo: (title) => ipcRenderer.invoke('orm:addTodo', title),
  toggleTodo: (id, completed) => ipcRenderer.invoke('orm:toggleTodo', id, completed),
  deleteTodo: (id) => ipcRenderer.invoke('orm:deleteTodo', id)
};

contextBridge.exposeInMainWorld('electronAPI', api);
