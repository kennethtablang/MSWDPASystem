const variants = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
  secondary: 'bg-primary-50 text-primary-800 dark:text-primary-300 border border-primary-200 hover:bg-primary-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
  warning: 'bg-gold-400 text-primary-950 hover:bg-gold-300 active:bg-gold-500',
  danger: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',
  outline: 'bg-white dark:bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <Comp
      {...(Comp === 'button' ? { type: props.type ?? 'button', disabled: isDisabled } : {})}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center font-medium rounded-lg select-none transition-[color,background-color,border-color,transform] duration-200 ease-in-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
        variants[variant] ?? variants.primary
      } ${sizes[size] ?? sizes.md} ${isDisabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </Comp>
  );
}
