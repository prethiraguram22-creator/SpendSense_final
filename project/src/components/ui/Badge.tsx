import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'lime' | 'emerald' | 'teal' | 'cyan' | 'amber' | 'rose' | 'sky' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  lime: 'bg-lime-400/12 text-lime-300 ring-lime-400/30',
  emerald: 'bg-emerald-400/12 text-emerald-300 ring-emerald-400/30',
  teal: 'bg-teal-400/12 text-teal-300 ring-teal-400/28',
  cyan: 'bg-cyan-400/12 text-cyan-300 ring-cyan-400/30',
  amber: 'bg-amber-400/12 text-amber-300 ring-amber-400/30',
  rose: 'bg-rose-500/12 text-rose-300 ring-rose-500/30',
  sky: 'bg-sky-400/12 text-sky-300 ring-sky-400/30',
  neutral: 'bg-line/10 text-muted ring-line/18',
};

const DOT_TONES: Record<BadgeTone, string> = {
  lime: 'bg-lime-300',
  emerald: 'bg-emerald-400',
  teal: 'bg-teal-300',
  cyan: 'bg-cyan-300',
  amber: 'bg-amber-300',
  rose: 'bg-rose-400',
  sky: 'bg-sky-300',
  neutral: 'bg-muted',
};

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONES[tone])} />}
      {children}
    </span>
  );
}
