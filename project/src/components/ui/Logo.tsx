import { Sparkles, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  wordmarkClassName?: string;
  showBadge?: boolean;
}

export function Logo({ className, wordmarkClassName, showBadge = false }: LogoProps) {
  return (
    <div className={cn('group inline-flex items-center gap-3', className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 via-emerald-400 to-cyan-400 p-[1px] shadow-[0_10px_28px_-8px_rgba(52,211,153,0.75)] transition-transform duration-300 group-hover:scale-105">
        <span className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-950/90">
          <Wallet className="h-5 w-5 text-lime-300 transition-transform duration-300 group-hover:-rotate-6" strokeWidth={2.2} />
        </span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-lime-300" />
      </span>
      <div className={cn('flex items-center gap-2', wordmarkClassName)}>
        <span className="font-display text-lg font-bold tracking-tight text-fg">
          Spend<span className="text-gradient">Sense</span>
        </span>
        {showBadge && (
          <span className="hidden items-center gap-1 rounded-full border border-lime-400/25 bg-lime-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-lime-300 sm:inline-flex">
            <Sparkles className="h-2.5 w-2.5" />
            2.4
          </span>
        )}
      </div>
    </div>
  );
}
