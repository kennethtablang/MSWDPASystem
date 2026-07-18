const beneficiaryColors = {
  Active: 'bg-green-100 text-green-700',
  Verified: 'bg-blue-100 text-blue-700',
  Flagged: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const assistanceColors = {
  Submitted: 'bg-blue-100 text-blue-700',
  UnderReview: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Released: 'bg-emerald-100 text-emerald-700',
  Denied: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, type = 'beneficiary' }) {
  const map = type === 'assistance' ? assistanceColors : beneficiaryColors;
  const color = map[status] ?? 'bg-gray-100 text-gray-500';
  const label = status === 'UnderReview' ? 'Under Review' : status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
