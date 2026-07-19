export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/80 ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-100 rounded-xl border border-gray-200 p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}
      role="status"
      aria-label="Loading data"
    >
      <div className="bg-gray-50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100 bg-white dark:bg-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
