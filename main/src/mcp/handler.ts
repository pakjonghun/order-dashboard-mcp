import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import { McpServer } from './mcpServer';
import { executeSqlTool } from './tools/executeSqlTool';
import type { SearchRequest } from '../../../shared/src/types';

const mcpServer = new McpServer();

ipcMain.handle(IPC_CHANNELS.MCP_GENERATE_SQL, async (_event, request: SearchRequest) => {
  try {
    console.log('request', request);
    const { query, page = 1, pageSize = 20 } = request;
    const result = await mcpServer.generate(query, page, pageSize);
    return result;
  } catch (e: any) {
    return { error: true, message: e.message };
  }
});

// SQL 직접 실행 핸들러 추가
ipcMain.handle(
  IPC_CHANNELS.EXECUTE_SQL_DIRECT,
  async (_event, request: { sql: string; page: number; pageSize: number }) => {
    try {
      console.log('SQL 직접 실행:', request);
      const result = await executeSqlTool(request);
      return JSON.parse(result.text);
    } catch (e: any) {
      return { error: true, message: e.message };
    }
  }
);
