import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import usePreferences from '../hooks/usePreferences';

/**
 * Hides a personal detail until the operator reveals it.
 *
 * Front desks are overlooked by the queue, and contact numbers and household
 * income are protected personal data under RA 10173. Masking by default keeps
 * them off a screen a stranger can read over the client's shoulder, without
 * making staff go anywhere else to see them.
 *
 * Governed by the "Hide contact numbers and income" setting; when that is off
 * this renders the value plainly and adds nothing.
 */
export default function Sensitive({ value, placeholder = '—', className = '' }) {
  const { maskSensitiveData } = usePreferences();
  const [revealed, setRevealed] = useState(false);

  if (value === null || value === undefined || value === '') {
    return <span className={className}>{placeholder}</span>;
  }

  if (!maskSensitiveData || revealed) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {value}
        {maskSensitiveData && (
          <button
            type="button"
            onClick={() => setRevealed(false)}
            aria-label="Hide again"
            title="Hide again"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <EyeOff size={13} />
          </button>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      // The mask is fixed-width rather than derived from the value, so its length
      // does not leak how long the hidden number is.
      aria-label="Reveal hidden value"
      title="Click to reveal"
      className={`inline-flex items-center gap-1.5 rounded text-gray-400 transition-colors hover:text-gray-700 ${className}`}
    >
      <span className="font-mono tracking-wider select-none">••••••</span>
      <Eye size={13} />
    </button>
  );
}
