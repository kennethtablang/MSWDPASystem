import Badge from './ui/Badge';

const beneficiaryTones = {
  Active: 'emerald',
  Verified: 'blue',
  Flagged: 'gold',
  Inactive: 'gray',
};

const assistanceTones = {
  Submitted: 'blue',
  UnderReview: 'gold',
  Approved: 'emerald',
  Released: 'emerald',
  Denied: 'red',
};

/**
 * The two status vocabularies share no values, so the correct palette can be
 * inferred from the status itself. `type` stays supported for existing callers
 * but is only a tie-breaker for unknown values.
 */
export default function StatusBadge({ status, type = 'beneficiary', className = '' }) {
  const map =
    status in assistanceTones ? assistanceTones
      : status in beneficiaryTones ? beneficiaryTones
        : type === 'assistance' ? assistanceTones : beneficiaryTones;

  const label = status === 'UnderReview' ? 'Under Review' : status;
  return <Badge tone={map[status] ?? 'gray'} className={className}>{label}</Badge>;
}
