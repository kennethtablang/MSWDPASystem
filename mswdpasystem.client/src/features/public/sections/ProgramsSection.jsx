import { Reveal, Stagger, StaggerItem } from '../../../shared/motion';
import { useHoverLift } from '../../../shared/motion/hooks';
import { programs } from '../content/siteContent';

export default function ProgramsSection() {
  const lift = useHoverLift();

  return (
    <section id="programs" aria-labelledby="programs-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Welfare Programs</p>
        <h2 id="programs-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Programs for every stage of need
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          Six national and local programs, administered locally by MSWD Caba for seniors, families,
          persons with disability, solo parents, and households in crisis.
        </p>
      </Reveal>

      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map(({ code, name, description, icon: Icon }) => (
          <StaggerItem
            as="article"
            key={code}
            {...lift}
            className="group rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-[box-shadow,border-color] duration-200 ease-in-out"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 group-hover:bg-primary-700 group-hover:text-white transition-colors">
              <Icon size={22} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">{name}</h3>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{description}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
