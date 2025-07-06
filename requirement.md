🟣 Electron-SQL MCP 서버 Scaffold Prompt — Main 프로세스용

당신은 Electron 기반 SQLite 분석 앱의 Main 프로세스에 자연어 기반 SQL 생성 서버(MCP)를 구축하는 전문 scaffold 생성기입니다.  
아래 명세에 따라 `main/src/mcp/` 디렉토리를 생성하고, SQLite 스키마 분석 → 자연어 SQL 생성 → 실행 → JSON 반환까지의 구조를 구축하세요.  
출력은 항상 경로:<<<코드>>> 형식이며, 코드블록 중첩 없이 하나의 <<< >>>만 사용하세요.

────────────────────────────────────────────
🎯 목표 요약

• 자연어 입력을 받아 → DB 스키마를 확인 → SQL 생성 → 쿼리 실행 → 결과를 JSON으로 반환  
• 전체 흐름은 tools + systemPrompt + LLM (Anthropic SDK) + IPC 핸들러 기반  
• SQLite는 better-sqlite3로 연결됨  
• 시스템 프롬프트는 고정 변수로 분리되고, 사용 가능한 MCP 툴을 명시  
• 프론트는 'mcp:generate-sql' IPC 채널을 통해 Main과 통신

────────────────────────────────────────────
📁 디렉토리 구조

main/
└── src/
└── mcp/
├── systemPrompt.ts ← LLM의 역할/절차 정의
├── tools/
│ ├── getDbSchemaTool.ts ← DB 테이블/컬럼 정보 반환
│ ├── getMcpPromptTool.ts ← 자연어 + 스키마 → 프롬프트 생성
│ └── executeSqlTool.ts ← SQL 실행 → JSON 결과 반환
├── mcpServer.ts ← MCP 전체 orchestrator
└── handler.ts ← Electron IPC 핸들러 ('mcp:generate-sql')

────────────────────────────────────────────
🛠 MCP 툴 설명

• getDbSchemaTool  
 └ SQLite 연결 후 테이블 목록과 각 컬럼명을 문자열로 반환  
• getMcpPromptTool  
 └ 사용자 자연어 + DB 스키마를 결합한 최종 프롬프트 문자열 생성  
• executeSqlTool  
 └ 입력받은 SQL 문자열을 실행하고 JSON 배열로 결과 반환

────────────────────────────────────────────
📡 시스템 프롬프트 예시 (systemPrompt.ts)

export const systemPrompt = `
당신은 Electron 기반 SQLite 분석 도우미입니다. 사용자의 자연어 입력을 해석해 SQLite 쿼리를 생성하고 실행한 후, 프론트에서 사용 가능한 JSON 테이블 결과로 반환합니다.

🛠 사용 가능한 MCP 툴 목록:

1. getDbSchemaTool: 현재 SQLite의 테이블/컬럼 구조를 설명합니다.
2. getMcpPromptTool: 사용자 요청 + 스키마 정보를 바탕으로 SQL 생성 지시문을 만듭니다.
3. executeSqlTool: SQL을 실행하고 JSON 결과를 반환합니다.

📝 절차:

1. 먼저 getDbSchemaTool로 전체 스키마를 가져오세요.
2. 그 결과와 사용자 입력을 바탕으로 getMcpPromptTool로 SQL 생성 요청 프롬프트를 만드세요.
3. 생성된 SQL을 executeSqlTool로 실행하세요.
4. 실행 결과를 JSON 배열로 반환하세요.

⛔ 실패하거나 SQL 실행이 불가능할 경우, 다음과 같은 형식으로 답변하세요:
{ "error": true, "message": "실행할 수 없습니다: (이유)" }

⚠️ 주의사항:

- 임의의 데이터를 생성하지 마세요.
- 반드시 MCP 툴을 통해 SQL을 생성 및 실행하세요.
- 결과는 프론트에서 사용 가능한 JSON 배열 형식으로 반환하세요.
  `;

────────────────────────────────────────────
📦 mcpServer.ts 요구 기능

- `generate(prompt: string): Promise<any>` 메서드로 외부에서 자연어 실행 가능
- Anthropic SDK를 통해 systemPrompt + tools + user prompt로 메시지 구성
- tools는 직접 호출 가능한 handler와 함께 구성

────────────────────────────────────────────
📦 handler.ts IPC 핸들러 등록

- 채널명: mcp:generate-sql
- 입력: 자연어 문자열
- 출력: SQL 실행 결과 (JSON 배열)

────────────────────────────────────────────
✅ 완료 조건

- MCP 서버가 main 프로세스에 구축되어 있음
- 자연어 입력이 들어오면 tools를 통해 순차적으로 SQL 생성 및 실행됨
- 결과는 JSON 테이블로 반환되어 프론트에서 직접 표시 가능
- 모든 MCP 툴은 `Promise<{ text: string }>` 형식으로 동작
- 전체 시스템은 TypeScript 기반 + Electron IPC 기반 구조

[매우중요!! 반듯이 지킬것]
이미 존재하는 라이브러리는 다시 설치 금지
packagejson 을 확인해서 중복 설치 금지 및 이미 쿼리 기능이 모두 있으므로 handler폴더 내부에 기능 확인해서 작성 할 것
