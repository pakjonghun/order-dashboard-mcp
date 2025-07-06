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
import { type UploadResponse, type UploadRequest, type ParsedExcelData } from '@shared/types';
import { IPC_CHANNELS } from '@shared/constants';
import * as XLSX from 'xlsx';

interface UploadModalProps {
  onUpload?: (result: UploadResponse) => void;
}

declare global {
  interface Window {
    ipcRenderer?: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    };
  }
}

const UploadModal: React.FC<UploadModalProps> = ({ onUpload }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<ParsedExcelData | null>(null);

  const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let workbook;
          if (file.name.endsWith('.csv')) {
            // CSV는 텍스트로 읽어서 처리
            const csvText = e.target?.result as string;
            workbook = XLSX.read(csvText, {
              type: 'string',
              codepage: 65001,
            });
          } else {
            // XLSX 등은 바이너리로 처리
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            workbook = XLSX.read(data, {
              type: 'array',
              cellText: true,
              cellDates: true,
              cellNF: false,
              cellStyles: false,
              raw: false,
              codepage: 65001,
            });
          }
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: '',
          }) as Record<string, unknown>[];
          if (jsonData.length === 0) {
            throw new Error('엑셀 파일에 데이터가 없습니다.');
          }
          const columns = Object.keys(jsonData[0]);
          const rows = jsonData;
          resolve({ columns, rows });
        } catch (error) {
          reject(error);
        }
      };
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'utf-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult('');
      setParsedData(null);
      try {
        const data = await parseExcelFile(selectedFile);
        setParsedData(data);
        setResult(`파일 파싱 완료: ${data.columns.length}개 컬럼, ${data.rows.length}개 행`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        setResult(`파싱 오류: ${errorMessage}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !parsedData) return;
    setLoading(true);
    try {
      const uploadData: UploadRequest = {
        columns: parsedData.columns,
        rows: parsedData.rows,
      };

      // 디버깅: 전송 전 데이터 확인
      console.log('[Renderer] 전송할 데이터 샘플:', {
        columns: uploadData.columns,
        sampleRow: uploadData.rows[0],
        sampleName: uploadData.rows[0]?.name,
        sampleNameType: typeof uploadData.rows[0]?.name,
      });

      const ipcRenderer = window.ipcRenderer;
      if (!ipcRenderer) throw new Error('ipcRenderer not found');
      const res = (await ipcRenderer.invoke(
        IPC_CHANNELS.UPLOAD_EXCEL_DATA,
        uploadData
      )) as UploadResponse;
      setResult(JSON.stringify(res, null, 2));
      onUpload?.(res);
      if (res.success) setTimeout(() => setOpen(false), 2000);
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
      setFile(null);
      setResult('');
      setLoading(false);
      setParsedData(null);
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
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                선택된 파일: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
          <Button
            onClick={handleUpload}
            disabled={!file || !parsedData || loading}
            className="w-full"
          >
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
