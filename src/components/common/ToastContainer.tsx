import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'danger':
              return <AlertCircle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100';
            case 'danger':
              return 'border-red-500/50 bg-red-950/95 text-red-100 shadow-red-900/40';
            case 'warning':
              return 'border-amber-500/40 bg-amber-950/90 text-amber-100';
            default:
              return 'border-cyan-500/40 bg-slate-900/95 text-slate-100';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${getBorderColor()}`}
          >
            <div className="flex items-center gap-3">
              {getIcon()}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
