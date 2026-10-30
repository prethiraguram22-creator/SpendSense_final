import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast, type ToastTone } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; iconClass: string; bar: string; badgeBg: string }> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-lime-300',
    bar: 'bg-gradient-to-b from-lime-300 to-emerald-400',
    badgeBg: 'bg-lime-400/15 border-lime-400/30',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-300',
    bar: 'bg-gradient-to-b from-amber-300 to-amber-500',
    badgeBg: 'bg-amber-400/15 border-amber-400/30',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rose-400',
    bar: 'bg-gradient-to-b from-rose-400 to-rose-600',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
  },
  info: {
    icon: Info,
    iconClass: 'text-cyan-300',
    bar: 'bg-gradient-to-b from-cyan-300 to-sky-500',
    badgeBg: 'bg-cyan-400/15 border-cyan-400/30',
  },
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:left-auto md:right-6 md:w-96"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone];
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass pointer-events-auto relative w-full overflow-hidden rounded-2xl p-4 pl-5"
              role="status"
            >
              <span className={cn('absolute inset-y-0 left-0 w-1.5', style.bar)} />
              <div className="flex items-start gap-3.5">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', style.badgeBg)}>
                  <Icon className={cn('h-4 w-4', style.iconClass)} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-fg">{toast.title}</p>
                  {toast.message && <p className="mt-0.5 text-xs leading-relaxed text-muted">{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded-lg p-1.5 text-muted transition hover:bg-line/10 hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4.4, ease: 'linear' }}
                className={cn('absolute bottom-0 left-0 right-0 h-0.5 origin-left opacity-60', style.bar)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
