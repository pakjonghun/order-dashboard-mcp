import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from './systemPrompt';
import { getDbSchemaTool } from './tools/getDbSchemaTool';
import { getMcpPromptTool } from './tools/getMcpPromptTool';
import { executeSqlTool } from './tools/executeSqlTool';
import { SearchResponse } from '../../../shared/src/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class McpServer {
  async generate(prompt: string): Promise<SearchResponse> {
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

      // LLM 응답 분석
      if (fullResponse) {
        // JSON 형식의 에러 메시지인지 확인
        try {
          const jsonResponse = JSON.parse(fullResponse);
          if (jsonResponse.error) {
            return {
              success: false,
              error: true,
              message: jsonResponse.message,
              suggestion: jsonResponse.suggestion,
              llmMessage: fullResponse,
            };
          }
        } catch {
          // JSON이 아니면 SQL 추출 시도
        }
      }

      // SQL 추출 로직 개선
      let sql = '';
      if (fullResponse) {
        // 1. SQL 코드 블록에서 추출 시도
        const sqlMatch = fullResponse.match(/```sql\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
          sql = sqlMatch[1].trim();
        } else {
          // 2. 전체 응답에서 SQL 문장 추출 - 개선된 방법
          const lines = fullResponse.split('\n');
          let sqlLines: string[] = [];
          let foundSelect = false;
          let bracketCount = 0;

          for (const line of lines) {
            const trimmedLine = line.trim();

            // SELECT로 시작하는 라인 찾기
            if (trimmedLine.toUpperCase().startsWith('SELECT')) {
              foundSelect = true;
              sqlLines.push(trimmedLine);
              // 괄호 개수 세기
              bracketCount += (trimmedLine.match(/\(/g) || []).length;
              bracketCount -= (trimmedLine.match(/\)/g) || []).length;
            }
            // SELECT 이후의 라인들 추가
            else if (foundSelect) {
              // 괄호 개수 업데이트
              bracketCount += (trimmedLine.match(/\(/g) || []).length;
              bracketCount -= (trimmedLine.match(/\)/g) || []).length;

              sqlLines.push(trimmedLine);

              // 세미콜론으로 끝나고 괄호가 모두 닫혔으면 종료
              if (trimmedLine.includes(';') && bracketCount === 0) {
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
        return {
          success: false,
          error: true,
          message: 'LLM이 SQL을 생성하지 못했습니다. 더 구체적인 요청을 해주세요.',
          suggestion: '예시: "2024년 1월 주문 데이터를 보여줘", "김철수 고객의 주문 내역을 알려줘"',
          llmMessage: fullResponse,
        };
      }

      // 5. SQL 실행
      const execRes = await executeSqlTool({ sql });
      console.log('execRes : ', execRes);

      try {
        const result = JSON.parse(execRes.text);

        // 결과가 에러인 경우
        if (result.error) {
          return {
            success: false,
            error: true,
            message: result.message,
            executedSql: sql,
            llmMessage: fullResponse,
          };
        }

        // 결과가 배열이고 비어있는 경우
        if (Array.isArray(result) && result.length === 0) {
          return {
            success: false,
            error: true,
            message: '검색 결과가 없습니다.',
            suggestion:
              '다른 검색 조건을 시도해보세요. 예시: "전체 주문 데이터", "다른 고객명으로 검색"',
            executedSql: sql,
            llmMessage: fullResponse,
          };
        }

        // 정상 결과인 경우
        return {
          success: true,
          data: result,
          executedSql: sql,
          count: Array.isArray(result) ? result.length : 1,
          llmMessage: fullResponse,
        };
      } catch {
        // JSON 파싱 실패 시 텍스트 그대로 반환
        return {
          success: true,
          data: [{ message: execRes.text }],
          executedSql: sql,
          count: 1,
          llmMessage: fullResponse,
        };
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        success: false,
        error: true,
        message: `API 호출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        suggestion: '잠시 후 다시 시도해주세요.',
      };
    }
  }
}
