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
import { useSearchStore } from './stores/searchStore';

function Dashboard() {
  const { query, setQuery, search, result, loading } = useSearchStore();

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>사용자 검색</CardTitle>
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
              placeholder="자연어로 검색"
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

function App() {
  const [dashboards, setDashboards] = useState([0]);

  const addDashboard = () => {
    setDashboards((prev) => [...prev, prev.length]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 bg-background gap-6">
      <Button onClick={addDashboard} className="mb-4 self-start ml-8">
        + 화면 분할
      </Button>
      <div className={`flex flex-1 w-full justify-center items-start gap-8`}>
        {dashboards.map((_, idx) => (
          <Dashboard key={idx} />
        ))}
      </div>
    </div>
  );
}

export default App;
