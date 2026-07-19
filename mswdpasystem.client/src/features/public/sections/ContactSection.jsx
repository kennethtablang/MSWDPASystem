import { PhoneCall } from 'lucide-react';
import { hotlines } from '../content/siteContent';

export default function ContactSection() {
  return (
    <section aria-labelledby="hotlines-heading" className="bg-accent-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3">
          <PhoneCall size={22} className="text-white" aria-hidden="true" />
          <h2 id="hotlines-heading" className="text-xl font-bold">
            Emergency Hotlines
          </h2>
        </div>
        <p className="mt-2 text-sm text-accent-100 max-w-2xl">
          For life-threatening emergencies, call 911 immediately. For welfare concerns during
          office hours, reach the MSWD office.
        </p>
        <dl className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {hotlines.map((h) => (
            <div key={h.name}>
              <dt className="text-xs uppercase tracking-wide text-accent-200">{h.name}</dt>
              <dd className="mt-1 text-lg font-bold">{h.number}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
