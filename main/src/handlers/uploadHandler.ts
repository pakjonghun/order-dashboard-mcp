import { ipcMain } from 'electron';
import {
  IPC_CHANNELS,
  EXCEL_COLUMN_MAPPING,
  REQUIRED_COLUMNS,
  DB_COLUMNS,
} from '../../../shared/src/constants';
import { UploadRequest, UploadResponse, OrderRow } from '../../../shared/src/types';
const { db } = require('../db/database');

// 엑셀 헤더를 DB 컬럼명으로 매핑하는 함수
function mapExcelColumnsToDbColumns(excelColumns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const excelCol of excelColumns) {
    const dbCol = EXCEL_COLUMN_MAPPING[excelCol as keyof typeof EXCEL_COLUMN_MAPPING];
    if (dbCol) {
      mapping[excelCol] = dbCol;
    }
  }

  return mapping;
}

// 필수 컬럼이 모두 있는지 확인하는 함수
function validateRequiredColumns(mapping: Record<string, string>): boolean {
  const mappedColumns = Object.values(mapping);
  return REQUIRED_COLUMNS.every((col) => mappedColumns.includes(col));
}

// 핸들러: 엑셀 데이터 JSON 받아서 orders 테이블에 저장
ipcMain.handle(
  IPC_CHANNELS.UPLOAD_EXCEL_DATA,
  async (_event, payload: UploadRequest): Promise<UploadResponse> => {
    const { columns, rows } = payload;

    // 디버깅: 받은 데이터 확인
    console.log('[Main] 받은 데이터 샘플:', {
      columns,
      sampleRow: rows[0],
    });

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
      // 엑셀 컬럼을 DB 컬럼으로 매핑
      const columnMapping = mapExcelColumnsToDbColumns(columns);
      console.log('[Main] 컬럼 매핑 결과:', columnMapping);

      // 필수 컬럼 검증
      if (!validateRequiredColumns(columnMapping)) {
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !Object.values(columnMapping).includes(col)
        );
        console.error('[Main] 필수 컬럼 누락:', missingColumns);
        return {
          success: false,
          error: `필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`,
        };
      }

      console.log('[Main] DB 삽입 시작');

      // orders 테이블에 삽입할 컬럼들 준비
      const orderColumns = DB_COLUMNS.join(', ');
      const placeholders = DB_COLUMNS.map(() => '?').join(', ');
      const insert = db.prepare(`INSERT INTO orders (${orderColumns}) VALUES (${placeholders})`);

      const insertMany = db.transaction((records: Record<string, unknown>[]) => {
        for (const row of records) {
          // 매핑된 컬럼을 사용하여 데이터 추출
          const orderData: Record<string, any> = {};

          for (const [excelCol, dbCol] of Object.entries(columnMapping)) {
            const value = row[excelCol];
            if (value !== undefined && value !== null) {
              // 숫자 필드 처리
              if (['totalAmount', 'settlementAmount', 'quantity', 'cost'].includes(dbCol)) {
                (orderData as Record<string, any>)[dbCol] = Number(value || 0);
              } else {
                (orderData as Record<string, any>)[dbCol] = String(value);
              }
            }
          }

          // 필수 필드가 있는지 확인
          if (orderData.orderNumber && orderData.customerName && orderData.productName) {
            // DB_COLUMNS 순서대로 값 배열 생성
            const values = DB_COLUMNS.map((col) => orderData[col as keyof OrderRow] || '');
            insert.run(...values);
          }
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
