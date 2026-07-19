import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { CONTENT_TYPES, usePublicContent } from '../../../shared/hooks/useContent';
import { news as fallbackNews } from '../content/siteContent';

const dateFmt = new Intl.DateTimeFormat('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

export default function NewsSection() {
  const { data, isPending, isError } = usePublicContent(CONTENT_TYPES.news, { pageSize: 4 });

  const items = isError ? fallbackNews : (data?.items ?? []);

  if (!isPending && !isError && items.length === 0) return null;

  return (
    <section id="news" aria-labelledby="news-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Latest Updates</p>
          <h2 id="news-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            News &amp; Events
          </h2>
        </div>
        <Link
          to="/news"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          View all
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </Reveal>

      {isPending ? (
        <div className="mt-10 h-64 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 animate-pulse" aria-hidden="true" />
      ) : (
        <Stagger className="mt-10 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 shadow-card">
          {items.map((n) => (
            <StaggerItem
              as="article"
              key={n.id}
              y={10}
              className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 px-6 py-5"
            >
              <time dateTime={n.date} className="shrink-0 sm:w-40 text-xs font-medium text-gray-400">
                {dateFmt.format(new Date(n.date))}
              </time>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{n.title}</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{n.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
