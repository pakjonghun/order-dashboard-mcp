import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './components/ui/table';
import { Pagination } from './components/ui/pagination';
import {
  type UploadResponse,
  type OrderRow,
  type SearchResponse,
  type PaginationInfo,
} from '@shared/types';
import { IPC_CHANNELS, DB_COLUMNS } from '@shared/constants';
import { UploadModal } from './components/button/upload-modal';
import { ResetButton } from './components/button/reset-button';
import { X, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dashboard별 상태에 원본 SQL 저장
interface DashboardState {
  query: string;
  result: (OrderRow | Record<string, unknown>)[];
  loading: boolean;
  error?: string;
  suggestion?: string;
  executedSql?: string;
  llmMessage?: string;
  pagination?: PaginationInfo;
  originalSql?: string; // LLM이 생성한 원본 SQL 저장
}

// Dashboard 컴포넌트에 props 추가
interface DashboardProps {
  dashboardId: number;
  state: DashboardState;
  setQuery: (query: string) => void;
  search: (query?: string, page?: number, pageSize?: number) => Promise<void>;
  onDelete: () => void;
  onPageChange: (page: number) => Promise<void>; // 추가
  onPageSizeChange: (pageSize: number) => Promise<void>; // 추가
}

function Dashboard({
  dashboardId,
  state,
  setQuery,
  search,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: DashboardProps) {
  const { query, result, loading, error, suggestion, executedSql, llmMessage, pagination } = state;

  // 페이지네이션 렌더링 조건 디버깅
  console.log(`[Dashboard ${dashboardId}] 페이지네이션 상태:`, {
    pagination: pagination,
    hasPagination: !!pagination,
    totalCount: pagination?.totalCount,
    totalPages: pagination?.totalPages,
    shouldRender: pagination && pagination.totalCount > 0 && pagination.totalPages > 0,
  });

  console.log(' :result ', result);

  return (
    <div className="flex flex-col w-full min-w-[600px] flex-1">
      <Card className="w-full rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>주문 데이터 검색 - Dashboard {dashboardId + 1}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-4 items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              await search(query, 1, pagination?.pageSize || 20); // 검색 시 첫 페이지로 이동
            }}
          >
            <Input
              placeholder="검색하고 싶은 데이터를 입력하세요. 예)2025년 매출을 알려줘"
              className="flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? '검색 중...' : '검색'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full rounded-t-none">
        <CardHeader className="pb-4">
          <CardTitle>검색 결과</CardTitle>
        </CardHeader>
        <CardContent>
          {/* LLM 메시지 표시 (추가 정보가 필요한 경우) */}
          {llmMessage && !executedSql && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="text-sm text-blue-800 whitespace-pre-wrap">{llmMessage}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* 에러 메시지 표시 */}
          {error && (
            <Alert className="mb-4 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium text-destructive">{error}</div>
                {suggestion && (
                  <div className="mt-2 text-sm text-muted-foreground">💡 {suggestion}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 실행된 SQL 표시 */}
          {executedSql && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm font-mono bg-muted p-2 rounded">{executedSql}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* 결과 테이블 */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.isArray(result) && result.length > 0 && 'orderNumber' in result[0] ? (
                    // OrderRow 타입인 경우 동적으로 컬럼 생성
                    DB_COLUMNS.map((column) => <TableHead key={column}>{column}</TableHead>)
                  ) : (
                    // 기타 JSON 결과인 경우 기본 컬럼
                    <>
                      <TableHead>키</TableHead>
                      <TableHead>값</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(result) && result.length > 0 ? (
                  result.map((row, idx) => {
                    if ('orderNumber' in row) {
                      // OrderRow 타입인 경우
                      return (
                        <TableRow key={idx}>
                          {DB_COLUMNS.map((column) => (
                            <TableCell key={column}>
                              {String(row[column as keyof OrderRow] || '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    } else {
                      // 기타 JSON 결과(동적 key-value)
                      return (
                        <TableRow key={idx}>
                          <TableCell colSpan={2}>
                            {Object.entries(row).map(([k, v]) => (
                              <div key={k}>
                                <b>{k}:</b> {String(v)}
                              </div>
                            ))}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={DB_COLUMNS.length}
                      className="text-center text-muted-foreground"
                    >
                      {error ? '검색 결과 없음' : '결과 없음'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 컴포넌트 */}
          {pagination && pagination.totalCount > 0 && pagination.totalPages > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard별 검색 함수 분리
async function searchDashboard(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResponse> {
  const ipcRenderer = window.ipcRenderer;
  if (!ipcRenderer) throw new Error('ipcRenderer not found');
  // MCP 서버 IPC 채널로 자연어 질의 (페이지네이션 파라미터 포함)
  return (await ipcRenderer.invoke(IPC_CHANNELS.MCP_GENERATE_SQL, {
    query,
    page,
    pageSize,
  })) as SearchResponse;
}

function App() {
  const [dashboards, setDashboards] = useState([0]);
  // Dashboard별 상태 관리
  const [dashboardStates, setDashboardStates] = useState<Record<number, DashboardState>>({
    0: { query: '', result: [], loading: false },
  });

  const addDashboard = () => {
    const newId = dashboards.length;
    setDashboards((prev) => [...prev, newId]);
    setDashboardStates((prev) => ({
      ...prev,
      [newId]: { query: '', result: [], loading: false },
    }));
  };

  const deleteDashboard = (dashboardId: number) => {
    setDashboards((prev) => prev.filter((id) => id !== dashboardId));
    setDashboardStates((prev) => {
      const newStates = { ...prev };
      delete newStates[dashboardId];
      return newStates;
    });
  };

  // Dashboard별 상태 업데이트 함수들
  const setQuery = (dashboardId: number, query: string) => {
    setDashboardStates((prev) => ({
      ...prev,
      [dashboardId]: { ...prev[dashboardId], query, error: undefined, suggestion: undefined },
    }));
  };

  // 페이지네이션용 SQL 업데이트 함수
  const updateSqlForPage = (sql: string, page: number, pageSize: number): string => {
    const offset = (page - 1) * pageSize;
    // 기존 LIMIT/OFFSET 제거하고 새로운 값으로 교체
    return sql.replace(
      /\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?\s*;?\s*$/i,
      ` LIMIT ${pageSize} OFFSET ${offset};`
    );
  };

  // SQL 직접 실행 함수
  const executeSqlDirect = async (
    sql: string,
    page: number,
    pageSize: number
  ): Promise<SearchResponse> => {
    const ipcRenderer = window.ipcRenderer;
    if (!ipcRenderer) throw new Error('ipcRenderer not found');

    return (await ipcRenderer.invoke(IPC_CHANNELS.EXECUTE_SQL_DIRECT, {
      sql,
      page,
      pageSize,
    })) as SearchResponse;
  };

  // 페이지 변경 핸들러
  const handlePageChange = async (dashboardId: number, page: number) => {
    const state = dashboardStates[dashboardId];
    console.log(`[handlePageChange] Dashboard ${dashboardId} 시작:`, {
      page,
      originalSql: state.originalSql,
      currentPagination: state.pagination,
    });

    if (!state.originalSql) {
      console.log('원본 SQL이 없습니다. 기존 방식으로 검색합니다.');
      await search(dashboardId, state.query, page, state.pagination?.pageSize);
      return;
    }

    console.log('페이지 변경:', page, '원본 SQL:', state.originalSql);

    // 로딩 상태 설정 (기존 pagination 정보 유지)
    setDashboardStates((prev) => {
      console.log(`[handlePageChange] 로딩 상태 설정 전:`, {
        dashboardId,
        currentPagination: prev[dashboardId].pagination,
      });

      return {
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: true,
          error: undefined,
          // pagination 정보는 유지
        },
      };
    });

    try {
      // SQL 업데이트
      const updatedSql = updateSqlForPage(
        state.originalSql,
        page,
        state.pagination?.pageSize || 20
      );
      console.log('업데이트된 SQL:', updatedSql);

      // 업데이트된 SQL 실행
      const response = await executeSqlDirect(updatedSql, page, state.pagination?.pageSize || 20);
      console.log('SQL 실행 결과:', response);
      console.log('response.pagination 상세:', {
        currentPage: response.pagination?.currentPage,
        pageSize: response.pagination?.pageSize,
        totalCount: response.pagination?.totalCount,
        totalPages: response.pagination?.totalPages,
        hasNextPage: response.pagination?.hasNextPage,
        hasPreviousPage: response.pagination?.hasPreviousPage,
      });

      setDashboardStates((prev) => {
        console.log(`[handlePageChange] 상태 업데이트:`, {
          dashboardId,
          responsePagination: response.pagination,
          currentPagination: prev[dashboardId].pagination,
          willUsePagination: response.pagination || prev[dashboardId].pagination,
        });

        return {
          ...prev,
          [dashboardId]: {
            ...prev[dashboardId],
            loading: false,
            result: response.success ? response.data || [] : [],
            pagination: response.pagination || prev[dashboardId].pagination,
            executedSql: response.executedSql,
            error: response.error ? response.message : undefined,
          },
        };
      });
    } catch (error) {
      console.error('페이지 변경 오류:', error);
      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: false,
          error: `페이지 변경 중 오류가 발생했습니다: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`,
        },
      }));
    }
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = async (dashboardId: number, pageSize: number) => {
    const state = dashboardStates[dashboardId];

    if (!state.originalSql) {
      console.log('원본 SQL이 없습니다. 기존 방식으로 검색합니다.');
      await search(dashboardId, state.query, 1, pageSize);
      return;
    }

    console.log('페이지 크기 변경:', pageSize, '원본 SQL:', state.originalSql);

    // 로딩 상태 설정
    setDashboardStates((prev) => ({
      ...prev,
      [dashboardId]: {
        ...prev[dashboardId],
        loading: true,
        error: undefined,
      },
    }));

    try {
      // SQL 업데이트 (첫 페이지로 이동)
      const updatedSql = updateSqlForPage(state.originalSql, 1, pageSize);
      console.log('업데이트된 SQL (페이지 크기 변경):', updatedSql);

      // 업데이트된 SQL 실행
      const response = await executeSqlDirect(updatedSql, 1, pageSize);
      console.log('SQL 실행 결과 (페이지 크기 변경):', response);

      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: false,
          result: response.success ? response.data || [] : [],
          pagination: response.pagination,
          executedSql: response.executedSql,
          error: response.error ? response.message : undefined,
        },
      }));
    } catch (error) {
      console.error('페이지 크기 변경 오류:', error);
      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: false,
          error: `페이지 크기 변경 중 오류가 발생했습니다: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`,
        },
      }));
    }
  };

  const search = async (
    dashboardId: number,
    query?: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    const currentQuery = query || dashboardStates[dashboardId]?.query || '';
    if (!currentQuery.trim()) return;

    // 로딩 상태 설정
    setDashboardStates((prev) => ({
      ...prev,
      [dashboardId]: {
        ...prev[dashboardId],
        loading: true,
        error: undefined,
        suggestion: undefined,
        executedSql: undefined,
        llmMessage: undefined, // LLM 메시지 초기화
      },
    }));

    try {
      const response = await searchDashboard(currentQuery, page, pageSize);
      console.log('Search response:', response);

      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: false,
          result: response.success ? response.data || [] : [],
          error: response.error ? response.message : undefined,
          suggestion: response.suggestion,
          executedSql: response.executedSql,
          llmMessage: response.llmMessage, // LLM 메시지 저장
          pagination: response.pagination, // 페이지네이션 정보 저장
          originalSql: response.executedSql, // LLM이 생성한 SQL 저장
        },
      }));
    } catch (error) {
      console.error('Search error:', error);
      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: {
          ...prev[dashboardId],
          loading: false,
          error: `검색 중 오류가 발생했습니다: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`,
        },
      }));
    }
  };

  // 모든 Dashboard의 결과 초기화
  const clearAllResults = () => {
    setDashboardStates((prev) => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach((id) => {
        newStates[Number(id)] = {
          ...newStates[Number(id)],
          result: [],
          error: undefined,
          suggestion: undefined,
          pagination: undefined,
        };
      });
      return newStates;
    });
  };

  const handleUploadResult = (result: UploadResponse) => {
    console.log('Upload result:', result);

    if (result.success) {
      console.log(`성공적으로 ${result.inserted}개 행이 삽입되었습니다.`);
    } else {
      console.error('업로드 실패:', result.error);
    }
  };

  const handleResetSuccess = () => {
    clearAllResults(); // 모든 Dashboard의 검색 결과 초기화
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 bg-background gap-6">
      <div className="flex gap-4 mb-4 self-start ml-8">
        <Button onClick={addDashboard}>+ 화면 분할</Button>
        <UploadModal onUpload={handleUploadResult} />
        <ResetButton onResetSuccess={handleResetSuccess} />
      </div>
      <div className="flex flex-wrap justify-center items-start gap-8 w-full px-8">
        {dashboards.map((dashboardId) => (
          <Dashboard
            key={dashboardId}
            dashboardId={dashboardId}
            state={dashboardStates[dashboardId]}
            setQuery={(query) => setQuery(dashboardId, query)}
            search={(query, page, pageSize) => search(dashboardId, query, page, pageSize)}
            onDelete={() => deleteDashboard(dashboardId)}
            onPageChange={(page) => handlePageChange(dashboardId, page)}
            onPageSizeChange={(pageSize) => handlePageSizeChange(dashboardId, pageSize)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
