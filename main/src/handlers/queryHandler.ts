import '../mcp/handler';
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/src/constants';
import type { OrderRow } from '../../../shared/src/types';

// Mock 주문 데이터
const mockOrders: OrderRow[] = [
  {
    address: '서울시 강남구 테헤란로 123',
    barcode: '1234567890123',
    invoiceNumber: 'INV-2024-001',
    message: '부재시 경비실에 맡겨주세요',
    orderStatus: '배송중',
    postalCode: '06123',
    customerName: '김철수',
    client: '네이버쇼핑',
    orderNumber: 'ORD-2024-001',
    totalAmount: 150000,
    settlementAmount: 135000,
    quantity: 2,
    cost: 50000,
    productCode: 'PROD-001',
    productName: '스마트폰 케이스',
    orderDate: '2024-01-15',
    shoppingMallId: 'NAVER-001',
    phoneNumber: '010-1234-5678',
  },
  {
    address: '부산시 해운대구 해운대로 456',
    barcode: '9876543210987',
    invoiceNumber: 'INV-2024-002',
    message: '문 앞에 놓아주세요',
    orderStatus: '배송완료',
    postalCode: '48095',
    customerName: '이영희',
    client: '쿠팡',
    orderNumber: 'ORD-2024-002',
    totalAmount: 89000,
    settlementAmount: 80100,
    quantity: 1,
    cost: 30000,
    productCode: 'PROD-002',
    productName: '무선 이어폰',
    orderDate: '2024-01-16',
    shoppingMallId: 'COUPANG-001',
    phoneNumber: '010-9876-5432',
  },
  {
    address: '대구시 수성구 동대구로 789',
    barcode: '4567891230456',
    invoiceNumber: 'INV-2024-003',
    message: '택배함에 보관해주세요',
    orderStatus: '주문접수',
    postalCode: '41931',
    customerName: '박민수',
    client: '11번가',
    orderNumber: 'ORD-2024-003',
    totalAmount: 250000,
    settlementAmount: 225000,
    quantity: 3,
    cost: 80000,
    productCode: 'PROD-003',
    productName: '노트북 스탠드',
    orderDate: '2024-01-17',
    shoppingMallId: '11ST-001',
    phoneNumber: '010-5555-1234',
  },
];

// 자연어 쿼리 핸들러
ipcMain.handle(IPC_CHANNELS.QUERY_FROM_NL, async (_event, query: string) => {
  try {
    console.log('[Main] 자연어 쿼리 받음:', query);

    // Mock 데이터 반환 (실제로는 MCP 서버를 통해 처리)
    return mockOrders;
  } catch (error: unknown) {
    console.error('[Main] 쿼리 처리 오류:', error);
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return { error: true, message };
  }
});
