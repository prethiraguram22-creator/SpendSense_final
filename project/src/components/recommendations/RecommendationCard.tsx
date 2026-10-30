import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Sparkles, X, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Recommendation, RecommendationTone } from '@/lib/recommendations';
import { cn } from '@/lib/utils';

const TONE: Record<
  RecommendationTone,
  {
    icon: LucideIcon;
    iconClass: string;
    badge: 'rose' | 'cyan' | 'lime';
    label: string;
    borderAccent: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    iconClass: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    badge: 'rose',
    label: 'Action Required',
    borderAccent: 'hover:border-rose-400/40',
  },
  opportunity: {
    icon: Sparkles,
    iconClass: 'bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30',
    badge: 'cyan',
    label: 'Smart Opportunity',
    borderAccent: 'hover:border-cyan-400/40',
  },
  positive: {
    icon: CheckCircle2,
    iconClass: 'bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/30',
    badge: 'lime',
    label: 'Strong Habit',
    borderAccent: 'hover:border-lime-400/40',
  },
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss?: () => void;
  className?: string;
}

export function RecommendationCard({ recommendation, onDismiss, className }: RecommendationCardProps) {
  const tone = TONE[recommendation.tone];
  const Icon = tone.icon;

  return (
    <article
      className={cn(
        'card card-interactive group relative flex h-full flex-col justify-between overflow-hidden p-6',
        tone.borderAccent,
        className,
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', tone.iconClass)}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={tone.badge} dot>
                {tone.label}
              </Badge>
              <span className="rounded-full border border-line/15 bg-raised/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-fg">
                {recommendation.metric}
              </span>
            </div>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={`Dismiss: ${recommendation.title}`}
              className="rounded-xl p-1.5 text-muted transition hover:bg-line/10 hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-fg">{recommendation.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{recommendation.body}</p>
      </div>

      <div className="mt-6 border-t border-line/10 pt-4">
        <Link
          to={recommendation.action.to}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 transition group-hover:text-emerald-300"
        >
          {recommendation.action.label}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
