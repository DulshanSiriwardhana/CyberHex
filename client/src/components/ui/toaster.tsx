import { createContext, useContext, type ReactNode } from 'react';
import { useToastStore, type ToastType } from '@/stores/toast';

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const storeToast = useToastStore((s) => s.addToast);

  const toast = (type: ToastType, title: string, message?: string) => {
    storeToast({ type, message: title, description: message });
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
}
