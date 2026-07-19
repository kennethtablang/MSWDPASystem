const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
};

/**
 * CSS-only tooltip shown on hover and keyboard focus of the wrapped element.
 */
export default function Tooltip({ label, side = 'top', className = '', children }) {
  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-primary-950 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${
          positions[side] ?? positions.top
        }`}
      >
        {label}
      </span>
    </span>
  );
}
