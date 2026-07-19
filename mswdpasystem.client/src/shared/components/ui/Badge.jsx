const badgeTones = {
  primary: 'bg-primary-50 text-primary-800 dark:text-primary-300',
  blue: 'bg-primary-100 text-primary-700',
  gold: 'bg-gold-100 text-gold-800',
  emerald: 'bg-emerald-100 text-emerald-700',
  green: 'bg-emerald-100 text-emerald-700',
  accent: 'bg-accent-100 text-accent-700',
  red: 'bg-accent-100 text-accent-700',
  gray: 'bg-gray-100 text-gray-600',
  outline: 'bg-white dark:bg-gray-100 text-gray-600 border border-gray-300',
};

export default function Badge({ tone = 'gray', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        badgeTones[tone] ?? badgeTones.gray
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
