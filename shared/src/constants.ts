export const IPC_CHANNELS = {
  QUERY_FROM_NL: 'query:from-nl',
  UPLOAD_EXCEL_DATA: 'excel:upload-to-db',
  RESET_ALL_DATA: 'db:reset-all',
  MCP_GENERATE_SQL: 'mcp:generate-sql', // 추가
};

// 엑셀 컬럼 매핑 설정
export const EXCEL_COLUMN_MAPPING = {
  // 엑셀 헤더명 -> DB 컬럼명 매핑
  ID: 'id',
  Id: 'id',
  id: 'id',
  아이디: 'id',
  번호: 'id',
  NAME: 'name',
  Name: 'name',
  name: 'name',
  이름: 'name',
  성명: 'name',
  사용자명: 'name',
} as const;

// 필수 컬럼 정의
export const REQUIRED_COLUMNS = ['id', 'name'] as const;
