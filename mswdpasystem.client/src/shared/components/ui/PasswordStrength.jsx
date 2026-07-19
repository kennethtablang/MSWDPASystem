const levels = [
  { label: 'Too weak', bar: 'bg-accent-500', text: 'text-accent-700' },
  { label: 'Weak', bar: 'bg-accent-400', text: 'text-accent-700' },
  { label: 'Fair', bar: 'bg-gold-500', text: 'text-gold-700' },
  { label: 'Good', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  { label: 'Strong', bar: 'bg-emerald-600', text: 'text-emerald-700' },
];

function scorePassword(password = '') {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12 && score >= 3) score = 4;
  return Math.min(score, 4);
}

export default function PasswordStrength({ password = '', className = '' }) {
  const score = scorePassword(password);
  const level = levels[score];
  if (!password) return null;

  return (
    <div className={className} aria-live="polite">
      <div className="flex gap-1.5" role="img" aria-label={`Password strength: ${level.label}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? level.bar : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${level.text}`}>{level.label}</p>
    </div>
  );
}
