import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Accordion from '../../shared/components/ui/Accordion';
import { Reveal, Stagger, StaggerItem } from '../../shared/motion';
import { CONTENT_TYPES, usePublicContent } from '../../shared/hooks/useContent';

const dateFmt = new Intl.DateTimeFormat('en-PH', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const PAGE_SIZE = 10;

/**
 * Public archive for a landing-page section. `includeExpired` is what makes
 * this an archive rather than a second copy of the landing page: items that
 * have aged off the front page are still public record and stay readable here.
 */
export default function ContentArchivePage({ type, title, intro }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = usePublicContent(type, {
    includeExpired: true,
    page,
    pageSize: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isFaq = type === CONTENT_TYPES.faq;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to home
      </Link>

      <Reveal>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600 leading-relaxed">{intro}</p>
      </Reveal>

      {isPending && (
        <div className="mt-10 space-y-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p role="alert" className="mt-10 rounded-lg bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-800">
          This list could not be loaded right now. Please try again later, or contact the MSWD
          office during office hours.
        </p>
      )}

      {!isPending && !isError && items.length === 0 && (
        <p className="mt-10 rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
          Nothing has been published in this section yet.
        </p>
      )}

      {!isPending && !isError && items.length > 0 && (
        isFaq ? (
          <Reveal>
            <Accordion
              className="mt-10 shadow-card"
              defaultOpenId={items[0]?.id}
              items={items.map((f) => ({ id: f.id, title: f.title, content: f.body }))}
            />
          </Reveal>
        ) : (
          <Stagger className="mt-10 space-y-4">
            {items.map((item) => (
              <StaggerItem
                as="article"
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <time dateTime={item.date} className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {dateFmt.format(new Date(item.date))}
                  </time>
                  {item.isExpired && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      Past
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        )
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-between" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Previous
          </button>
          <p aria-live="polite" className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
