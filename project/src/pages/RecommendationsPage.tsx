import { useMemo, useState } from 'react';
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { buildRecommendations, type RecommendationTone } from '@/lib/recommendations';
import { cn } from '@/lib/utils';

type ToneFilter = 'all' | RecommendationTone;

const FILTER_TABS: { value: ToneFilter; label: string }[] = [
  { value: 'all', label: 'All Signals' },
  { value: 'warning', label: 'Action Required' },
  { value: 'opportunity', label: 'Opportunities' },
  { value: 'positive', label: 'Strong Habits' },
];

export default function RecommendationsPage() {
  const { data, dismissRecommendation, restoreRecommendations } = useFinance();
  const loading = usePageLoading();
  const [toneFilter, setToneFilter] = useState<ToneFilter>('all');

  const allRecommendations = useMemo(() => buildRecommendations(data, new Date()), [data]);
  const activeRecommendations = useMemo(
    () => allRecommendations.filter((item) => !data.dismissedRecommendations.includes(item.id)),
    [allRecommendations, data.dismissedRecommendations],
  );
  const filtered = useMemo(
    () =>
      toneFilter === 'all'
        ? activeRecommendations
        : activeRecommendations.filter((item) => item.tone === toneFilter),
    [activeRecommendations, toneFilter],
  );

  if (loading) return <PageSkeleton variant="grid" />;

  const dismissedCount = data.dismissedRecommendations.length;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Behavioral Signals"
        title="Recommendations"
        description="Specific, data-backed next actions synthesized directly from your cash-flow velocity, category spikes, and goal deadlines."
        badge={
          <Badge tone="lime" dot className="font-mono">
            {activeRecommendations.length} Active
          </Badge>
        }
        actions={
          dismissedCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={restoreRecommendations}>
              <RotateCcw className="h-4 w-4" />
              Restore dismissed ({dismissedCount})
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="radiogroup"
          aria-label="Filter recommendations"
          className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-line/15 bg-surface/80 p-1.5"
        >
          {FILTER_TABS.map((tab) => {
            const active = toneFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setToneFilter(tab.value)}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm',
                  active
                    ? 'bg-gradient-to-r from-lime-300 to-emerald-400 text-slate-950 shadow-sm'
                    : 'text-muted hover:text-fg',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 font-mono text-xs text-muted">
          <Sparkles className="h-3.5 w-3.5 text-lime-300" />
          Recalculated automatically as you log transactions
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={activeRecommendations.length === 0 ? CheckCircle2 : Lightbulb}
            title={
              activeRecommendations.length === 0
                ? 'You are caught up on every recommendation'
                : 'No recommendations in this category'
            }
            description={
              activeRecommendations.length === 0
                ? 'All active insights have been reviewed or dismissed. You can restore dismissed cards or log more activity.'
                : 'Switch back to All Signals to see recommendations across other categories.'
            }
            action={
              toneFilter !== 'all'
                ? { label: 'Show all signals', onClick: () => setToneFilter('all') }
                : dismissedCount > 0
                  ? { label: 'Restore dismissed', onClick: restoreRecommendations }
                  : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onDismiss={() => dismissRecommendation(recommendation.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
