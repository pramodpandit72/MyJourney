import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur)
  };

  const styles = {
    success: 'bg-[#F0FDF4] dark:bg-[#143323] border-[#15803D]/30 dark:border-[#4ADE80]/40 text-[#14532D] dark:text-[#F0FDF4]',
    error: 'bg-[#FEE2E2] dark:bg-[#3B1517] border-[#B91C1C]/30 dark:border-[#F87171]/40 text-[#991B1B] dark:text-[#FEE2E2]',
    warning: 'bg-[#FEF3C7] dark:bg-[#3B290E] border-[#B45309]/30 dark:border-[#FBBF24]/40 text-[#92400E] dark:text-[#FEF3C7]',
    info: 'bg-[#E0F2FE] dark:bg-[#0E2F44] border-[#0369A1]/30 dark:border-[#38BDF8]/40 text-[#075985] dark:text-[#E0F2FE]'
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#0369A1] dark:text-[#38BDF8] shrink-0" />
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none print:hidden"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-lg border shadow-md text-xs font-medium transition-all duration-150 ${styles[t.type] || styles.info}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{icons[t.type] || icons.info}</div>
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
              className="opacity-70 hover:opacity-100 shrink-0 p-0.5 rounded"
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
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {}
      }
    };
  }
  return ctx;
};

