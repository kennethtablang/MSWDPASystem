import { useQuery } from '@tanstack/react-query';
import {
  Users, UserCheck, Home, HandCoins, FileText, QrCode, Activity, Banknote,
} from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody, StatCard } from '../../shared/components/ui';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ACTION_TINT = {
  Create: 'bg-emerald-100 text-emerald-700',
  Update: 'bg-primary-100 text-primary-700',
  Delete: 'bg-accent-100 text-accent-700',
  Login: 'bg-gray-100 text-gray-600',
  Logout: 'bg-gray-100 text-gray-600',
  QrScan: 'bg-gold-100 text-gold-700',
  StatusChange: 'bg-primary-100 text-primary-700',
  DocumentUpload: 'bg-emerald-100 text-emerald-700',
  DuplicateResolution: 'bg-accent-100 text-accent-700',
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function Breakdown({ title, data }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="space-y-2.5">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No records yet.</p>
        ) : data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-sm mb-0.5">
              <span className="text-gray-700">{d.label}</span>
              <span className="font-semibold text-gray-900">{d.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-primary-600" style={{ width: `${(d.count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default function SystemMonitoring() {
  const { data: s, isLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => api.get('/admin/system-stats').then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading) return <LoadingSpinner className="py-16" size="lg" />;
  if (!s) return null;

  const cards = [
    { icon: Users, tint: 'primary', label: 'System Users', value: s.totalUsers, hint: `${s.activeUsers} active` },
    { icon: UserCheck, tint: 'primary', label: 'Beneficiaries', value: s.totalBeneficiaries, hint: `${s.totalHouseholds} households` },
    { icon: HandCoins, tint: 'gold', label: 'Assistance Requests', value: s.totalAssistanceRequests, hint: `${s.pendingAssistance} pending` },
    { icon: Banknote, tint: 'emerald', label: 'Amount Released', value: peso(s.totalAmountReleased), hint: 'all time' },
    { icon: FileText, tint: 'primary', label: 'Documents', value: s.totalDocuments, hint: 'stored files' },
    { icon: QrCode, tint: 'gold', label: 'QR Scans', value: s.totalQrScans, hint: `${s.qrScansLast24h} in last 24h` },
    { icon: Activity, tint: 'emerald', label: 'Audit Events', value: s.totalAuditEvents, hint: `${s.auditEventsLast24h} in last 24h` },
    { icon: Home, tint: 'primary', label: 'Households', value: s.totalHouseholds, hint: 'registered' },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">System Monitoring</h3>
          <p className="text-sm text-gray-500 mt-0.5">Live usage and activity across the platform</p>
        </div>
        <span className="text-xs text-gray-400">
          As of {new Date(s.serverTimeUtc).toLocaleTimeString('en-PH')}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {cards.map((c) => (
          <StatCard key={c.label} icon={c.icon} tint={c.tint} label={c.label} value={c.value} hint={c.hint} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Breakdown title="Users by Role" data={s.usersByRole} />
        <Breakdown title="Beneficiaries by Status" data={s.beneficiariesByStatus} />
        <Breakdown title="Assistance by Status" data={s.assistanceByStatus} />
      </div>

      <Card className="mt-4">
        <CardHeader title="Recent Activity" subtitle="Latest entries from the audit trail" />
        <CardBody>
          {s.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {s.recentActivity.map((a, i) => (
                <li key={i} className="py-2.5 flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ACTION_TINT[a.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {a.action}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-gray-700">
                    {a.description ?? `${a.action} on ${a.entityType}`}
                  </span>
                  <span className="text-gray-400 shrink-0">{a.userName ?? 'system'}</span>
                  <span className="text-gray-400 shrink-0 w-16 text-right">{relativeTime(a.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
