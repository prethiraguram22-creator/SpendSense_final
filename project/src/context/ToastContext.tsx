import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createId } from '@/lib/utils';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface ToastInput {
  tone: ToastTone;
  title: string;
  message?: string;
}

export interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  notify: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

const TOAST_LIFETIME_MS = 4500;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (input: ToastInput) => {
      const id = createId();
      setToasts((current) => [...current.slice(-3), { ...input, id }]);
      window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
