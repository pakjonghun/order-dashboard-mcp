export interface User {
  id: string;
  name: string;
}

// 자연어 검색 IPC용 타입
export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  name: string;
  age: number;
}

// 엑셀 업로드 IPC용 타입
export interface UploadRequest {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface UploadSuccessResponse {
  success: true;
  inserted: number;
}

export interface UploadErrorResponse {
  success: false;
  error: string;
}

export type UploadResponse = UploadSuccessResponse | UploadErrorResponse;

// 엑셀 파싱 결과 타입
export interface ParsedExcelData {
  columns: string[];
  rows: Record<string, unknown>[];
}
