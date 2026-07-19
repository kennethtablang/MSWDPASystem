/**
 * Shown while a lazily-loaded route chunk is downloading.
 *
 * A skeleton rather than a spinner: on the office's slower connections a spinner
 * reads as "nothing is happening", while a page-shaped placeholder reads as
 * "your page is coming" and keeps the layout from jumping when it arrives.
 */
export default function RouteFallback() {
  return (
    <div className="p-1 motion-safe:animate-pulse" role="status" aria-label="Loading page">
      <div className="mb-6 space-y-2">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="h-3.5 w-72 rounded bg-gray-100" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-gray-100 bg-white dark:bg-gray-100 p-4">
            <div className="mb-3 h-3 w-16 rounded bg-gray-100" />
            <div className="h-6 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white dark:bg-gray-100 p-4">
        <div className="mb-4 h-4 w-40 rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100" />
              <div className="h-3.5 flex-1 rounded bg-gray-100" />
              <div className="h-3.5 w-24 rounded bg-gray-100" />
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
