import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, badge, className }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_8px_#bef264]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {eyebrow}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </motion.header>
  );
}
