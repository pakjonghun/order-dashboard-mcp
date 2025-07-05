import { app, BrowserWindow } from 'electron';
import { formatDate } from '@dashboard-app/shared';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 환경: Vite dev 서버(3000포트)로 로드
  win.loadURL('http://localhost:3000');

  // shared 모듈 사용 예시
  console.log('Today is:', formatDate(new Date()));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
