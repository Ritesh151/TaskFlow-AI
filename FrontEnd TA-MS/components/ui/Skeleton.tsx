import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-gray-100', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
