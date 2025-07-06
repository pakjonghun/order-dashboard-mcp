export const IPC_CHANNELS = {
  QUERY_FROM_NL: 'query:from-nl',
  UPLOAD_EXCEL_DATA: 'excel:upload-to-db',
  RESET_ALL_DATA: 'db:reset-all',
  MCP_GENERATE_SQL: 'mcp:generate-sql', // 추가
  EXECUTE_SQL_DIRECT: 'execute:sql-direct', // 추가
};

// 주문 데이터 컬럼 목록
export const DB_COLUMNS = [
  'address',
  'barcode',
  'invoiceNumber',
  'message',
  'orderStatus',
  'postalCode',
  'customerName',
  'client',
  'orderNumber',
  'totalAmount',
  'settlementAmount',
  'quantity',
  'cost',
  'productCode',
  'productName',
  'orderDate',
  'shoppingMallId',
  'phoneNumber',
] as const;

// 엑셀 컬럼 매핑 설정
export const EXCEL_COLUMN_MAPPING = {
  // 주소
  ADDRESS: 'address',
  Address: 'address',
  address: 'address',
  주소: 'address',
  배송주소: 'address',
  // 바코드
  BARCODE: 'barcode',
  Barcode: 'barcode',
  barcode: 'barcode',
  바코드: 'barcode',
  // 송장번호
  INVOICE_NUMBER: 'invoiceNumber',
  InvoiceNumber: 'invoiceNumber',
  invoiceNumber: 'invoiceNumber',
  송장번호: 'invoiceNumber',
  송장: 'invoiceNumber',
  // 메시지
  MESSAGE: 'message',
  Message: 'message',
  message: 'message',
  메시지: 'message',
  비고: 'message',
  // 주문상태
  ORDER_STATUS: 'orderStatus',
  OrderStatus: 'orderStatus',
  orderStatus: 'orderStatus',
  주문상태: 'orderStatus',
  상태: 'orderStatus',
  // 우편번호
  POSTAL_CODE: 'postalCode',
  PostalCode: 'postalCode',
  postalCode: 'postalCode',
  우편번호: 'postalCode',
  우편: 'postalCode',
  // 수취인 이름
  CUSTOMER_NAME: 'customerName',
  CustomerName: 'customerName',
  customerName: 'customerName',
  수취인: 'customerName',
  수취인명: 'customerName',
  고객명: 'customerName',
  // 거래처
  CLIENT: 'client',
  Client: 'client',
  client: 'client',
  거래처: 'client',
  판매처: 'client',
  // 주문번호
  ORDER_NUMBER: 'orderNumber',
  OrderNumber: 'orderNumber',
  orderNumber: 'orderNumber',
  주문번호: 'orderNumber',
  주문: 'orderNumber',
  // 매출
  TOTAL_AMOUNT: 'totalAmount',
  TotalAmount: 'totalAmount',
  totalAmount: 'totalAmount',
  매출: 'totalAmount',
  총액: 'totalAmount',
  금액: 'totalAmount',
  // 정산액
  SETTLEMENT_AMOUNT: 'settlementAmount',
  SettlementAmount: 'settlementAmount',
  settlementAmount: 'settlementAmount',
  정산액: 'settlementAmount',
  정산: 'settlementAmount',
  // 수량
  QUANTITY: 'quantity',
  Quantity: 'quantity',
  quantity: 'quantity',
  수량: 'quantity',
  개수: 'quantity',
  // 원가
  COST: 'cost',
  Cost: 'cost',
  cost: 'cost',
  원가: 'cost',
  비용: 'cost',
  // 제품코드
  PRODUCT_CODE: 'productCode',
  ProductCode: 'productCode',
  productCode: 'productCode',
  제품코드: 'productCode',
  상품코드: 'productCode',
  // 제품이름
  PRODUCT_NAME: 'productName',
  ProductName: 'productName',
  productName: 'productName',
  제품명: 'productName',
  상품명: 'productName',
  제품이름: 'productName',
  // 주문날짜
  ORDER_DATE: 'orderDate',
  OrderDate: 'orderDate',
  orderDate: 'orderDate',
  주문날짜: 'orderDate',
  주문일: 'orderDate',
  날짜: 'orderDate',
  // 쇼핑몰ID
  SHOPPING_MALL_ID: 'shoppingMallId',
  ShoppingMallId: 'shoppingMallId',
  shoppingMallId: 'shoppingMallId',
  쇼핑몰ID: 'shoppingMallId',
  쇼핑몰: 'shoppingMallId',
  // 연락처
  PHONE_NUMBER: 'phoneNumber',
  PhoneNumber: 'phoneNumber',
  phoneNumber: 'phoneNumber',
  연락처: 'phoneNumber',
  전화번호: 'phoneNumber',
  휴대폰: 'phoneNumber',
} as const;

// 필수 컬럼 정의 (주문번호, 고객명, 제품명은 필수)
// export const REQUIRED_COLUMNS = ['orderNumber', 'customerName', 'productName'] as const;
export const REQUIRED_COLUMNS = [...DB_COLUMNS] as const;
