import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import type { SearchRequest, SearchResponse } from '../../../shared/src/types';
const { db } = require('../db/database');

// 자연어 질의 처리 핸들러
ipcMain.handle(
  IPC_CHANNELS.QUERY_FROM_NL,
  async (_event, req: SearchRequest): Promise<SearchResponse[]> => {
    console.log('[Main] 자연어 입력:', req.query);

    try {
      // users 테이블에서 모든 데이터 조회
      const result = db.prepare('SELECT * FROM users').all() as Array<{ id: string; name: string }>;

      console.log('[Main] DB 조회 결과:', result.length, '개 행');

      // SearchResponse 형식으로 변환 (name은 그대로, age는 임시로 생성)
      const transformedResult: SearchResponse[] = result.map((row) => ({
        name: row.name,
        age: Math.floor(Math.random() * 50) + 20, // 임시로 랜덤 나이 생성
      }));

      console.log('[Main] 변환된 결과:', transformedResult);
      return transformedResult;
    } catch (error) {
      console.error('[Main] DB 조회 오류:', error);
      return [];
    }
  }
);
