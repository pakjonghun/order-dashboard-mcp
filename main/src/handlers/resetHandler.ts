import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import type { ResetRequest, ResetResponse } from '../../../shared/src/types';
const { db } = require('../db/database');

// DB 전체 데이터 삭제 핸들러
ipcMain.handle(
  IPC_CHANNELS.RESET_ALL_DATA,
  async (_event, _req: ResetRequest): Promise<ResetResponse> => {
    try {
      db.prepare('DELETE FROM orders').run();
      return { success: true };
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      return { success: false, error: message };
    }
  }
);
