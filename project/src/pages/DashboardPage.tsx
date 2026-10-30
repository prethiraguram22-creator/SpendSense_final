import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, buttonStyles } from '@/components/ui/Button';
import { useFinance } from '@/context/FinanceContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RingProgress } from '@/components/ui/RingProgress';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { BalanceSparkline, CashFlowChart } from '@/components/charts/AreaCharts';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { buildRecommendations } from '@/lib/recommendations';
import {
  getBalance,
  getBalanceTrend,
  getBudgetStatuses,
  getCashFlow,
  getCategoryBreakdown,
  summarizeMonth,
} from '@/lib/finance';
import { currentMonthKey, getRecentMonths } from '@/lib/dates';
import { formatMoney, formatPercent } from '@/lib/format';
import type { CurrencyCode, FinanceData } from '@/types/finance';
import { cn } from '@/lib/utils';

const HIDDEN = '\u2022\u2022\u2022\u2022\u2022\u2022';

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default function DashboardPage() {
  const { data, loadSampleData } = useFinance();
  const loading = usePageLoading();
  const [txModalOpen, setTxModalOpen] = useState(false);

  const model = useMemo(() => buildDashboardModel(data), [data]);

  if (loading) return <PageSkeleton variant="dashboard" />;

  const { currency, hidden, firstName } = model;
  const money = (value: number) => (hidden ? HIDDEN : formatMoney(value, currency));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Financial Command Center"
        title={`${greeting(new Date())}, ${firstName}`}
        description="Live telemetry across your net liquidity, monthly cash-flow velocity, and category guardrails."
        actions={
          <>
            <Button onClick={() => setTxModalOpen(true)} size="sm">
              <Plus className="h-4 w-4" />
              Log transaction
            </Button>
            <Link to="/app/insights" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      {/* Asymmetric Fintech Hero Bento */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-12"
      >
        {/* Primary Liquidity & Net Worth Card */}
        <div className="card-mesh relative flex flex-col justify-between p-6 sm:p-7 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
                <Wallet className="h-3.5 w-3.5" />
                Total Net Liquidity
              </span>
              <div className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                <AnimatedNumber value={model.balance} format={money} />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Opening reserve plus all verified ledger inflows &amp; outflows
              </p>
            </div>
            <Badge tone={model.current.net >= 0 ? 'lime' : 'rose'} dot className="font-mono">
              {hidden
                ? HIDDEN
                : `${model.current.net >= 0 ? '+' : ''}${formatMoney(model.current.net, currency, 0)} net`}
            </Badge>
          </div>

          <div className="mt-6 rounded-2xl border border-line/12 bg-canvas/45 px-4 pb-2 pt-3">
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-muted">
              <span>Cumulative Balance Trajectory</span>
              <span className="text-lime-300">{model.balanceTrendSeries.length}M Window</span>
            </div>
            <BalanceSparkline data={model.balanceTrendSeries} />
          </div>
        </div>

        {/* Monthly Inflow & Outflow Pair */}
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          <div className="card card-interactive flex items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Monthly Inflow
              </span>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-emerald-300 sm:text-3xl">
                <AnimatedNumber value={model.current.income} format={money} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
                    model.incomeTrend.value >= 0
                      ? 'bg-emerald-400/15 text-emerald-300'
                      : 'bg-rose-500/15 text-rose-300',
                  )}
                >
                  {model.incomeTrend.value >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(Math.round(model.incomeTrend.value))}%
                </span>
                <span className="text-muted">vs. prior month</span>
              </div>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/30">
              <TrendingUp className="h-6 w-6" />
            </span>
          </div>

          <div className="card card-interactive flex items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Monthly Outflow
              </span>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-fg sm:text-3xl">
                <AnimatedNumber value={model.current.expenses} format={money} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
                    model.expenseTrend.value <= 0
                      ? 'bg-emerald-400/15 text-emerald-300'
                      : 'bg-rose-500/15 text-rose-300',
                  )}
                >
                  {model.expenseTrend.value >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(Math.round(model.expenseTrend.value))}%
                </span>
                <span className="text-muted">vs. prior month</span>
              </div>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/30">
              <TrendingDown className="h-6 w-6" />
            </span>
          </div>
        </div>

        {/* Savings Velocity Gauge Card */}
        <div className="card card-interactive flex flex-col justify-between p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Savings Rate
            </span>
            <Badge tone={model.current.savingsRate >= 20 ? 'lime' : 'amber'}>
              {model.current.savingsRate >= 20 ? 'Above 20% Benchmark' : 'Target: 20%'}
            </Badge>
          </div>

          <div className="my-4 flex items-center gap-5">
            <RingProgress
              value={Math.max(0, Math.min(100, model.current.savingsRate))}
              size={92}
              stroke={8}
              color={model.current.savingsRate >= 20 ? '#bef264' : '#fbbf24'}
            >
              <span className="font-mono text-base font-bold text-fg">
                {hidden ? '••%' : formatPercent(model.current.savingsRate)}
              </span>
            </RingProgress>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-xs text-muted">Retained this month</p>
              <p className="font-mono text-lg font-bold tabular-nums text-lime-300">
                {hidden ? HIDDEN : formatMoney(Math.max(0, model.current.net), currency, 0)}
              </p>
              <Link
                to="/app/goals"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:underline"
              >
                Allocate to goals <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-line/10 bg-raised/50 px-3.5 py-2.5 text-xs text-muted">
            {model.goalsCount > 0
              ? `Tracking ${model.goalsCount} active savings ${model.goalsCount === 1 ? 'goal' : 'goals'}`
              : 'Create a savings goal to track monthly pacing'}
          </div>
        </div>
      </motion.div>

      {model.transactionCount === 0 ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="Your command center is ready for data"
            description="Record your first transaction or populate 6 months of realistic sample activity to unlock live cash-flow telemetry, category forensics, and AI-style recommendations."
            action={{ label: 'Add first transaction', onClick: () => setTxModalOpen(true) }}
            secondary={
              <Button variant="secondary" size="sm" onClick={loadSampleData}>
                <Sparkles className="h-4 w-4 text-lime-300" />
                Load 6-month sample data
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-12">
          {/* Cash Flow Chart */}
          <section className="card p-6 sm:p-7 xl:col-span-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Cash-Flow Telemetry
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight">Inflow vs. Outflow Trajectory</h2>
                <p className="text-xs text-muted">Six-month comparative performance</p>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-lime-300">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />
                  Income
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Expenses
                </span>
              </div>
            </div>
            <CashFlowChart data={model.cashFlow} currency={currency} />
          </section>

          {/* Spending Breakdown Donut */}
          <section className="card flex flex-col justify-between p-6 sm:p-7 xl:col-span-5">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    Allocation Matrix
                  </span>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">Spending Breakdown</h2>
                  <p className="text-xs text-muted">Top categories for the current month</p>
                </div>
                <Link to="/app/insights" className="text-xs font-semibold text-lime-300 hover:underline">
                  Deep dive
                </Link>
              </div>
              <CategoryDonut data={model.breakdown.slice(0, 6)} total={model.current.expenses} currency={currency} />
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="card p-6 sm:p-7 xl:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Live Feed
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight">Recent Transactions</h2>
              </div>
              <Link
                to="/app/transactions"
                className="inline-flex items-center gap-1 rounded-xl border border-line/15 bg-raised/60 px-3 py-1.5 text-xs font-semibold text-lime-300 transition hover:border-lime-400/35"
              >
                Full ledger ({model.transactionCount})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="-mx-2 space-y-1">
              {model.recent.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          </section>

          {/* Budget Guardrails & Alerts */}
          <section className="card flex flex-col justify-between p-6 sm:p-7 xl:col-span-5">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Category Guardrails
                  </span>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">Budget Velocity Radar</h2>
                </div>
                <Link
                  to="/app/budgets"
                  className="inline-flex items-center gap-1 rounded-xl border border-line/15 bg-raised/60 px-3 py-1.5 text-xs font-semibold text-lime-300 transition hover:border-lime-400/35"
                >
                  Manage ({model.budgets.length})
                </Link>
              </div>

              {model.alerts.length === 0 ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-fg">
                        {model.budgets.length === 0 ? 'No category guardrails set' : 'All guardrails operating safely'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {model.budgets.length === 0
                          ? 'Set a monthly ceiling to get proactive alerts at 80% utilization.'
                          : `Every budgeted category is below the 80% warning threshold this month.`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {model.alerts.map((status) => {
                    const Icon = status.category.icon;
                    return (
                      <li
                        key={status.budget.id}
                        className="rounded-2xl border border-line/12 bg-raised/45 p-4 transition hover:border-line/25"
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2.5 text-sm font-semibold">
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${status.category.color}20`, color: status.category.color }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            {status.category.label}
                          </span>
                          <Badge tone={status.state === 'over' ? 'rose' : 'amber'} dot>
                            {status.state === 'over' ? 'Limit Exceeded' : `${Math.round(status.ratio * 100)}% Used`}
                          </Badge>
                        </div>
                        <ProgressBar
                          value={Math.min(status.ratio * 100, 100)}
                          tone={status.state === 'over' ? 'rose' : 'amber'}
                          marker={80}
                        />
                        <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted">
                          <span>
                            {hidden
                              ? HIDDEN
                              : `${formatMoney(status.spent, currency, 0)} / ${formatMoney(status.budget.limit, currency, 0)}`}
                          </span>
                          <span className={status.state === 'over' ? 'text-rose-300' : 'text-amber-300'}>
                            {status.remaining >= 0
                              ? `${formatMoney(status.remaining, currency, 0)} left`
                              : `${formatMoney(Math.abs(status.remaining), currency, 0)} over`}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {model.safeBudgetsCount > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-line/10 bg-raised/30 px-4 py-2.5 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-lime-300" />
                  {model.safeBudgetsCount} other {model.safeBudgetsCount === 1 ? 'category is' : 'categories are'} comfortably on track
                </span>
                <Link to="/app/budgets" className="font-semibold text-lime-300 hover:underline">
                  View all
                </Link>
              </div>
            )}
          </section>

          {/* Personalized Insights */}
          <section className="xl:col-span-12">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-300">
                  Behavioral Signals
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight">Personalized Financial Intelligence</h2>
              </div>
              <Link
                to="/app/recommendations"
                className="inline-flex items-center gap-1 text-xs font-semibold text-lime-300 hover:underline"
              >
                All recommendations
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {model.insights.map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          </section>
        </div>
      )}

      <TransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} />
    </div>
  );
}

function buildDashboardModel(data: FinanceData) {
  const key = currentMonthKey();
  const previousMonth = getRecentMonths(2)[0].key;
  const current = summarizeMonth(data.transactions, key);
  const previous = summarizeMonth(data.transactions, previousMonth);
  const budgets = getBudgetStatuses(data.budgets, data.transactions, key);
  const balanceTrendSeries = getBalanceTrend(data);
  const currency: CurrencyCode = data.settings.currency;
  const alerts = budgets.filter((status) => status.state !== 'safe');

  return {
    currency,
    hidden: data.settings.hideBalance,
    firstName: data.settings.name.trim().split(' ')[0] || 'there',
    current,
    balance: getBalance(data),
    balanceTrendSeries,
    incomeTrend: { value: percentChange(current.income, previous.income), goodWhenUp: true },
    expenseTrend: { value: percentChange(current.expenses, previous.expenses), goodWhenUp: false },
    cashFlow: getCashFlow(data.transactions, 6),
    breakdown: getCategoryBreakdown(data.transactions, key),
    alerts,
    safeBudgetsCount: budgets.length - alerts.length,
    budgets: data.budgets,
    goalsCount: data.goals.length,
    recent: [...data.transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .slice(0, 5),
    transactionCount: data.transactions.length,
    insights: buildRecommendations(data, new Date()).slice(0, 3),
  };
}
