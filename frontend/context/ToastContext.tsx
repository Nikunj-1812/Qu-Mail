'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Intercept window.alert globally and redirect to custom Toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (msg?: any) => {
        showToast(String(msg || ''), 'info');
      };
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          let bg = '#ffffff';
          let border = '#e2e8f0';
          let iconColor = '#0284c7';
          let IconComp = Info;

          if (toast.type === 'success') {
            bg = '#f0fdf4';
            border = '#bbf7d0';
            iconColor = '#16a34a';
            IconComp = CheckCircle2;
          } else if (toast.type === 'error') {
            bg = '#fff1f2';
            border = '#fecdd3';
            iconColor = '#e11d48';
            IconComp = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem',
                boxShadow: 'var(--shadow-modal)',
                pointerEvents: 'auto',
                animation: 'slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <IconComp size={18} color={iconColor} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {toast.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
