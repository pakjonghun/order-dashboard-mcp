2단계 main process 확장 db 설치

🟣 Electron-SQL Desktop App Scaffold Prompt — Step 2 (Main 프로세스 확장 + DB 연동, ESM + Jest 테스트)

당신은 Electron 기반 SQL 분석 앱의 메인 프로세스를 확장하는 고급 scaffold 생성기입니다.  
아래 조건에 맞춰 main 디렉토리를 확장하여 SQLite 기반 데이터 저장 및 쿼리 기능을 구현하고, Jest 기반 단위 테스트를 추가하세요.

────────────────────────────────────────────
🎯 목표

• SQLite 연결 모듈 (`main/src/db/database.ts`) 생성  
• 초기 테이블 정의 SQL 파일 (`main/src/db/schema.sql`) 추가  
• 쿼리 함수(`getAllUsers`) 구현 및 shared 타입 사용  
• 메인 실행 시 DB 초기화 및 테스트 출력  
• Jest 기반 단위 테스트 파일 (`main/src/test/db.test.ts`) 추가  
• DB 파일은 프로젝트 루트(app.db)에 생성됨

────────────────────────────────────────────
📁 생성/수정할 파일 구조

main/
├── src/
│ ├── db/
│ │ ├── database.ts ← SQLite 연결 및 쿼리 (ESM)
│ │ └── schema.sql ← 초기 테이블 정의
│ ├── test/
│ │ └── db.test.ts ← Jest 기반 단위 테스트
│ └── index.ts ← Electron 메인 (수정됨)

────────────────────────────────────────────
📦 main/src/db/database.ts:
<<<typescript
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import type { User } from '../../../shared/src/types';

const dbFile = path.join(**dirname, '../../../app.db');
const schemaPath = path.join(**dirname, './schema.sql');

const db = new Database(dbFile);

// schema.sql 실행
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// 사용자 전체 조회 쿼리
function getAllUsers(): User[] {
return db.prepare('SELECT \* FROM users').all() as User[];
}

export { db, getAllUsers };

> > >

────────────────────────────────────────────
📦 main/src/db/schema.sql:
<<<sql
CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
name TEXT NOT NULL
);

> > >

────────────────────────────────────────────
📦 main/src/test/db.test.ts:
<<<typescript
import { getAllUsers } from '../db/database';

describe('DB User Query', () => {
it('should return an array (users)', () => {
const users = getAllUsers();
expect(Array.isArray(users)).toBe(true);
});

it('should return empty array if no users', () => {
const users = getAllUsers();
expect(users.length).toBe(0);
});
});

> > >

────────────────────────────────────────────
📦 main/src/index.ts (기존 파일 수정):
<<<typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { formatDate } from '@shared/utils';
import { getAllUsers } from './db/database';

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

console.log('[Electron] App started at', formatDate(new Date()));
console.log('[Electron] Users in DB:', getAllUsers());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit();
});

> > >

────────────────────────────────────────────
🧪 테스트 실행 방법 (Jest)

1. `npm install` (최초 1회)
2. `npm test` ← Jest로 단위 테스트 실행

────────────────────────────────────────────
✅ 완료 조건

- `main/src/db/database.ts` 내 SQLite 연결 및 초기화 로직 완성 (ESM, 타입 안전)
- `main/src/test/db.test.ts`에서 Jest 기반 쿼리 테스트 및 검증 코드 작성
- `main/index.ts`에서 `getAllUsers()` 결과 출력
- shared의 타입이나 유틸을 문제없이 사용할 수 있음
- TypeScript + ESM(import/export) 기반 구조를 유지하며, Jest로 테스트 가능
