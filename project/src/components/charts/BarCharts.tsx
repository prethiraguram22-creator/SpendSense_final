import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { formatCompactMoney, formatMoney } from '@/lib/format';
import type { CurrencyCode } from '@/types/finance';

const AXIS_TICK = { fill: '#8e9eb6', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' };

interface SeriesItem {
  id: string;
  label: string;
  color: string;
}

export function CategoryTrendChart({
  rows,
  series,
  currency,
}: {
  rows: Record<string, string | number>[];
  series: SeriesItem[];
  currency: CurrencyCode;
}) {
  return (
    <div className="space-y-5">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barCategoryGap="26%">
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.1)" strokeDasharray="4 6" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={8} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            width={60}
            tickFormatter={(value: number) => formatCompactMoney(value, currency)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.06)' }}
            content={<ChartTooltip formatValue={(value) => formatMoney(value, currency, 0)} />}
          />
          {series.map((item, index) => (
            <Bar
              key={item.id}
              dataKey={item.id}
              name={item.label}
              stackId="spend"
              fill={item.color}
              radius={index === series.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              animationDuration={950}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-3 pt-1 text-xs">
        {series.map((item) => (
          <li
            key={item.id}
            className="inline-flex items-center gap-2 rounded-full border border-line/12 bg-raised/50 px-3 py-1 text-muted"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: item.color, boxShadow: `0 0 8px ${item.color}88` }}
            />
            <span className="font-medium text-fg/90">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WeekdayChart({
  data,
  currency,
}: {
  data: { label: string; value: number }[];
  currency: CurrencyCode;
}) {
  const peak = Math.max(...data.map((item) => item.value), 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
        <defs>
          <linearGradient id="weekday-peak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bef264" stopOpacity={1} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="weekday-normal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.1)" strokeDasharray="4 6" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={8} />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'rgba(148,163,184,0.06)' }}
          content={<ChartTooltip formatValue={(value) => formatMoney(value, currency, 0)} />}
        />
        <Bar dataKey="value" name="Outflow" radius={[10, 10, 10, 10]} animationDuration={950}>
          {data.map((item) => (
            <Cell
              key={item.label}
              fill={item.value === peak && peak > 0 ? 'url(#weekday-peak)' : 'url(#weekday-normal)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
