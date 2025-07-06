import { db } from '../../db/database';
import type { PaginationInfo } from '../../../../shared/src/types';

interface ExecuteSqlParams {
  sql: string;
  page?: number;
  pageSize?: number;
}

export async function executeSqlTool({
  sql,
  page = 1,
  pageSize = 20,
}: ExecuteSqlParams): Promise<{ text: string }> {
  try {
    // SELECT 쿼리만 허용
    if (!/^\s*select/i.test(sql)) {
      return { text: JSON.stringify({ error: true, message: 'SELECT 쿼리만 허용됩니다.' }) };
    }

    console.log('실행할 SQL:', sql);
    console.log('페이지:', page, '페이지 크기:', pageSize);

    // 데이터 쿼리 실행 (이미 LIMIT/OFFSET이 포함된 SQL 사용)
    const stmt = db.prepare(sql);
    const result = stmt.all();

    console.log('쿼리 결과 개수:', result.length);

    // 전체 개수 조회를 위한 쿼리 생성 (LIMIT/OFFSET 제거)
    const cleanSql = sql.replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?\s*;?\s*$/i, '').trim();
    const countSql = cleanSql.replace(/SELECT\s+.+?\s+FROM/i, 'SELECT COUNT(*) as total FROM');
    const countStmt = db.prepare(countSql);
    const countResult = countStmt.get() as { total: number };
    const totalCount = countResult.total;

    console.log('전체 개수:', totalCount);

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalCount / pageSize);
    const pagination: PaginationInfo = {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      text: JSON.stringify({
        success: true,
        data: result,
        pagination,
        executedSql: sql,
        countSql: countSql,
      }),
    };
  } catch (e: any) {
    console.error('SQL 실행 오류:', e);
    return { text: JSON.stringify({ error: true, message: e.message }) };
  }
}
