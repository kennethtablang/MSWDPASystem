import { Clock, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Reveal } from '../../../shared/motion';
import { officeInfo, mapLocation } from '../content/siteContent';

export default function VisitUsSection() {
  const { lat, lng, zoom } = mapLocation;
  // OpenStreetMap embed: no API key, no tracking cookies, no external JS —
  // which keeps this compliant with the same privacy posture as the rest of
  // the site. A bbox roughly 0.01 deg on each side frames the poblacion.
  const bbox = [lng - 0.008, lat - 0.006, lng + 0.008, lat + 0.006].join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const fullMap = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <section id="visit" aria-labelledby="visit-heading" className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Office Information</p>
          <h2 id="visit-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            Visit the MSWD office
          </h2>
          <p className="mt-3 max-w-2xl text-gray-600">
            Walk-in assistance is available during office hours. Bring a valid ID so staff can
            verify your identity and link your citizen account to your beneficiary record.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2 space-y-4">
            <div className="flex gap-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{officeInfo.address}</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Clock size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Office Hours</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{officeInfo.hours}</p>
                <p className="mt-1 text-xs text-gray-500">Closed on weekends and public holidays.</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                <Mail size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                <a
                  href={`mailto:${officeInfo.email}`}
                  className="mt-1 inline-block text-sm text-primary-700 hover:underline break-all"
                >
                  {officeInfo.email}
                </a>
              </div>
            </div>

            <a
              href={fullMap}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline"
            >
              Open in OpenStreetMap
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-3">
            <div className="h-full min-h-80 overflow-hidden rounded-xl border border-gray-200 shadow-card">
              <iframe
                title={`Map showing the location of the ${officeInfo.office} in Caba, La Union`}
                src={src}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full min-h-80 border-0"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
