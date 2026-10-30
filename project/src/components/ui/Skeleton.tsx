import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

interface PageSkeletonProps {
  variant?: 'dashboard' | 'list' | 'grid';
}

export function PageSkeleton({ variant = 'dashboard' }: PageSkeletonProps) {
  return (
    <div className="space-y-8" role="status" aria-label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {variant === 'dashboard' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-2" />
          <div className="grid gap-5">
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
          </div>
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      )}
      {variant === 'list' && (
        <div className="space-y-5">
          <Skeleton className="h-14" />
          <div className="card space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        </div>
      )}
      {variant === 'grid' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      )}
    </div>
  );
}
