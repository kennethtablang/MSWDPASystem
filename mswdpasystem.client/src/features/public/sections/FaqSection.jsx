import Accordion from '../../../shared/components/ui/Accordion';
import { Reveal } from '../../../shared/motion';
import { CONTENT_TYPES, usePublicContent } from '../../../shared/hooks/useContent';
import { faqs as fallbackFaqs } from '../content/siteContent';

export default function FaqSection() {
  const { data, isPending, isError } = usePublicContent(CONTENT_TYPES.faq, { pageSize: 20 });

  const items = isError
    ? fallbackFaqs.map((f) => ({ id: f.id, title: f.question, body: f.answer }))
    : (data?.items ?? []);

  if (!isPending && !isError && items.length === 0) return null;

  return (
    <section id="faqs" aria-labelledby="faqs-heading" className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary-700">
            Frequently Asked Questions
          </p>
          <h2 id="faqs-heading" className="mt-2 text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Answers before you visit
          </h2>
        </Reveal>

        {isPending ? (
          <div className="mt-10 h-72 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 animate-pulse" aria-hidden="true" />
        ) : (
          <Reveal delay={0.08}>
            <Accordion
              className="mt-10 shadow-card"
              defaultOpenId={items[0]?.id}
              items={items.map((f) => ({ id: f.id, title: f.title, content: f.body }))}
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
