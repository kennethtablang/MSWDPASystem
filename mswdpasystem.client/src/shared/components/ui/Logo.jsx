/**
 * Official mark for MSWD Caba: an eight-ray sun (from the Philippine flag,
 * echoed in the Caba and La Union seals) inside a gold-ringed blue disc.
 *
 * variant "dark"  — for light backgrounds (dark text)
 * variant "light" — for dark backgrounds (white text)
 */
export function LogoMark({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="MSWD Caba seal"
    >
      <circle cx="32" cy="32" r="31" fill="#0c296b" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="#fcd116" strokeWidth="2.5" />
      <g fill="#fcd116">
        <circle cx="32" cy="32" r="8.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <path
            key={angle}
            d="M32 11.5 L29.2 21.5 L34.8 21.5 Z"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
    </svg>
  );
}

export default function Logo({
  variant = 'dark',
  size = 40,
  showText = true,
  className = '',
}) {
  const light = variant === 'light';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <div className="leading-tight">
          <p
            className={`text-sm font-bold tracking-tight ${
              light ? 'text-white' : 'text-primary-950 dark:text-gray-900'
            }`}
          >
            MSWD Caba
          </p>
          <p
            className={`text-xs ${light ? 'text-primary-200' : 'text-gray-500'}`}
          >
            Municipality of Caba &middot; La Union
          </p>
        </div>
      )}
    </div>
  );
}
