import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none font-mono">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const borderColor = isSuccess
          ? 'border-emerald-500/50 bg-[#071714]/90 text-emerald-200'
          : isWarning
          ? 'border-amber-500/50 bg-[#1a1408]/90 text-amber-200'
          : isError
          ? 'border-red-500/50 bg-[#1a0c0c]/90 text-red-200'
          : 'border-sky-500/50 bg-[#0a1622]/90 text-sky-200';

        const iconColor = isSuccess
          ? 'text-emerald-400'
          : isWarning
          ? 'text-amber-400'
          : isError
          ? 'text-red-400'
          : 'text-sky-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${borderColor}`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className={`w-4 h-4 ${iconColor}`} />}
              {isWarning && <AlertTriangle className={`w-4 h-4 ${iconColor}`} />}
              {isError && <AlertCircle className={`w-4 h-4 ${iconColor}`} />}
              {!isSuccess && !isWarning && !isError && <Info className={`w-4 h-4 ${iconColor}`} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                  {toast.title}
                </h4>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/40 hover:text-white transition p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5 leading-snug break-words">
                {toast.message}
              </p>

              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-[10px] uppercase font-bold tracking-wider underline hover:text-white cursor-pointer"
                >
                  {toast.action.label} →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
