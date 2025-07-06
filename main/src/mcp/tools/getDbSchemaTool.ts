import { db } from '../../db/database';

export async function getDbSchemaTool(): Promise<{ text: string }> {
  // SQLite의 테이블 및 컬럼 정보 조회
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as Array<{ name: string }>;
  let schemaDesc = '';
  for (const { name } of tables) {
    const columns = db.prepare(`PRAGMA table_info(${name})`).all();
    schemaDesc += `테이블: ${name}\n컬럼: ${columns.map((col: any) => col.name).join(', ')}\n`;
  }
  return { text: schemaDesc.trim() };
}
