import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Input } from './FormField';

function makeChallenge() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return Math.random() < 0.5
    ? { question: `${a} + ${b}`, answer: a + b }
    : { question: `${Math.max(a, b)} − ${Math.min(a, b)}`, answer: Math.max(a, b) - Math.min(a, b) };
}

/**
 * Self-contained arithmetic challenge. A lightweight bot deterrent for forms —
 * server-side protection comes from Identity lockout/rate limiting.
 * Calls `onValidChange(bool)` as the answer becomes correct/incorrect.
 */
export default function MathCaptcha({ onValidChange, className = '' }) {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [value, setValue] = useState('');

  const refresh = useCallback(() => {
    setChallenge(makeChallenge());
    setValue('');
  }, []);

  useEffect(() => {
    onValidChange?.(Number(value) === challenge.answer && value !== '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, challenge]);

  return (
    <div className={className}>
      <label htmlFor="math-captcha" className="block text-sm font-medium text-gray-700 mb-1">
        Security check
      </label>
      <div className="flex items-center gap-2">
        <span
          className="px-3 py-2 rounded-lg bg-primary-50 border border-primary-200 text-sm font-semibold text-primary-900 tracking-wide select-none whitespace-nowrap"
          aria-label={`What is ${challenge.question}?`}
        >
          {challenge.question} = ?
        </span>
        <Input
          id="math-captcha"
          type="number"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Answer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-[7rem]"
        />
        <button
          type="button"
          onClick={refresh}
          aria-label="Get a new security question"
          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
