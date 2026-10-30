import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Flame,
  Layers,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CategoryTrendChart, WeekdayChart } from '@/components/charts/BarCharts';
import { CashFlowChart } from '@/components/charts/AreaCharts';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { getCategory } from '@/data/categories';
import { getRecentMonths } from '@/lib/dates';
import {
  getCashFlow,
  getCategoryBreakdown,
  getCategoryComparison,
  getCategoryTrend,
  getPriorMonthsAverage,
  getTopMerchants,
  getWeekdaySpending,
  summarizeMonth,
} from '@/lib/finance';
import { formatMoney, formatPercent, formatSignedPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function InsightsPage() {
  const { data } = useFinance();
  const loading = usePageLoading();
  const navigate = useNavigate();

  const recentMonths = useMemo(() => getRecentMonths(6), []);
  const [selectedKey, setSelectedKey] = useState(() => recentMonths[recentMonths.length - 1].key);

  const analytics = useMemo(() => {
    const selectedIndex = recentMonths.findIndex((m) => m.key === selectedKey);
    const prevKey =
      selectedIndex > 0
        ? recentMonths[selectedIndex - 1].key
        : getRecentMonths(7)[0].key;

    const currentSummary = summarizeMonth(data.transactions, selectedKey);
    const trailingAvg = getPriorMonthsAverage(data.transactions, 3);
    const cashFlow = getCashFlow(data.transactions, 6);
    const breakdown = getCategoryBreakdown(data.transactions, selectedKey);
    const comparison = getCategoryComparison(data.transactions, selectedKey, prevKey);
    const categoryTrend = getCategoryTrend(data.transactions, 6, 5);
    const weekday = getWeekdaySpending(data.transactions);
    const topMerchants = getTopMerchants(data.transactions, 6);
    const peakWeekday = [...weekday].sort((a, b) => b.value - a.value)[0];

    return {
      currentSummary,
      trailingAvg,
      cashFlow,
      breakdown,
      comparison,
      categoryTrend,
      weekday,
      peakWeekday,
      topMerchants,
    };
  }, [data.transactions, recentMonths, selectedKey]);

  if (loading) return <PageSkeleton variant="dashboard" />;

  const { currency, hideBalance } = data.settings;
  const money = (val: number, digits = 0) => (hideBalance ? '••••••' : formatMoney(val, currency, digits));

  if (data.transactions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Deep Telemetry"
          title="Insights & Analytics"
          description="Multi-month spending forensics, category velocity trends, weekday patterns, and merchant concentration."
        />
        <div className="card">
          <EmptyState
            icon={BarChart3}
            title="Not enough activity to analyze yet"
            description="Add transactions or load the 6-month sample dataset from Settings to unlock interactive charts and spending forensics."
            action={{ label: 'Go to transactions', onClick: () => navigate('/app/transactions') }}
          />
        </div>
      </div>
    );
  }

  const expenseDeltaVsAvg =
    analytics.trailingAvg.expenses > 0
      ? ((analytics.currentSummary.expenses - analytics.trailingAvg.expenses) / analytics.trailingAvg.expenses) * 100
      : 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Deep Telemetry"
        title="Insights & Analytics"
        description="Explore month-over-month category shifts, weekday spending rhythms, and top merchant concentration."
        actions={
          <div
            role="radiogroup"
            aria-label="Select month"
            className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-line/15 bg-surface/80 p-1"
          >
            {recentMonths.map((month) => {
              const active = month.key === selectedKey;
              return (
                <button
                  key={month.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedKey(month.key)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all',
                    active
                      ? 'bg-gradient-to-r from-lime-300 to-emerald-400 text-slate-950 shadow-sm'
                      : 'text-muted hover:text-fg',
                  )}
                >
                  {month.label}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Top Benchmark Strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-mono uppercase tracking-wider">Selected Month Net</span>
            <TrendingUp className="h-4 w-4 text-lime-300" />
          </div>
          <p
            className={cn(
              'mt-2.5 font-display text-2xl font-bold tabular-nums',
              analytics.currentSummary.net >= 0 ? 'text-lime-300' : 'text-rose-300',
            )}
          >
            {money(analytics.currentSummary.net)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            3M Avg Net: <span className="font-mono text-fg">{money(analytics.trailingAvg.net)}</span>
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-mono uppercase tracking-wider">Burn vs. 3M Avg</span>
            <TrendingDown className="h-4 w-4 text-cyan-300" />
          </div>
          <p className="mt-2.5 font-display text-2xl font-bold tabular-nums text-fg">
            {money(analytics.currentSummary.expenses)}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <span
              className={cn(
                'font-mono font-semibold',
                expenseDeltaVsAvg <= 0 ? 'text-emerald-300' : 'text-rose-300',
              )}
            >
              {formatSignedPercent(expenseDeltaVsAvg)}
            </span>
            <span>vs. {money(analytics.trailingAvg.expenses)} avg</span>
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-mono uppercase tracking-wider">3M Savings Velocity</span>
            <Layers className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-2.5 font-display text-2xl font-bold tabular-nums text-emerald-300">
            {hideBalance ? '••%' : formatPercent(analytics.trailingAvg.savingsRate, 1)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            Selected month: <span className="font-mono text-fg">{formatPercent(analytics.currentSummary.savingsRate)}</span>
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-mono uppercase tracking-wider">Peak Spend Day</span>
            <Flame className="h-4 w-4 text-amber-300" />
          </div>
          <p className="mt-2.5 font-display text-2xl font-bold text-amber-300">
            {analytics.peakWeekday?.label ?? '—'}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            Cumulative: <span className="font-mono text-fg">{money(analytics.peakWeekday?.value ?? 0)}</span>
          </p>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-12">
        <section className="card p-6 sm:p-7 xl:col-span-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-300">
                Multi-Month Composition
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Top 5 Category Spend Evolution</h2>
              <p className="text-xs text-muted">Stacked monthly outflow across your largest expense drivers</p>
            </div>
            <Badge tone="lime">6-Month Window</Badge>
          </div>
          <CategoryTrendChart
            rows={analytics.categoryTrend.rows}
            series={analytics.categoryTrend.series}
            currency={currency}
          />
        </section>

        <section className="card flex flex-col justify-between p-6 sm:p-7 xl:col-span-5">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  Behavioral Rhythm
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight">Day-of-Week Outflow</h2>
                <p className="text-xs text-muted">When your money leaves your account across the week</p>
              </div>
              <Calendar className="h-5 w-5 text-cyan-300" />
            </div>
            <WeekdayChart data={analytics.weekday} currency={currency} />
          </div>
          <div className="mt-4 rounded-xl border border-line/10 bg-raised/45 px-4 py-3 text-xs text-muted">
            Peak outflow occurs on <span className="font-semibold text-lime-300">{analytics.peakWeekday?.label}</span>.
            Scheduling no-spend days around weekends can lift your savings rate by 4–7%.
          </div>
        </section>

        {/* Cash Flow & Selected Month Donut */}
        <section className="card p-6 sm:p-7 xl:col-span-7">
          <div className="mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Liquidity Curve
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Six-Month Cash Flow Spread</h2>
            <p className="text-xs text-muted">The gap between the lime and rose curves represents your monthly wealth creation</p>
          </div>
          <CashFlowChart data={analytics.cashFlow} currency={currency} />
        </section>

        <section className="card p-6 sm:p-7 xl:col-span-5">
          <div className="mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              Selected Period Share
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Category Distribution ({selectedKey})</h2>
            <p className="text-xs text-muted">Hover any slice to inspect exact category share</p>
          </div>
          <CategoryDonut
            data={analytics.breakdown.slice(0, 6)}
            total={analytics.currentSummary.expenses}
            currency={currency}
          />
        </section>

        {/* Month-over-Month Category Comparison Table */}
        <section className="card p-6 sm:p-7 xl:col-span-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-300">
                Variance Forensics
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Month-over-Month Category Shift</h2>
              <p className="text-xs text-muted">Comparing {selectedKey} against the immediately preceding month</p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.comparison.slice(0, 7).map((item) => {
              const cat = getCategory(item.categoryId);
              const Icon = cat.icon;
              const increased = item.change > 0;
              const maxVal = Math.max(item.current, item.previous, 1);

              return (
                <div
                  key={item.categoryId}
                  className="rounded-2xl border border-line/10 bg-raised/35 p-4 transition hover:border-line/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-fg">{item.label}</p>
                        <p className="font-mono text-xs text-muted">
                          Prior: {money(item.previous)} → Current: {money(item.current)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold',
                        increased
                          ? 'bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/25'
                          : 'bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25',
                      )}
                    >
                      {increased ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {formatSignedPercent(item.change)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <ProgressBar
                      value={(item.current / maxVal) * 100}
                      tone={increased && item.change > 20 ? 'rose' : 'teal'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top Merchants Leaderboard */}
        <section className="card p-6 sm:p-7 xl:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Merchant Intelligence
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Top Counterparties</h2>
              <p className="text-xs text-muted">Highest cumulative spend merchants across your ledger</p>
            </div>
            <Store className="h-5 w-5 text-cyan-300" />
          </div>

          <ul className="space-y-3">
            {analytics.topMerchants.map((merchant, index) => {
              const cat = getCategory(merchant.categoryId);
              const Icon = cat.icon;
              return (
                <li
                  key={merchant.name}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line/10 bg-raised/40 p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line/15 bg-surface font-mono text-xs font-bold text-lime-300">
                      #{index + 1}
                    </span>
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{merchant.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {cat.label} • {merchant.count} {merchant.count === 1 ? 'visit' : 'visits'}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-fg">
                    {money(merchant.total)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
