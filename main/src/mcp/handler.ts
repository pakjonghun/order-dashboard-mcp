import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import { McpServer } from './mcpServer';

const mcpServer = new McpServer();

ipcMain.handle(IPC_CHANNELS.MCP_GENERATE_SQL, async (_event, prompt: string) => {
  try {
    console.log('prompt', prompt);
    const result = await mcpServer.generate(prompt);
    return result;
  } catch (e: any) {
    return { error: true, message: e.message };
  }
});
