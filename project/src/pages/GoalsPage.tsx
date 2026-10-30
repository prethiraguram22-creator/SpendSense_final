import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Coins, Pencil, PiggyBank, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useToast } from '@/context/ToastContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RingProgress } from '@/components/ui/RingProgress';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GoalModal } from '@/components/goals/GoalModal';
import { ContributeModal } from '@/components/goals/ContributeModal';
import { monthsBetween, parseISODate } from '@/lib/dates';
import { formatLongDate, formatMoney, formatPercent } from '@/lib/format';
import type { Goal } from '@/types/finance';

type GoalEditorState = { open: false } | { open: true; goal: Goal | null };

export default function GoalsPage() {
  const { data, deleteGoal } = useFinance();
  const { notify } = useToast();
  const loading = usePageLoading();

  const [editor, setEditor] = useState<GoalEditorState>({ open: false });
  const [contributeTarget, setContributeTarget] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const { currency, hideBalance } = data.settings;
  const money = (value: number) => (hideBalance ? '••••••' : formatMoney(value, currency, 0));

  const summary = useMemo(() => {
    const totalTarget = data.goals.reduce((acc, g) => acc + g.target, 0);
    const totalSaved = data.goals.reduce((acc, g) => acc + g.saved, 0);
    const completed = data.goals.filter((g) => g.saved >= g.target).length;
    const now = new Date();
    const monthlyNeeded = data.goals.reduce((acc, g) => {
      if (g.saved >= g.target) return acc;
      const months = Math.max(1, monthsBetween(now, parseISODate(g.deadline)));
      return acc + (g.target - g.saved) / months;
    }, 0);
    return {
      totalTarget,
      totalSaved,
      overallPercent: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
      completed,
      monthlyNeeded,
    };
  }, [data.goals]);

  if (loading) return <PageSkeleton variant="grid" />;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteGoal(deleteTarget.id);
    notify({ tone: 'info', title: 'Savings goal removed', message: deleteTarget.name });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Capital Allocation"
        title="Savings Goals"
        description="Assign every dollar a destination. Track milestone progress, target dates, and the exact monthly contribution required to finish on schedule."
        actions={
          <Button onClick={() => setEditor({ open: true, goal: null })}>
            <Plus className="h-4 w-4" />
            New savings goal
          </Button>
        }
      />

      {data.goals.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="card-mesh flex flex-col justify-between p-6 sm:p-7 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
                  Total Goal Reserves
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="font-display text-3xl font-extrabold tabular-nums sm:text-4xl">
                    {money(summary.totalSaved)}
                  </p>
                  <span className="font-mono text-sm text-muted">of {money(summary.totalTarget)} target</span>
                </div>
              </div>

              <RingProgress value={summary.overallPercent} size={80} stroke={7} color="#bef264">
                <span className="font-mono text-xs font-bold text-lime-300">
                  {formatPercent(summary.overallPercent)}
                </span>
              </RingProgress>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span>Portfolio Completion</span>
                <span>
                  {summary.completed} of {data.goals.length} completed
                </span>
              </div>
              <ProgressBar value={summary.overallPercent} tone="lime" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5">
            <div className="card flex flex-col justify-between p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Remaining To Fund
              </span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums text-fg sm:text-3xl">
                {money(Math.max(0, summary.totalTarget - summary.totalSaved))}
              </p>
              <p className="mt-2 text-xs text-muted">Across {data.goals.length} active milestones</p>
            </div>

            <div className="card flex flex-col justify-between p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Required Monthly Pace
              </span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums text-cyan-300 sm:text-3xl">
                {money(summary.monthlyNeeded)}
                <span className="text-sm font-normal text-muted">/mo</span>
              </p>
              <p className="mt-2 text-xs text-muted">To hit every target date on time</p>
            </div>
          </div>
        </div>
      )}

      {data.goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title="No savings goals created yet"
            description="Create a goal for your emergency cushion, next trip, or a major purchase. SpendSense will calculate the monthly pace needed to reach it."
            action={{ label: 'Create your first goal', onClick: () => setEditor({ open: true, goal: null }) }}
          />
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {data.goals.map((goal) => {
            const percent = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
            const remaining = Math.max(0, goal.target - goal.saved);
            const isComplete = remaining <= 0;
            const monthsLeft = Math.max(1, monthsBetween(new Date(), parseISODate(goal.deadline)));
            const monthlyPace = isComplete ? 0 : remaining / monthsLeft;

            return (
              <li key={goal.id} className="card card-interactive flex flex-col justify-between gap-6 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <RingProgress value={percent} size={72} stroke={6} color={goal.color}>
                      <span className="font-mono text-xs font-bold tabular-nums">
                        {Math.round(percent)}%
                      </span>
                    </RingProgress>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-fg">{goal.name}</h3>
                        {isComplete ? (
                          <Badge tone="lime" dot>
                            Funded
                          </Badge>
                        ) : (
                          <Badge tone="cyan">{monthsLeft} mo left</Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        Target date: {formatLongDate(goal.deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditor({ open: true, goal })}
                      aria-label={`Edit ${goal.name}`}
                      className="rounded-xl p-2 text-muted transition hover:bg-line/10 hover:text-lime-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(goal)}
                      aria-label={`Delete ${goal.name}`}
                      className="rounded-xl p-2 text-muted transition hover:bg-rose-500/15 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-line/10 bg-raised/45 p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-2xl font-extrabold tabular-nums text-fg">
                        {money(goal.saved)}
                      </span>
                      <span className="ml-2 font-mono text-xs text-muted">of {money(goal.target)}</span>
                    </div>
                    <span className="font-mono text-xs text-muted">
                      {isComplete ? 'Goal achieved' : `${money(remaining)} to go`}
                    </span>
                  </div>

                  <ProgressBar value={percent} tone={isComplete ? 'lime' : 'teal'} />

                  <div className="flex items-center justify-between pt-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-lime-300" />
                      {isComplete ? 'Milestone reached!' : 'Recommended monthly pace'}
                    </span>
                    {!isComplete && (
                      <span className="font-mono font-semibold text-lime-300">{money(monthlyPace)}/mo</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {isComplete ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-lime-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Fully funded &amp; ready
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setContributeTarget(goal)}
                      className="w-full sm:w-auto"
                    >
                      <Coins className="h-4 w-4" />
                      Contribute funds
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editor.open && (
        <GoalModal open onClose={() => setEditor({ open: false })} goal={editor.goal} />
      )}

      <ContributeModal
        open={contributeTarget !== null}
        onClose={() => setContributeTarget(null)}
        goal={contributeTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this savings goal?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" and its progress tracker will be removed from your workspace.`
            : ''
        }
        confirmLabel="Delete goal"
      />
    </div>
  );
}
