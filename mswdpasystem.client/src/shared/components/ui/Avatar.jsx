const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary-700 text-white font-semibold shrink-0 ${
        sizes[size] ?? sizes.md
      } ${className}`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
