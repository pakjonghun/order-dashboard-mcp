import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from './systemPrompt';
import { getDbSchemaTool } from './tools/getDbSchemaTool';
import { getMcpPromptTool } from './tools/getMcpPromptTool';
import { executeSqlTool } from './tools/executeSqlTool';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class McpServer {
  async generate(prompt: string): Promise<any> {
    // API 키 확인
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);

    // 1. DB 스키마 조회
    const schemaRes = await getDbSchemaTool();
    console.log('schemaRes', schemaRes);
    // 2. 프롬프트 생성
    const mcpPromptRes = await getMcpPromptTool({ userInput: prompt, schema: schemaRes.text });
    console.log('mcpPromptRes : ', mcpPromptRes);

    // 3. LLM에 프롬프트 전달 및 SQL 생성 (Messages API 사용)
    console.log('Calling Anthropic API...');
    try {
      const llmRes = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: mcpPromptRes.text }],
      });
      console.log('Anthropic API response received');

      // 4. LLM이 생성한 SQL 추출
      const firstContent = llmRes.content[0];
      const fullResponse =
        typeof firstContent === 'object' && 'text' in firstContent
          ? (firstContent as any).text?.trim()
          : undefined;

      console.log('Full LLM response:', fullResponse);

      // SQL 코드 블록에서 SQL만 추출
      let sql = '';
      if (fullResponse) {
        const sqlMatch = fullResponse.match(/```sql\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
          sql = sqlMatch[1].trim();
        } else {
          // SQL 코드 블록이 없으면 전체 텍스트에서 SQL 키워드가 있는 부분만 추출
          const lines = fullResponse.split('\n');
          for (const line of lines) {
            if (
              line.trim().toUpperCase().includes('SELECT') ||
              line.trim().toUpperCase().includes('INSERT') ||
              line.trim().toUpperCase().includes('UPDATE') ||
              line.trim().toUpperCase().includes('DELETE')
            ) {
              sql = line.trim();
              break;
            }
          }
        }
      }

      console.log('Extracted SQL:', sql);
      if (!sql) {
        return { error: true, message: 'LLM이 SQL을 생성하지 못했습니다.' };
      }
      // 5. SQL 실행
      const execRes = await executeSqlTool({ sql });
      console.log('execRes : ', execRes);
      try {
        return JSON.parse(execRes.text);
      } catch {
        return execRes.text;
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        error: true,
        message: `API 호출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      };
    }
  }
}
