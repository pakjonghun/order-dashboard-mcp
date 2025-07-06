import { db } from '../../db/database';

export async function executeSqlTool({ sql }: { sql: string }): Promise<{ text: string }> {
  try {
    const stmt = db.prepare(sql);
    // SELECT 쿼리만 허용
    if (/^\s*select/i.test(sql)) {
      const result = stmt.all();
      return { text: JSON.stringify(result) };
    } else {
      return { text: JSON.stringify({ error: true, message: 'SELECT 쿼리만 허용됩니다.' }) };
    }
  } catch (e: any) {
    return { text: JSON.stringify({ error: true, message: e.message }) };
  }
}
