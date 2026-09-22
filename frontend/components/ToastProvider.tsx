'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = useMemo(
    () => ({
      success: (message: string, title?: string) => showToast(message, 'success', title),
      error: (message: string, title?: string) => showToast(message, 'error', title),
      info: (message: string, title?: string) => showToast(message, 'info', title),
      warning: (message: string, title?: string) => showToast(message, 'warning', title),
    }),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
      toast: toastHelpers,
    }),
    [toasts, showToast, removeToast, toastHelpers]
  );

  const getIcon = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100';
      case 'error':
        return 'border-rose-500/30 bg-rose-950/40 text-rose-100';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/40 text-amber-100';
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-950/40 text-blue-100';
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${getBorderColor(
                item.type
              )}`}
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <h4 className="text-sm font-semibold tracking-tight text-white mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed break-words">
                  {item.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-white transition-colors p-0.5 -mr-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
