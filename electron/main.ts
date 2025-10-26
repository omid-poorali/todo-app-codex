import { app, BrowserWindow, ipcMain } from 'electron';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createElectronAdapter } from './adapter';
import { ORM } from '../src/db/orm';
import { migrations } from '../src/db/migrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let orm: ORM;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../web/index.html'));
  }
}

app.whenReady().then(async () => {
  const adapter = createElectronAdapter();
  orm = new ORM(adapter, migrations);
  await orm.init();
  await orm.seedDefaults();

  ipcMain.handle('orm:init', async () => orm.init());
  ipcMain.handle('orm:seed', async () => orm.seedDefaults());
  ipcMain.handle('orm:getTodos', async () => orm.getTodos());
  ipcMain.handle('orm:addTodo', async (_event, title: string) => orm.addTodo(title));
  ipcMain.handle('orm:toggleTodo', async (_event, id: number, completed: boolean) => orm.toggleTodo(id, completed));
  ipcMain.handle('orm:deleteTodo', async (_event, id: number) => orm.deleteTodo(id));

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
