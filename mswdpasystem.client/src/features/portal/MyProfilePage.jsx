import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, CalendarDays, ShieldAlert, BadgeCheck } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody } from '../../shared/components/ui';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—');

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon size={16} className="text-gray-400 shrink-0" />
      <span className="text-sm text-gray-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );
}

export default function MyProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['citizen-profile'],
    queryFn: () => api.get('/citizen/me').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!profile) return <p className="text-gray-500 p-8">Profile unavailable.</p>;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
        <p className="text-sm text-gray-500 mt-0.5">Your citizen account and linked beneficiary record.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader title="Account Details" />
        <CardBody className="divide-y divide-gray-100">
          <Row icon={User} label="Full Name" value={profile.fullName} />
          <Row icon={BadgeCheck} label="Username" value={profile.userName} />
          <Row icon={Mail} label="Email" value={profile.email} />
          <Row icon={Phone} label="Contact No." value={profile.contactNumber} />
          <Row icon={CalendarDays} label="Member Since" value={fmt(profile.createdAt)} />
        </CardBody>
      </Card>

      {/* Linked beneficiary */}
      {profile.isLinked ? (
        <Card>
          <CardHeader
            title="Linked Beneficiary Record"
            actions={<StatusBadge status={profile.beneficiary.status} />}
          />
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                {profile.beneficiary.fullName?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile.beneficiary.fullName}</p>
                <p className="text-sm text-gray-500">
                  Client No.: <span className="font-mono text-primary-700">{profile.beneficiary.clientNumber}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Barangay {profile.beneficiary.barangay}</p>
              </div>
            </div>
            {profile.beneficiary.programs?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Enrolled Programs</p>
                <div className="flex flex-wrap gap-2">
                  {profile.beneficiary.programs.map((p) => (
                    <span key={p} className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">{p}</span>
                  ))}
                </div>
              </div>
            )}
            <Link to="/portal/requests" className="mt-5 inline-block text-sm font-medium text-primary-700 hover:underline">
              View my assistance requests →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">Not yet linked to a beneficiary record</h4>
              <p className="text-sm text-gray-600 mt-1">
                Visit the MSWD Caba office with a valid ID so staff can verify your identity and link your
                account to your beneficiary profile. Once linked, your profile and assistance history appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
