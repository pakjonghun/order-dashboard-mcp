import { app, BrowserWindow } from 'electron';
import { formatDate } from '@dashboard-app/shared';
import { User } from '@shared/types';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL('http://localhost:3000');
  console.log('Today is:', formatDate(new Date()));
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
