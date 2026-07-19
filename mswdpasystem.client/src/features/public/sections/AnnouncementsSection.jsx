import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { useHoverLift } from '../../../shared/motion/hooks';
import { CONTENT_TYPES, usePublicContent } from '../../../shared/hooks/useContent';
import { announcements as fallbackAnnouncements } from '../content/siteContent';

const dateFmt = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AnnouncementsSection() {
  const lift = useHoverLift();
  const { data, isPending, isError } = usePublicContent(CONTENT_TYPES.announcement, { pageSize: 3 });

  // The seeded copy stands in only when the API is unreachable. An empty
  // successful response means staff have genuinely published nothing, and the
  // section hides itself rather than showing stale hard-coded notices.
  const items = isError ? fallbackAnnouncements : (data?.items ?? []);
  const hasMore = (data?.totalCount ?? 0) > items.length;

  if (!isPending && !isError && items.length === 0) return null;

  return (
    <section id="announcements" aria-labelledby="announcements-heading" className="bg-gold-50/60 border-y border-gold-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <Reveal className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-primary-950">
              <Megaphone size={20} aria-hidden="true" />
            </span>
            <h2 id="announcements-heading" className="text-2xl font-bold text-gray-900">
              Announcements
            </h2>
          </div>
          <Link
            to="/announcements"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
          >
            View all
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Reveal>

        {isPending ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Stagger className="mt-8 grid gap-5 lg:grid-cols-3">
            {items.map((a) => (
              <StaggerItem
                as="article"
                key={a.id}
                {...lift}
                className="rounded-xl bg-white dark:bg-gray-100 border border-gray-200 p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 ease-in-out"
              >
                <time dateTime={a.date} className="text-xs font-semibold uppercase tracking-wide text-gold-700">
                  {dateFmt.format(new Date(a.date))}
                </time>
                <h3 className="mt-2 text-base font-semibold text-gray-900">{a.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {(hasMore || items.length > 0) && (
          <Link
            to="/announcements"
            className="mt-6 sm:hidden inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
          >
            View all announcements
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
