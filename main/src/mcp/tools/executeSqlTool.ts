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

    // 세미콜론 제거 및 공백 정리
    const cleanSql = sql.replace(/;?\s*$/, '').trim();

    console.log('실행할 SQL:', cleanSql);
    console.log('페이지:', page, '페이지 크기:', pageSize);

    // 데이터 쿼리 실행
    const stmt = db.prepare(cleanSql);
    const result = stmt.all();

    console.log('쿼리 결과 개수:', result.length);

    // 전체 개수 조회를 위한 쿼리 생성
    // LIMIT/OFFSET을 먼저 제거한 후 COUNT 쿼리 생성
    const sqlWithoutLimit = cleanSql.replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?\s*$/i, '').trim();

    let countSql: string;
    if (sqlWithoutLimit.toUpperCase().includes('GROUP BY')) {
      // GROUP BY가 있는 경우: 서브쿼리로 감싸서 COUNT
      countSql = `SELECT COUNT(*) as total FROM (${sqlWithoutLimit}) as subquery`;
    } else {
      // GROUP BY가 없는 경우: 기존 방식
      countSql = sqlWithoutLimit.replace(/SELECT\s+.+?\s+FROM/i, 'SELECT COUNT(*) as total FROM');
    }

    console.log('LIMIT 제거된 SQL:', sqlWithoutLimit);
    console.log('COUNT 쿼리:', countSql);

    let totalCount = 0;
    try {
      const countStmt = db.prepare(countSql);
      const countResult = countStmt.get() as { total: number };
      totalCount = countResult?.total || 0;
      console.log('COUNT 쿼리 결과:', countResult);
      console.log('전체 개수:', totalCount);
    } catch (countError) {
      console.error('COUNT 쿼리 실행 오류:', countError);
      // COUNT 쿼리 실패 시 현재 결과 개수로 대체
      totalCount = result.length;
    }

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

    console.log('생성된 pagination 정보:', pagination);

    return {
      text: JSON.stringify({
        success: true,
        data: result,
        pagination,
        executedSql: cleanSql,
        countSql: countSql,
      }),
    };
  } catch (e: any) {
    console.error('SQL 실행 오류:', e);
    return { text: JSON.stringify({ error: true, message: e.message }) };
  }
}
