import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface Toast {

  id: string;

  type: ToastType;

  message: string;

  description?: string;

  duration?: number;

  action?: {
    label: string;
    onClick: () => void;
  };

  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  loading: (message: string, description?: string) => void;
}

let toastCounter = 0;

function generateId(): string {
  toastCounter++;
  return `toast-${Date.now()}-${toastCounter}`;
}

const MAX_TOASTS = 6;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
    };

    set((s) => {
      const updated = [...s.toasts, newToast];

      if (updated.length > MAX_TOASTS) {
        return { toasts: updated.slice(-MAX_TOASTS) };
      }
      return { toasts: updated };
    });

    if (toast.duration !== 0) {
      const duration = toast.duration ?? 5000;
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),

  success: (message, description) => {
    get().addToast({ type: 'success', message, description });
  },
  error: (message, description) => {
    get().addToast({ type: 'error', message, description, duration: 7000 });
  },
  warning: (message, description) => {
    get().addToast({ type: 'warning', message, description });
  },
  info: (message, description) => {
    get().addToast({ type: 'info', message, description });
  },
  loading: (message, description) => {
    return get().addToast({
      type: 'loading',
      message,
      description,
      duration: 0,
    });
  },
}));

export default useToastStore;
