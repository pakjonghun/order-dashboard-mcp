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
