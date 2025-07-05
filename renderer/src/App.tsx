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
import { type User } from '@shared/types';

const users: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alice Kim' },
];

function Dashboard() {
  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>사용자 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input placeholder="이름으로 검색" className="flex-1" />
            <Button>검색</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                </TableRow>
              ))}
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
