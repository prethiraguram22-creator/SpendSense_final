import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatMoney, formatPercent } from '@/lib/format';
import type { CategoryShare } from '@/lib/finance';
import type { CurrencyCode } from '@/types/finance';
import { cn } from '@/lib/utils';

interface CategoryDonutProps {
  data: CategoryShare[];
  total: number;
  currency: CurrencyCode;
}

export function CategoryDonut({ data, total, currency }: CategoryDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-6 rounded-full blur-2xl transition-colors duration-500"
          style={{ backgroundColor: active ? `${active.color}22` : 'rgba(52, 211, 153, 0.08)' }}
        />
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={70}
              outerRadius={98}
              paddingAngle={3.5}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={950}
              onMouseEnter={(_, index: number) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.28}
                  className="cursor-pointer transition-opacity duration-300 outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {active ? active.label : 'Total Outflow'}
          </p>
          <p className="mt-1 font-display text-xl font-bold tabular-nums">
            {formatMoney(active ? active.value : total, currency, 0)}
          </p>
          <span
            className="mt-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium"
            style={{
              backgroundColor: active ? `${active.color}20` : 'rgba(148,163,184,0.12)',
              color: active ? active.color : undefined,
            }}
          >
            {active ? `${formatPercent(active.share * 100)} share` : `${data.length} categories`}
          </span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2">
        {data.map((entry, index) => {
          const isHovered = activeIndex === index;
          return (
            <li
              key={entry.categoryId}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all duration-200',
                isHovered
                  ? 'border-line/20 bg-raised/90 translate-x-1'
                  : 'border-transparent bg-raised/35 hover:bg-raised/65',
              )}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-surface"
                style={{ background: entry.color, boxShadow: `0 0 10px ${entry.color}80` }}
              />
              <span className="flex-1 truncate font-medium text-fg/90">{entry.label}</span>
              <span className="font-mono text-xs text-muted tabular-nums">
                {formatMoney(entry.value, currency, 0)}
              </span>
              <span className="w-11 text-right font-mono text-xs font-semibold tabular-nums text-fg">
                {formatPercent(entry.share * 100)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
