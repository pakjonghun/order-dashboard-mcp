🟣 Electron-SQL App Scaffold Prompt — Step 5.1 (Main 핸들러 생성: 엑셀 → SQLite 저장)

당신은 Electron SQL 분석 앱의 메인 프로세스에서  
프론트에서 업로드한 엑셀 데이터를 SQLite DB에 저장하는 핸들러를 생성하는 scaffold 생성기입니다.  
컬럼 매핑 정보와 데이터는 JSON 형식으로 전달받으며, DB에는 `uploaded_data` 테이블로 저장합니다.  
핸들러 키는 shared/constants.ts에 정의되어 있어야 하며, 출력은 항상 `경로:<<<코드>>>` 형식을 사용합니다.

────────────────────────────────────────────
🎯 기능 요약

- 프론트에서 JSON 형식으로 전달된 엑셀 데이터를 저장하는 IPC 핸들러 생성
- shared/constants.ts에서 채널명 정의 및 export
- 저장 대상 테이블명은 uploaded_data (미리 정의)
- 저장 방식은 better-sqlite3 사용 (이미 연결된 db 객체로 처리)
- 컬럼은 유동적일 수 있으며, INSERT 시 자동 생성 쿼리를 구성해야 함

────────────────────────────────────────────
📁 생성/수정할 파일 구조

shared/
├── src/
│ └── constants.ts ← IPC 채널 키 추가

main/
├── src/
│ ├── db/
│ │ └── database.ts ← db 인스턴스 export (이미 있음)
│ ├── handlers/
│ │ └── uploadHandler.ts ← 엑셀 데이터 저장 핸들러
│ └── index.ts ← 핸들러 등록

────────────────────────────────────────────
📦 shared/src/constants.ts (추가):
<<<typescript
export const IPC_CHANNELS = {
QUERY_FROM_NL: 'query:from-nl',
UPLOAD_EXCEL_DATA: 'excel:upload-to-db',
};

> > >

────────────────────────────────────────────
📦 main/src/handlers/uploadHandler.ts:
<<<typescript
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
const { db } = require('../db/database');

// 핸들러: 엑셀 데이터 JSON 받아서 uploaded_data 테이블에 저장
ipcMain.handle(IPC_CHANNELS.UPLOAD_EXCEL_DATA, async (\_event, payload) => {
const { columns, rows } = payload;

// 예시:
// columns = ["name", "age"]
// rows = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]

if (!columns || !Array.isArray(rows)) {
return { success: false, error: 'Invalid payload format' };
}

try {
const insert = db.prepare(
`INSERT INTO uploaded_data (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`
);

    const insertMany = db.transaction((records) => {
      for (const row of records) {
        const values = columns.map((col) => row[col]);
        insert.run(...values);
      }
    });

    insertMany(rows);

    return { success: true, inserted: rows.length };

} catch (error) {
console.error('[Main] 엑셀 업로드 저장 오류:', error);
return { success: false, error: error.message };
}
});

> > >

────────────────────────────────────────────
📦 main/src/index.ts (핸들러 등록 추가):
<<<typescript
require('./handlers/queryHandler');
require('./handlers/uploadHandler'); // 추가된 핸들러

> > >

────────────────────────────────────────────
✅ 완료 조건

- shared/constants.ts에 `UPLOAD_EXCEL_DATA` 채널명이 추가됨
- main 핸들러 `excel:upload-to-db`는 columns와 rows를 받아 uploaded_data 테이블에 저장함
- db는 better-sqlite3로 연결되어 있으며, 트랜잭션 처리됨
- 오류 발생 시 상세 메시지를 포함하여 반환함
- 실행 결과는 `{ success: true, inserted: N }` 또는 `{ success: false, error: string }` 형태로 응답됨
