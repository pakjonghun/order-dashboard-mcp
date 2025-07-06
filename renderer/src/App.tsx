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
import { type UploadResponse, type SearchResponse } from '@shared/types';
import { IPC_CHANNELS } from '@shared/constants';
import { UploadModal } from './components/button/upload-modal';
import { ResetButton } from './components/button/reset-button';

// Dashboard별 상태 타입
interface DashboardState {
  query: string;
  result: SearchResponse[];
  loading: boolean;
}

// Dashboard 컴포넌트에 props 추가
interface DashboardProps {
  dashboardId: number;
  state: DashboardState;
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  // clearResult: () => void; // 사용하지 않으므로 제거
}

function Dashboard({ dashboardId, state, setQuery, search }: DashboardProps) {
  const { query, result, loading } = state;

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>사용자 검색 - Dashboard {dashboardId + 1}</CardTitle>
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>검색 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>나이</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(result) && result.length > 0 ? (
                (result as { name: string; age: number }[]).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.age}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    결과 없음
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard별 검색 함수 분리
async function searchDashboard(query: string): Promise<SearchResponse[]> {
  const ipcRenderer = window.ipcRenderer;
  if (!ipcRenderer) throw new Error('ipcRenderer not found');
  const req = { query };
  return (await ipcRenderer.invoke(IPC_CHANNELS.QUERY_FROM_NL, req)) as SearchResponse[];
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

  // Dashboard별 상태 업데이트 함수들
  const setQuery = (dashboardId: number, query: string) => {
    setDashboardStates((prev) => ({
      ...prev,
      [dashboardId]: { ...prev[dashboardId], query },
    }));
  };

  const search = async (dashboardId: number, query?: string) => {
    setDashboardStates((prev) => ({
      ...prev,
      [dashboardId]: { ...prev[dashboardId], loading: true },
    }));

    try {
      const currentState = dashboardStates[dashboardId];
      const q = query ?? currentState.query;
      const result = await searchDashboard(q);
      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: { ...prev[dashboardId], result, loading: false },
      }));
    } catch (error) {
      console.error('Search error:', error);
      setDashboardStates((prev) => ({
        ...prev,
        [dashboardId]: { ...prev[dashboardId], result: [], loading: false },
      }));
    }
  };

  // 모든 Dashboard의 결과 초기화
  const clearAllResults = () => {
    setDashboardStates((prev) => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach((id) => {
        newStates[Number(id)] = { ...newStates[Number(id)], result: [] };
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
      <div className={`flex flex-1 w-full justify-center items-start gap-8`}>
        {dashboards.map((dashboardId) => (
          <Dashboard
            key={dashboardId}
            dashboardId={dashboardId}
            state={dashboardStates[dashboardId]}
            setQuery={(query) => setQuery(dashboardId, query)}
            search={(query) => search(dashboardId, query)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
