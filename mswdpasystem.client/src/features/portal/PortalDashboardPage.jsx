import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, LinkIcon, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../shared/utils/api';
import { useAuth } from '../../shared/context/AuthContext';
import { Card, CardHeader, CardBody, StatCard } from '../../shared/components/ui';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PortalDashboardPage() {
  const { user } = useAuth();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['citizen-profile'],
    queryFn: () => api.get('/citizen/me').then((r) => r.data),
  });

  const { data: reqData, isLoading: loadingReqs } = useQuery({
    queryKey: ['citizen-requests'],
    queryFn: () => api.get('/citizen/assistance-requests').then((r) => r.data),
  });

  if (loadingProfile) return <LoadingSpinner className="py-24" size="lg" />;

  const requests = reqData?.requests ?? [];
  const pending = requests.filter((r) => r.status === 'Submitted' || r.status === 'UnderReview').length;
  const released = requests.filter((r) => r.status === 'Released').length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Kumusta, {user?.fullName?.split(' ')[0]}!
        </h3>
        <p className="text-sm text-gray-500 mt-1">Here's an overview of your MSWD Caba records.</p>
      </div>

      {!profile?.isLinked ? (
        <Card>
          <CardBody className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">Your account isn't linked yet</h4>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                To view your beneficiary profile and assistance history, an MSWD staff member needs to
                link your account to your verified beneficiary record. Please visit the MSWD Caba office
                with a valid ID to complete verification.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={FileText} tint="primary" label="Total Requests" value={requests.length} />
            <StatCard icon={Clock} tint="gold" label="In Progress" value={pending} />
            <StatCard icon={CheckCircle} tint="emerald" label="Released" value={released} />
          </div>

          <Card>
            <CardHeader
              title="My Beneficiary Profile"
              actions={<Link to="/portal/profile" className="text-sm font-medium text-primary-700 hover:underline">View</Link>}
            />
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                  <LinkIcon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.beneficiary.fullName}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-mono">{profile.beneficiary.clientNumber}</span> · {profile.beneficiary.barangay}
                  </p>
                </div>
                <div className="ml-auto"><StatusBadge status={profile.beneficiary.status} /></div>
              </div>
              {profile.beneficiary.programs?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.beneficiary.programs.map((p) => (
                    <span key={p} className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">{p}</span>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent Requests"
              actions={<Link to="/portal/requests" className="text-sm font-medium text-primary-700 hover:underline flex items-center gap-1">All requests <ArrowRight size={14} /></Link>}
            />
            <CardBody>
              {loadingReqs ? (
                <LoadingSpinner className="py-6" />
              ) : requests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {requests.slice(0, 5).map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono text-xs text-gray-400 mr-2">{r.requestNumber}</span>
                        <span className="text-gray-800">{r.assistanceType}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.amount != null && <span className="text-gray-500">{peso(r.amount)}</span>}
                        <StatusBadge status={r.status} type="assistance" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-2">You have no assistance requests on record yet.</p>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
