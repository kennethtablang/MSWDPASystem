import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { useHoverLift } from '../../../shared/motion/hooks';
import { services } from '../content/siteContent';

export default function ServicesSection() {
  const lift = useHoverLift();

  return (
    <section id="services" aria-labelledby="services-heading" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Quick Access Services</p>
          <h2 id="services-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            What you can do at the MSWD office
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ name, description, icon: Icon }) => (
            <StaggerItem
              key={name}
              {...lift}
              className="flex gap-4 rounded-xl bg-white dark:bg-gray-100 border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 ease-in-out"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
