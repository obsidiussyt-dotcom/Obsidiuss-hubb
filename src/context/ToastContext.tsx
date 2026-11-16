import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-5 right-4 sm:right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-modal-pop flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-900/10'
                : toast.type === 'error'
                ? 'bg-white/95 border-pink-300 text-slate-900 shadow-pink-900/10'
                : 'bg-white/95 border-orange-200 text-slate-900 shadow-slate-900/10'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-orange-500 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
