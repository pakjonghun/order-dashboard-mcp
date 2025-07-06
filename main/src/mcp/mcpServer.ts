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

      // SQL 추출 로직 개선
      let sql = '';
      if (fullResponse) {
        // 1. SQL 코드 블록에서 추출 시도
        const sqlMatch = fullResponse.match(/```sql\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
          sql = sqlMatch[1].trim();
        } else {
          // 2. 전체 응답에서 SQL 문장 추출 - 더 간단한 방법
          const lines = fullResponse.split('\n');
          let sqlLines: string[] = [];
          let foundSelect = false;

          for (const line of lines) {
            const trimmedLine = line.trim();

            // SELECT로 시작하는 라인 찾기
            if (trimmedLine.toUpperCase().startsWith('SELECT')) {
              foundSelect = true;
              sqlLines.push(trimmedLine);
            }
            // SELECT 이후의 라인들 추가
            else if (foundSelect) {
              // 빈 라인이 아니고, SQL 키워드나 구문이 포함된 라인
              if (
                trimmedLine &&
                (trimmedLine.toUpperCase().includes('FROM') ||
                  trimmedLine.toUpperCase().includes('WHERE') ||
                  trimmedLine.toUpperCase().includes('ORDER BY') ||
                  trimmedLine.toUpperCase().includes('GROUP BY') ||
                  trimmedLine.toUpperCase().includes('HAVING') ||
                  trimmedLine.toUpperCase().includes('LIMIT') ||
                  trimmedLine.toUpperCase().includes('JOIN') ||
                  trimmedLine.toUpperCase().includes('UNION') ||
                  trimmedLine.includes(',') ||
                  trimmedLine.includes('(') ||
                  trimmedLine.includes(')') ||
                  trimmedLine.includes(';'))
              ) {
                sqlLines.push(trimmedLine);
                // 세미콜론으로 끝나면 종료
                if (trimmedLine.includes(';')) {
                  break;
                }
              }
              // 빈 라인도 추가 (SQL 포맷팅용)
              else if (trimmedLine === '') {
                sqlLines.push(trimmedLine);
              }
              // SQL이 아닌 다른 내용이 나오면 종료
              else if (trimmedLine && !trimmedLine.match(/^[A-Z\s,()*.'"`-]+$/)) {
                break;
              }
            }
          }

          sql = sqlLines.join(' ').replace(/\s+/g, ' ').trim();

          // 세미콜론이 없으면 추가
          if (sql && !sql.endsWith(';')) {
            sql += ';';
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
