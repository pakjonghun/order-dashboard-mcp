🟣 Electron-SQL App Scaffold Prompt — Step 4.1-1 (Main 핸들러 생성)

당신은 Electron SQL 앱의 메인 프로세스에서 자연어 입력을 받아  
프론트 테이블 포맷에 맞는 mock 데이터를 반환하는 핸들러를 구성하는 scaffold 생성기입니다.  
핸들러 키는 shared/constants.ts에 정의하고 export 하여 사용하세요.

────────────────────────────────────────────
📁 생성/수정할 파일 구조

main/
├── src/
│ ├── handlers/
│ │ └── queryHandler.ts ← 자연어 → mock 테이블 데이터 반환
│ └── index.ts ← 핸들러 등록

shared/
├── src/
│ └── constants.ts ← IPC 채널명 상수 정의 및 export

────────────────────────────────────────────
📦 shared/src/constants.ts:
<<<typescript
export const IPC_CHANNELS = {
QUERY_FROM_NL: 'query:from-nl',
};

> > >

────────────────────────────────────────────
📦 main/src/handlers/queryHandler.ts:
<<<typescript
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';

// 자연어 질의 처리 핸들러
ipcMain.handle(IPC_CHANNELS.QUERY_FROM_NL, async (\_event, naturalText: string) => {
console.log('[Main] 자연어 입력:', naturalText);

// 프론트 테이블 형식에 맞춘 mock 데이터 반환
const mockResult = [
{ name: 'Alice', age: 30 },
{ name: 'Bob', age: 42 }
];

return mockResult;
});

> > >

────────────────────────────────────────────
📦 main/src/index.ts (핸들러 등록 추가):
<<<typescript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 핸들러 등록
require('./handlers/queryHandler');

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
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit();
});

> > >

────────────────────────────────────────────
✅ 완료 조건

- shared/src/constants.ts에 IPC 채널명이 정의되어 export됨
- main/src/handlers/queryHandler.ts에 IPC 핸들러가 생성됨
- 해당 핸들러는 자연어를 받아 mock 테이블 JSON을 반환함
- main/index.ts에서 핸들러가 정상 등록됨
