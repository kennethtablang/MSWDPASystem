import { Target, Eye } from 'lucide-react';
import { Stagger, StaggerItem } from '../../../shared/motion';
import { mission, vision } from '../content/siteContent';

export default function MissionVisionSection() {
  return (
    <section aria-label="Mission and vision" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Stagger className="grid gap-6 lg:grid-cols-2" gap={0.1}>
        <StaggerItem className="rounded-2xl bg-primary-900 text-white p-8 sm:p-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-gold-400">
            <Target size={22} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Our Mission</h2>
          <p className="mt-3 text-primary-200 leading-relaxed">{mission}</p>
        </StaggerItem>
        <StaggerItem className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-100 p-8 sm:p-10 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
            <Eye size={22} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">Our Vision</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">{vision}</p>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
