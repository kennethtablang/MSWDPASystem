import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardBody } from '../../shared/components/ui';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/ui/EmptyState';

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : null);

export default function MyRequestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['citizen-requests'],
    queryFn: () => api.get('/citizen/assistance-requests').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;

  const requests = data?.requests ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">My Assistance Requests</h3>
        <p className="text-sm text-gray-500 mt-0.5">Track each request from submission through release.</p>
      </div>

      {!data?.isLinked ? (
        <EmptyState
          title="No linked beneficiary record"
          description="Your account isn't linked to a beneficiary profile yet. Visit the MSWD Caba office with a valid ID to complete verification."
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="You don't have any assistance requests on record. Requests are encoded by MSWD staff when you apply at the office."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">{r.requestNumber}</span>
                      <StatusBadge status={r.status} type="assistance" />
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">{r.assistanceType}</p>
                    {r.program && <p className="text-sm text-gray-500">{r.program}</p>}
                    {r.purpose && <p className="mt-1 text-sm text-gray-600">{r.purpose}</p>}
                  </div>
                  {r.amount != null && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-900">{peso(r.amount)}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} /> Submitted {fmt(r.createdAt)}
                  </span>
                  {r.releasedAt && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 size={13} /> Released {fmt(r.releasedAt)}
                    </span>
                  )}
                  {r.status === 'Denied' && r.denialReason && (
                    <span className="inline-flex items-center gap-1.5 text-accent-700">
                      <XCircle size={13} /> {r.denialReason}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
