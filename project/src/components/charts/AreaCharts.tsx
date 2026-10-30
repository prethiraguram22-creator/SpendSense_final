import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { formatCompactMoney, formatMoney } from '@/lib/format';
import type { CurrencyCode } from '@/types/finance';

interface CashFlowPoint {
  label: string;
  income: number;
  expenses: number;
}

const AXIS_TICK = { fill: '#8e9eb6', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' };

export function CashFlowChart({ data, currency }: { data: CashFlowPoint[]; currency: CurrencyCode }) {
  return (
    <ResponsiveContainer width="100%" height={310}>
      <AreaChart data={data} margin={{ top: 14, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cashflow-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bef264" stopOpacity={0.42} />
            <stop offset="55%" stopColor="#34d399" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cashflow-expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity={0.34} />
            <stop offset="65%" stopColor="#fb7185" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          cursor={{ stroke: 'rgba(190, 242, 100, 0.35)', strokeWidth: 1, strokeDasharray: '4 4' }}
          content={<ChartTooltip formatValue={(value) => formatMoney(value, currency, 0)} />}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#bef264"
          strokeWidth={2.75}
          activeDot={{ r: 5, fill: '#bef264', stroke: '#05080f', strokeWidth: 2 }}
          fill="url(#cashflow-income)"
          animationDuration={1100}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#fb7185"
          strokeWidth={2.5}
          activeDot={{ r: 5, fill: '#fb7185', stroke: '#05080f', strokeWidth: 2 }}
          fill="url(#cashflow-expense)"
          animationDuration={1100}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BalanceSparkline({
  data,
  color = '#bef264',
}: {
  data: { key: string; balance: number }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={96}>
      <AreaChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
        <defs>
          <linearGradient id="balance-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip cursor={false} content={<ChartTooltip formatValue={(value) => formatCompactMoney(value)} />} />
        <Area
          type="monotone"
          dataKey="balance"
          name="Net Worth"
          stroke={color}
          strokeWidth={2.25}
          fill="url(#balance-spark)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
