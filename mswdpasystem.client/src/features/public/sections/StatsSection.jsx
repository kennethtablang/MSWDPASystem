import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { fallbackStats } from '../content/siteContent';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      if (reduceMotion) {
        setValue(target);
        return;
      }
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Stat({ value, label }) {
  const display = useCountUp(value);
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-primary-900">
        {display.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  const { data } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/public/stats').then((r) => r.data),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const stats = data ?? fallbackStats;

  return (
    <section aria-label="Public service statistics" className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <Stat value={stats.beneficiariesServed} label="Beneficiaries served" />
        <Stat value={stats.assistanceReleased} label="Assistance requests released" />
        <Stat value={stats.activePrograms} label="Active welfare programs" />
        <Stat value={stats.barangaysCovered} label="Barangays covered" />
      </div>
    </section>
  );
}
