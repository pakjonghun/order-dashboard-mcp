// 주문 데이터 인터페이스
export interface OrderRow {
  address: string;
  barcode: string;
  invoiceNumber: string;
  message: string;
  orderStatus: string;
  postalCode: string;
  customerName: string;
  client: string;
  orderNumber: string;
  totalAmount: number;
  settlementAmount: number;
  quantity: number;
  cost: number;
  productCode: string;
  productName: string;
  orderDate: string;
  shoppingMallId: string;
  phoneNumber: string;
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

export interface ResetRequest {
  // 확장 가능성을 위해 비워둠
}

export interface ResetSuccessResponse {
  success: true;
}

export interface ResetErrorResponse {
  success: false;
  error: string;
}

export type ResetResponse = ResetSuccessResponse | ResetErrorResponse;
