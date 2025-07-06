import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { type UploadResponse } from '@shared/types';

interface UploadModalProps {
  onUpload?: (result: UploadResponse) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onUpload }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    // 실제 구현에서는 xlsx 등으로 파싱 필요. 여기선 예시로 columns/rows 하드코딩
    const uploadData = {
      columns: ['name', 'age'],
      rows: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
    };

    try {
      // @ts-expect-error: Electron preload에서 window.api로 노출했다고 가정
      const res: UploadResponse = await window.electron.invoke('excel:upload-to-db', uploadData);
      const resultText = JSON.stringify(res, null, 2);
      setResult(resultText);
      onUpload?.(res);

      // 성공 시 모달 닫기
      if (res.success) {
        setTimeout(() => setOpen(false), 2000);
      }
    } catch (err) {
      const errorText = '오류: ' + (err instanceof Error ? err.message : String(err));
      setResult(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 모달이 닫힐 때 상태 초기화
      setFile(null);
      setResult('');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">업로드</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>엑셀 파일 업로드</DialogTitle>
          <DialogDescription>엑셀 파일을 선택하고 데이터베이스에 업로드하세요</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
            {loading ? '업로드 중...' : '업로드'}
          </Button>
          {result && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">결과:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32 break-words whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { UploadModal };
