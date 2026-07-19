import { Quote } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { testimonials } from '../content/siteContent';

export default function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Mga Kuwento ng Serbisyo</p>
        <h2 id="testimonials-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          From the people we serve
        </h2>
      </Reveal>

      <Stagger className="mt-10 grid gap-5 lg:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem
            as="figure"
            key={t.id}
            className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-card flex flex-col"
          >
            <Quote size={20} className="text-gold-500" aria-hidden="true" />
            <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed flex-1">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-gray-900">{t.name}</span>
              <span className="block text-xs text-gray-500">{t.barangay}</span>
            </figcaption>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
