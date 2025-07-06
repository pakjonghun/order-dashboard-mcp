import Database from 'better-sqlite3';
import type { OrderRow } from '../../../shared/src/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const dbFile = path.join(__dirname, '../../../app.db');
const schemaPath = path.join(__dirname, './schema.sql');

const db = new Database(dbFile);

// schema.sql 실행
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// 주문 전체 조회 쿼리
function getAllOrders(): OrderRow[] {
  return db.prepare('SELECT * FROM orders').all() as OrderRow[];
}

export { db, getAllOrders };
