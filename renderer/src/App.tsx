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
import { type UploadResponse, type OrderRow, type SearchResponse } from '@shared/types';
import { IPC_CHANNELS, DB_COLUMNS } from '@shared/constants';
import { UploadModal } from './components/button/upload-modal';
import { ResetButton } from './components/button/reset-button';
import { X, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dashboard별 상태 타입
interface DashboardState {
  query: string;
  result: (OrderRow | Record<string, unknown>)[];
  loading: boolean;
  error?: string;
  suggestion?: string;
  executedSql?: string;
  llmMessage?: string; // LLM의 전체 응답 메시지 추가
}

// Dashboard 컴포넌트에 props 추가
interface DashboardProps {
  dashboardId: number;
  state: DashboardState;
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  onDelete: () => void;
}

function Dashboard({ dashboardId, state, setQuery, search, onDelete }: DashboardProps) {
  const { query, result, loading, error, suggestion, executedSql, llmMessage } = state;

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
              await search();
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
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard별 검색 함수 분리
async function searchDashboard(query: string): Promise<SearchResponse> {
  const ipcRenderer = window.ipcRenderer;
  if (!ipcRenderer) throw new Error('ipcRenderer not found');
  // MCP 서버 IPC 채널로 자연어 질의
  return (await ipcRenderer.invoke(IPC_CHANNELS.MCP_GENERATE_SQL, query)) as SearchResponse;
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

  const search = async (dashboardId: number, query?: string) => {
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
      const response = await searchDashboard(currentQuery);
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
            search={(query) => search(dashboardId, query)}
            onDelete={() => deleteDashboard(dashboardId)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
