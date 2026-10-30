import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondary?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, secondary }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-teal-400/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-400/30 bg-surface">
          <Icon className="h-7 w-7 text-teal-300" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {(action || secondary) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondary}
        </div>
      )}
    </div>
  );
}
