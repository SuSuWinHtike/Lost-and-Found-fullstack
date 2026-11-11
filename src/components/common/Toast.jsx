import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let bg = 'bg-white border-amber-200 text-stone-800 shadow-xl';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-300 text-rose-900 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-300 text-amber-900 shadow-xl';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-orange-50 border-orange-200 text-orange-950 shadow-xl';
          icon = <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />;
        } else {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xl';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 animate-slide-in ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
