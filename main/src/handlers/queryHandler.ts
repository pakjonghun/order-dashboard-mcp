import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import type { SearchRequest, SearchResponse } from '../../../shared/src/types';

// 자연어 질의 처리 핸들러
ipcMain.handle(
  IPC_CHANNELS.QUERY_FROM_NL,
  async (_event, req: SearchRequest): Promise<SearchResponse[]> => {
    console.log('[Main] 자연어 입력:', req.query);

    // 프론트 테이블 형식에 맞춘 mock 데이터 반환
    const mockResult: SearchResponse[] = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 42 },
    ];

    return mockResult;
  }
);
