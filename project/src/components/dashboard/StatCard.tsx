import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';

export type StatTone = 'teal' | 'lime' | 'emerald' | 'cyan' | 'rose' | 'amber' | 'sky';

const TONE_STYLES: Record<StatTone, { iconBox: string; glow: string; bar: string }> = {
  lime: {
    iconBox: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
    glow: 'from-lime-400/15',
    bar: 'from-lime-300 to-emerald-400',
  },
  emerald: {
    iconBox: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
    glow: 'from-emerald-400/15',
    bar: 'from-emerald-400 to-teal-300',
  },
  teal: {
    iconBox: 'bg-teal-400/15 text-teal-300 ring-teal-400/30',
    glow: 'from-teal-400/15',
    bar: 'from-teal-300 to-cyan-400',
  },
  cyan: {
    iconBox: 'bg-cyan-400/15 text-cyan-300 ring-cyan-400/30',
    glow: 'from-cyan-400/15',
    bar: 'from-cyan-300 to-sky-400',
  },
  rose: {
    iconBox: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    glow: 'from-rose-500/15',
    bar: 'from-rose-400 to-orange-400',
  },
  amber: {
    iconBox: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
    glow: 'from-amber-400/15',
    bar: 'from-amber-300 to-yellow-400',
  },
  sky: {
    iconBox: 'bg-sky-400/15 text-sky-300 ring-sky-400/30',
    glow: 'from-sky-400/15',
    bar: 'from-sky-300 to-cyan-400',
  },
};

interface StatCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
  trend?: { value: number; goodWhenUp: boolean; suffix?: string };
}

export function StatCard({ label, value, format, icon: Icon, tone = 'teal', hint, trend }: StatCardProps) {
  const trendIsGood = trend ? (trend.goodWhenUp ? trend.value >= 0 : trend.value <= 0) : false;
  const TrendIcon = trend && trend.value >= 0 ? ArrowUpRight : ArrowDownRight;
  const style = TONE_STYLES[tone];

  return (
    <div className="card card-interactive group relative flex flex-col justify-between overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70',
          style.glow,
        )}
      />
      <div className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105',
            style.iconBox,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="relative mt-4">
        <AnimatedNumber
          value={value}
          format={format}
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ring-1 ring-inset',
                trendIsGood
                  ? 'bg-emerald-400/12 text-emerald-300 ring-emerald-400/25'
                  : 'bg-rose-500/12 text-rose-300 ring-rose-500/25',
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(Math.round(trend.value))}
              {trend.suffix ?? '%'}
            </span>
          )}
          {hint && <span className="text-muted">{hint}</span>}
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn('mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r transition-all duration-300 group-hover:w-full', style.bar)}
      />
    </div>
  );
}
