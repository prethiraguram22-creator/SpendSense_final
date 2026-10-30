import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useToast } from '@/context/ToastContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { EXPENSE_CATEGORIES } from '@/data/categories';
import { currentMonthKey } from '@/lib/dates';
import { formatMoney, formatPercent } from '@/lib/format';
import { getBudgetStatuses, type BudgetStatus } from '@/lib/finance';
import { BudgetModal } from '@/components/budgets/BudgetModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar, type ProgressTone } from '@/components/ui/ProgressBar';
import { RingProgress } from '@/components/ui/RingProgress';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Budget } from '@/types/finance';
import { cn } from '@/lib/utils';

const STATE_META: Record<
  BudgetStatus['state'],
  { tone: ProgressTone; badge: BadgeTone; label: string; ringColor: string }
> = {
  safe: { tone: 'lime', badge: 'lime', label: 'On Track', ringColor: '#bef264' },
  warning: { tone: 'amber', badge: 'amber', label: 'Approaching Limit', ringColor: '#fbbf24' },
  over: { tone: 'rose', badge: 'rose', label: 'Over Limit', ringColor: '#fb7185' },
};

type EditorState = { open: false } | { open: true; budget: Budget | null };

export default function BudgetsPage() {
  const { data, deleteBudget } = useFinance();
  const { notify } = useToast();
  const loading = usePageLoading();
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<BudgetStatus | null>(null);

  const { currency, hideBalance } = data.settings;
  const statuses = useMemo(
    () => getBudgetStatuses(data.budgets, data.transactions, currentMonthKey()),
    [data.budgets, data.transactions],
  );
  const unbudgetedCategoryIds = useMemo(
    () => EXPENSE_CATEGORIES.map((c) => c.id).filter((id) => !data.budgets.some((b) => b.categoryId === id)),
    [data.budgets],
  );

  if (loading) return <PageSkeleton variant="grid" />;

  const totalLimit = statuses.reduce((total, s) => total + s.budget.limit, 0);
  const totalSpent = statuses.reduce((total, s) => total + s.spent, 0);
  const totalRatio = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const atRisk = statuses.filter((s) => s.state !== 'safe').length;

  // Calculate month elapsed percentage for spending velocity context
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);
  const monthElapsedPercent = Math.round((dayOfMonth / daysInMonth) * 100);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBudget(deleteTarget.budget.id);
    notify({ tone: 'success', title: 'Budget removed', message: deleteTarget.category.label });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Category Guardrails"
        title="Monthly Budgets"
        description="Set monthly spending ceilings per category. SpendSense monitors burn velocity against the calendar and warns you at 80% utilization."
        actions={
          unbudgetedCategoryIds.length > 0 ? (
            <Button onClick={() => setEditor({ open: true, budget: null })}>
              <Plus className="h-4 w-4" />
              New category budget
            </Button>
          ) : undefined
        }
      />

      {statuses.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Aggregate Budget Utilization Command Card */}
          <div className="card-mesh flex flex-col justify-between p-6 sm:p-7 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
                  Total Budget Capacity
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="font-display text-3xl font-extrabold tabular-nums sm:text-4xl">
                    {hideBalance ? '••••••' : formatMoney(totalSpent, currency, 0)}
                  </p>
                  <span className="font-mono text-sm text-muted">
                    of {hideBalance ? '••••••' : formatMoney(totalLimit, currency, 0)} ceiling
                  </span>
                </div>
              </div>
              <RingProgress
                value={totalRatio}
                size={76}
                stroke={7}
                color={totalRatio >= 100 ? '#fb7185' : totalRatio >= 80 ? '#fbbf24' : '#bef264'}
              >
                <span className="font-mono text-xs font-bold">{formatPercent(totalRatio)}</span>
              </RingProgress>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span>Aggregate Burn vs. 80% Alert Line</span>
                <span>Month Elapsed: {monthElapsedPercent}% ({daysRemaining}d left)</span>
              </div>
              <ProgressBar
                value={totalRatio}
                tone={totalRatio >= 100 ? 'rose' : totalRatio >= 80 ? 'amber' : 'lime'}
                marker={80}
              />
            </div>
          </div>

          {/* Velocity & Risk Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5">
            <div className="card flex flex-col justify-between p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Remaining Headroom
              </span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums text-emerald-300 sm:text-3xl">
                {hideBalance ? '••••••' : formatMoney(Math.max(0, totalLimit - totalSpent), currency, 0)}
              </p>
              <p className="mt-2 font-mono text-xs text-muted">
                {hideBalance
                  ? '•••• / day safe pace'
                  : `${formatMoney(Math.max(0, totalLimit - totalSpent) / daysRemaining, currency, 0)}/day safe allowance`}
              </p>
            </div>

            <div className="card flex flex-col justify-between p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Guardrail Status
              </span>
              <p
                className={cn(
                  'mt-3 font-display text-2xl font-bold sm:text-3xl',
                  atRisk > 0 ? 'text-amber-300' : 'text-lime-300',
                )}
              >
                {atRisk === 0 ? 'All Clear' : `${atRisk} ${atRisk === 1 ? 'Alert' : 'Alerts'}`}
              </p>
              <p className="mt-2 text-xs text-muted">
                {atRisk === 0
                  ? `All ${statuses.length} categories under 80%`
                  : `${statuses.length - atRisk} of ${statuses.length} categories within safe zone`}
              </p>
            </div>
          </div>
        </div>
      )}

      {statuses.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="No category budgets configured"
            description="Pick an expense category such as groceries, housing, or dining out, set a monthly ceiling, and SpendSense will track your daily burn velocity."
            action={{ label: 'Create your first budget', onClick: () => setEditor({ open: true, budget: null }) }}
          />
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {statuses.map((status) => {
            const meta = STATE_META[status.state];
            const Icon = status.category.icon;
            const percent = Math.round(status.ratio * 100);
            const pacingFast = percent > monthElapsedPercent + 12 && status.state !== 'over';
            const dailyLeft = status.remaining > 0 ? status.remaining / daysRemaining : 0;

            return (
              <li key={status.budget.id} className="card card-interactive flex flex-col justify-between gap-5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset"
                      style={{
                        backgroundColor: `${status.category.color}18`,
                        color: status.category.color,
                        boxShadow: `inset 0 0 0 1px ${status.category.color}35`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-bold text-fg">{status.category.label}</p>
                      <p className="font-mono text-xs text-muted">
                        Ceiling: {hideBalance ? '••••' : formatMoney(status.budget.limit, currency, 0)}/mo
                      </p>
                    </div>
                  </div>
                  <Badge tone={meta.badge} dot>
                    {meta.label}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-line/10 bg-raised/40 p-4">
                  <div className="mb-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-xl font-bold tabular-nums text-fg">
                        {hideBalance ? '••••' : formatMoney(status.spent, currency, 0)}
                      </span>
                      <span className="ml-1.5 text-xs text-muted">spent</span>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color: meta.ringColor }}>
                      {percent}%
                    </span>
                  </div>

                  <ProgressBar
                    value={Math.min(percent, 100)}
                    tone={meta.tone}
                    marker={80}
                    label={`${status.category.label} budget used`}
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>
                      {status.remaining >= 0
                        ? `${hideBalance ? '••••' : formatMoney(status.remaining, currency, 0)} remaining`
                        : `${hideBalance ? '••••' : formatMoney(Math.abs(status.remaining), currency, 0)} over limit`}
                    </span>
                    <span className="font-mono text-[11px]">
                      {status.remaining > 0
                        ? `${hideBalance ? '••' : formatMoney(dailyLeft, currency, 0)}/d`
                        : '0/d left'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line/10 pt-3.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
                    <Gauge className={cn('h-3.5 w-3.5', pacingFast ? 'text-amber-300' : 'text-emerald-300')} />
                    {status.state === 'over'
                      ? 'Ceiling breached'
                      : pacingFast
                        ? 'High burn velocity'
                        : 'Healthy velocity'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditor({ open: true, budget: status.budget })}
                      aria-label={`Edit ${status.category.label} budget`}
                      className="rounded-xl p-2 text-muted transition hover:bg-line/10 hover:text-lime-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(status)}
                      aria-label={`Delete ${status.category.label} budget`}
                      className="rounded-xl p-2 text-muted transition hover:bg-rose-500/15 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {statuses.length > 0 && atRisk === 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-300" />
          Every category budget is operating safely below the 80% warning threshold this month.
        </div>
      )}

      {statuses.length > 0 && atRisk > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
          {atRisk} {atRisk === 1 ? 'category has' : 'categories have'} crossed the 80% threshold. Review recent transactions or adjust your limits.
        </div>
      )}

      {editor.open && (
        <BudgetModal
          open
          onClose={() => setEditor({ open: false })}
          budget={editor.budget}
          unbudgetedCategoryIds={editor.budget ? [] : unbudgetedCategoryIds}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove this category budget?"
        description={
          deleteTarget
            ? `Your ${deleteTarget.category.label} transactions remain in your ledger. Only the monthly guardrail is removed.`
            : ''
        }
        confirmLabel="Remove budget"
      />
    </div>
  );
}
