/**
 * CyberHex v3.0 — Toast Notification Store
 *
 * Manages a queue of toast notifications with support for
 * different types, durations, and optional actions.
 */

import { create } from 'zustand';

// ──── Types ──────────────────────────────────────────────────────
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface Toast {
  /** Unique identifier for rendering keys and dismissal */
  id: string;
  /** Visual variant */
  type: ToastType;
  /** Main message text */
  message: string;
  /** Optional subtitle / detail */
  description?: string;
  /** Auto-dismiss duration in ms (0 = persistent) */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Timestamp for ordering */
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

// ──── Helpers ────────────────────────────────────────────────────
let toastCounter = 0;

function generateId(): string {
  toastCounter++;
  return `toast-${Date.now()}-${toastCounter}`;
}

const MAX_TOASTS = 6;

// ──── Store ──────────────────────────────────────────────────────
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
      // Remove oldest if exceeding max
      if (updated.length > MAX_TOASTS) {
        return { toasts: updated.slice(-MAX_TOASTS) };
      }
      return { toasts: updated };
    });

    // Auto-dismiss
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

  // Convenience methods
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
      duration: 0, // Persistent until manually dismissed
    });
  },
}));

export default useToastStore;