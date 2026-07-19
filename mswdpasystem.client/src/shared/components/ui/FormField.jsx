import { forwardRef } from 'react';

function inputClass(hasError = false, extra = '') {
  return `w-full rounded-lg border bg-white dark:bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 ${
    hasError
      ? 'border-accent-400 focus:border-accent-500 focus:ring-accent-100'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100'
  } ${extra}`;
}

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && (
            <span className="text-accent-600 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-accent-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ error, className = '', ...props }, ref) {
  return <input ref={ref} aria-invalid={!!error || undefined} className={inputClass(!!error, className)} {...props} />;
});

export const Select = forwardRef(function Select({ error, className = '', children, ...props }, ref) {
  return (
    <select ref={ref} aria-invalid={!!error || undefined} className={inputClass(!!error, className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ error, className = '', rows = 3, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} aria-invalid={!!error || undefined} className={inputClass(!!error, className)} {...props} />
  );
});
