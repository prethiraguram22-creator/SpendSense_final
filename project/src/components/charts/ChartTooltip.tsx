interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatValue }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass min-w-48 rounded-2xl border border-emerald-400/25 px-4 py-3 text-sm shadow-2xl">
      {label !== undefined && (
        <p className="mb-2 border-b border-line/10 pb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-xs font-medium text-fg/85">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
              />
              {entry.name}
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-fg">
              {formatValue(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
