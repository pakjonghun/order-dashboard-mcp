import * as React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { type ResetResponse } from '@shared/types';
import { IPC_CHANNELS } from '@shared/constants';

declare global {
  interface Window {
    ipcRenderer?: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    };
  }
}

interface ResetButtonProps {
  onResetSuccess?: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onResetSuccess }) => {
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetResult, setResetResult] = React.useState<string>('');
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  const handleReset = async () => {
    setResetLoading(true);
    setResetResult('');
    try {
      const ipcRenderer = window.ipcRenderer;
      if (!ipcRenderer) throw new Error('ipcRenderer not found');
      const res = (await ipcRenderer.invoke(IPC_CHANNELS.RESET_ALL_DATA, {})) as ResetResponse;
      if (res.success) {
        setResetResult('DB 초기화 성공!');
        onResetSuccess?.(); // 성공 시 콜백 호출
      } else {
        setResetResult('DB 초기화 실패: ' + res.error);
      }
    } catch (err) {
      setResetResult('DB 초기화 오류: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    setShowResetDialog(false);
    await handleReset();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        type="button"
        onClick={() => setShowResetDialog(true)}
        disabled={resetLoading}
      >
        {resetLoading ? '초기화 중...' : '초기화'}
      </Button>
      {resetResult && <span className="text-sm text-muted-foreground">{resetResult}</span>}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 모든 데이터를 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구히 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              아니오
            </Button>
            <Button variant="destructive" onClick={handleResetConfirm} disabled={resetLoading}>
              예
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ResetButton };
