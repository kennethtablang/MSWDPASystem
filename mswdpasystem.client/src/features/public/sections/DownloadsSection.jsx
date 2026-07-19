import { FileDown } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { useHoverLift } from '../../../shared/motion/hooks';
import { downloadableForms } from '../content/siteContent';

export default function DownloadsSection() {
  const lift = useHoverLift();

  return (
    <section id="downloads" aria-labelledby="downloads-heading" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Downloadable Forms</p>
        <h2 id="downloads-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Prepare your forms ahead of time
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          Download, print, and fill out these forms before visiting the office to save time.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {downloadableForms.map((f) => (
          <StaggerItem
            as="a"
            key={f.file}
            href={f.file}
            download
            {...lift}
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-card hover:border-primary-300 hover:shadow-card-hover transition-[box-shadow,border-color] duration-200 ease-in-out"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 group-hover:bg-primary-700 group-hover:text-white transition-colors">
              <FileDown size={20} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">{f.name}</span>
              <span className="mt-0.5 block text-xs text-gray-500 leading-relaxed">{f.description}</span>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
