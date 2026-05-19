/**
 * CyberHex v3.0 — Toast Notification Component
 *
 * Premium animated toast notifications that render from the global
 * toast store. Supports info, success, warning, error, and loading
 * variants with auto-dismiss, manual close, and action buttons.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '@/stores/toast';

// ──── Per-type configuration ─────────────────────────────────────
const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle2;
  bg: string;
  border: string;
  glow: string;
  iconColor: string;
  progressColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/20',
    glow: '0 0 20px rgba(16, 185, 129, 0.1)',
    iconColor: 'text-emerald-400',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-950/80',
    border: 'border-red-500/20',
    glow: '0 0 20px rgba(239, 68, 68, 0.1)',
    iconColor: 'text-red-400',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/20',
    glow: '0 0 20px rgba(245, 158, 11, 0.1)',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-950/80',
    border: 'border-sky-500/20',
    glow: '0 0 20px rgba(56, 189, 248, 0.1)',
    iconColor: 'text-sky-400',
    progressColor: 'bg-sky-500',
  },
  loading: {
    icon: Loader2,
    bg: 'bg-violet-950/80',
    border: 'border-violet-500/20',
    glow: '0 0 20px rgba(139, 92, 246, 0.1)',
    iconColor: 'text-violet-400',
    progressColor: 'bg-violet-500',
  },
};

// ──── Individual Toast ───────────────────────────────────────────
function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 35,
        mass: 0.8,
      }}
      className={`
        relative overflow-hidden flex items-start gap-3 w-full max-w-sm px-4 py-3.5
        rounded-xl border backdrop-blur-2xl
        ${config.bg} ${config.border}
      `}
      style={{ boxShadow: config.glow }}
    >
      {/* Progress bar for auto-dismiss */}
      {toast.duration !== 0 && toast.duration !== undefined && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: (toast.duration ?? 5000) / 1000,
            ease: 'linear',
          }}
          className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${config.progressColor}`}
        />
      )}

      {/* Loading spinner */}
      {toast.type === 'loading' && (
        <div className="shrink-0 mt-0.5">
          <Icon
            className={`w-4.5 h-4.5 ${config.iconColor} animate-spin`}
            strokeWidth={2.5}
          />
        </div>
      )}

      {/* Icon */}
      {toast.type !== 'loading' && (
        <div className="shrink-0 mt-0.5">
          <Icon className={`w-4.5 h-4.5 ${config.iconColor}`} strokeWidth={2.5} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/90 leading-tight">
          {toast.message}
        </p>
        {toast.description && (
          <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              removeToast(toast.id);
            }}
            className="mt-2 text-[11px] font-medium text-green-400 hover:text-green-300 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-lg p-1 text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ──── Toast Container ────────────────────────────────────────────
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="fixed top-4 right-4 z-[1700] flex flex-col-reverse gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;