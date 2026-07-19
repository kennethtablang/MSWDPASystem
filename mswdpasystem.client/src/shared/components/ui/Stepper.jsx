import { Check } from 'lucide-react';

/**
 * Horizontal step indicator. `steps` is [{ id, label }], `current` is the
 * zero-based index of the active step.
 */
export default function Stepper({ steps, current, className = '' }) {
  return (
    <ol className={`flex items-center ${className}`} aria-label="Progress">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.id ?? i} className={`flex items-center ${i > 0 ? 'flex-1' : ''}`}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`h-0.5 flex-1 mx-2 rounded ${done || active ? 'bg-primary-600' : 'bg-gray-200'}`}
              />
            )}
            <span className="flex flex-col items-center gap-1.5">
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  done
                    ? 'bg-primary-700 text-white'
                    : active
                      ? 'bg-primary-700 text-white ring-4 ring-primary-100'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {done ? <Check size={16} aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  active ? 'text-primary-800 dark:text-primary-300' : done ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
