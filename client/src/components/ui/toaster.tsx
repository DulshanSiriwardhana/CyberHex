/**
 * CyberHex v3.0 — Toast Bridge (Backward Compatible)
 *
 * Wraps the new Zustand-based toast store in the existing
 * React Context API so existing code using `useToast()` and
 * `<ToastProvider>` continues to work without changes.
 * New code should use `useToastStore` directly from @/stores/toast.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useToastStore, type ToastType } from '@/stores/toast';

// ──── Legacy API (unchanged) ─────────────────────────────────────
interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

/**
 * @deprecated Use `useToastStore()` from @/stores/toast for new code.
 * This hook exists for backward compatibility with existing components.
 */
export function useToast() {
  return useContext(ToastContext);
}

// ──── Provider (bridges old Context to new Zustand store) ────────
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