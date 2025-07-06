import { app, BrowserWindow } from 'electron';
import { formatDate } from '@dashboard-app/shared';
import { User } from '@shared/types';
import { getAllUsers } from './db/database';
import './handlers/queryHandler';
import './handlers/uploadHandler';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:3000');

  console.log('[Electron] App started at', formatDate(new Date()));
  console.log('[Electron] Users in DB:', getAllUsers());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function abc() {
  const user: User = {
    id: '1',
    name: 'John Doe',
  };
}
