import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ProgressTone = 'teal' | 'emerald' | 'lime' | 'cyan' | 'amber' | 'rose' | 'sky';

const TONE_CLASS: Record<ProgressTone, string> = {
  lime: 'bg-gradient-to-r from-emerald-400 via-lime-300 to-lime-200 shadow-[0_0_16px_rgba(190,242,100,0.45)]',
  emerald: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-300 shadow-[0_0_14px_rgba(52,211,153,0.4)]',
  teal: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(45,212,191,0.35)]',
  cyan: 'bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 shadow-[0_0_14px_rgba(34,211,238,0.35)]',
  amber: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_14px_rgba(251,191,36,0.35)]',
  rose: 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400 shadow-[0_0_14px_rgba(244,63,94,0.4)]',
  sky: 'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
};

interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
  label?: string;
  marker?: number;
}

export function ProgressBar({ value, tone = 'teal', className, label, marker }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-line/12 p-[1px]', className)}
    >
      {marker !== undefined && marker > 0 && marker < 100 && (
        <span
          aria-hidden="true"
          style={{ left: `${marker}%` }}
          className=" absolute inset-y-0 z-10 w-0.5 bg-fg/40"
          title={`Threshold: ${marker}%`}
        />
      )}
      <motion.div
        className={cn('h-full rounded-full', TONE_CLASS[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
