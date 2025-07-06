import { app, BrowserWindow } from 'electron';
import { formatDate } from '@dashboard-app/shared';
import { OrderRow } from '@shared/types';
import { getAllOrders } from './db/database';
import './config/env';
import './handlers/queryHandler';
import './handlers/uploadHandler';
import './handlers/resetHandler';
import './mcp/handler'; // MCP 핸들러 추가
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:3000');

  console.log('[Electron] App started at', formatDate(new Date()));
  console.log('[Electron] Orders in DB:', getAllOrders());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function abc() {
  const order: OrderRow = {
    address: '서울시 강남구',
    barcode: '1234567890123',
    invoiceNumber: 'INV-001',
    message: '부재시 경비실',
    orderStatus: '배송중',
    postalCode: '06123',
    customerName: '김철수',
    client: '네이버쇼핑',
    orderNumber: 'ORD-001',
    totalAmount: 150000,
    settlementAmount: 135000,
    quantity: 2,
    cost: 50000,
    productCode: 'PROD-001',
    productName: '스마트폰 케이스',
    orderDate: '2024-01-15',
    shoppingMallId: 'NAVER-001',
    phoneNumber: '010-1234-5678',
  };
}
