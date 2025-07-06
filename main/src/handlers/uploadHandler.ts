import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import { UploadRequest, UploadResponse } from '../../../shared/src/types';
const { db } = require('../db/database');

// 핸들러: 엑셀 데이터 JSON 받아서 uploaded_data 테이블에 저장
ipcMain.handle(
  IPC_CHANNELS.UPLOAD_EXCEL_DATA,
  async (_event, payload: UploadRequest): Promise<UploadResponse> => {
    const { columns, rows } = payload;

    console.log('[Main] 엑셀 업로드 요청 받음:', {
      columns,
      rowCount: rows.length,
      sampleRow: rows[0],
    });

    if (!columns || !Array.isArray(rows)) {
      console.error('[Main] 잘못된 페이로드 형식:', payload);
      return { success: false, error: 'Invalid payload format' };
    }

    if (rows.length === 0) {
      console.warn('[Main] 빈 데이터 업로드 시도');
      return { success: false, error: 'No data to upload' };
    }

    try {
      console.log('[Main] DB 삽입 시작');

      const insert = db.prepare(
        `INSERT INTO uploaded_data (${columns.join(',')}) VALUES (${columns
          .map(() => '?')
          .join(',')})`
      );

      const insertMany = db.transaction((records: Record<string, unknown>[]) => {
        for (const row of records) {
          const values = columns.map((col: string) => row[col]);
          insert.run(...values);
        }
      });

      insertMany(rows);

      console.log('[Main] DB 삽입 완료:', rows.length, '개 행');
      return { success: true, inserted: rows.length };
    } catch (error: unknown) {
      console.error('[Main] 엑셀 업로드 저장 오류:', error);
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      return { success: false, error: message };
    }
  }
);
