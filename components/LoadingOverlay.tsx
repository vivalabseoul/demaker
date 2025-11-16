import { Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export function LoadingOverlay({ 
  visible = true,
  message = '처리 중...', 
  progress = 0,
  showProgress = false 
}: LoadingOverlayProps) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 animate-spin mb-4" style={{ color: '#10b981' }} />
          <p className="text-xl mb-4 text-center" style={{ color: '#10b981' }}>
            {message}
          </p>
          
          {showProgress && (
            <div className="w-full">
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-sm text-center" style={{ color: '#71717B' }}>
                100%
              </p>
            </div>
          )}
          
          {!showProgress && (
            <p className="text-sm text-center" style={{ color: '#666666' }}>
              잠시만 기다려주세요...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}