import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import StatusBadge from '../../shared/components/StatusBadge';

const BENEFICIARY_COLORS = {
  Active: '#22c55e',
  Verified: '#3b82f6',
  Flagged: '#f59e0b',
  Inactive: '#9ca3af',
};

const ASSISTANCE_COLORS = {
  Submitted: '#3b82f6',
  UnderReview: '#f59e0b',
  Approved: '#22c55e',
  Released: '#10b981',
  Denied: '#ef4444',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    staleTime: 60_000,
  });

  const { data: charts } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => api.get('/dashboard/charts').then(r => r.data),
    staleTime: 120_000,
  });

  const { data: recentRequests, isLoading: loadingRecent } = useQuery({
    queryKey: ['assistance-recent'],
    queryFn: () => api.get('/assistance', { params: { pageSize: 5, page: 1 } }).then(r => r.data.items),
    staleTime: 60_000,
  });

  const cards = [
    {
      label: 'Total Beneficiaries',
      value: stats?.totalBeneficiaries,
      sub: `${stats?.activeBeneficiaries ?? '—'} active`,
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-400',
      link: '/beneficiaries',
    },
    {
      label: 'Assistance Requests',
      value: stats?.totalAssistanceRequests,
      sub: 'all time',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-400',
      link: '/assistance',
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingApprovals,
      sub: 'submitted + under review',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-400',
      link: '/assistance',
    },
    {
      label: 'Released This Month',
      value: stats?.releasedThisMonth,
      sub: stats?.totalAmountReleasedThisMonth
        ? `₱${Number(stats.totalAmountReleasedThisMonth).toLocaleString()}`
        : 'no amount data',
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-400',
      link: '/assistance',
    },
  ];

  const pieData = charts?.beneficiaryStatusBreakdown?.filter(d => d.count > 0) ?? [];
  const assistancePieData = charts?.assistanceStatusBreakdown?.filter(d => d.count > 0) ?? [];
  const monthlyData = charts?.monthlyRegistrations ?? [];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening at MSWD Caba today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => navigate(card.link)}
              className={`rounded-xl border p-5 text-left hover:shadow-md transition-shadow ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {loadingStats ? <LoadingSpinner size="sm" /> : (card.value ?? '—')}
                  </p>
                  <p className="text-xs mt-1 opacity-70">{card.sub}</p>
                </div>
                <Icon size={24} className={`mt-0.5 ${card.iconColor} opacity-60`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Flagged alert */}
      {stats?.flaggedBeneficiaries > 0 && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <span className="font-semibold">{stats.flaggedBeneficiaries} beneficiar{stats.flaggedBeneficiaries === 1 ? 'y' : 'ies'} flagged</span>
          for possible duplicate — please review.
          <button onClick={() => navigate('/duplicates')} className="ml-auto underline hover:no-underline">
            View
          </button>
        </div>
      )}

      {/* Charts Row */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Monthly Registrations Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Beneficiary Registrations — Last 6 Months</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, 'Registrations']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Beneficiary Status Pie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Beneficiary Status</h4>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    strokeWidth={1}
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.status} fill={BENEFICIARY_COLORS[entry.status] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
            )}
          </div>
        </div>
      )}

      {/* Assistance Status Breakdown */}
      {charts && assistancePieData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Assistance Requests by Status</h4>
          <div className="flex flex-wrap gap-3">
            {assistancePieData.map(d => (
              <div key={d.status} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: ASSISTANCE_COLORS[d.status] ?? '#9ca3af' }}
                />
                <span className="text-sm text-gray-600">
                  {d.status === 'UnderReview' ? 'Under Review' : d.status}:
                  <span className="font-semibold ml-1">{d.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Recent Assistance Requests</h4>
          <button onClick={() => navigate('/assistance')} className="text-sm text-blue-600 hover:underline">
            View all
          </button>
        </div>

        {loadingRecent ? (
          <LoadingSpinner className="py-8" />
        ) : recentRequests?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentRequests.map(r => (
              <div
                key={r.id}
                onClick={() => navigate(`/assistance/${r.id}`)}
                className="py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <span className="font-mono text-xs text-gray-400 mr-2">{r.requestNumber}</span>
                  <span className="font-medium text-gray-800">{r.beneficiaryName}</span>
                  <span className="text-gray-500 ml-2">· {r.assistanceType}</span>
                </div>
                <div className="flex items-center gap-3">
                  {r.amount && <span className="text-gray-500">₱{Number(r.amount).toLocaleString()}</span>}
                  <StatusBadge status={r.status} type="assistance" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No assistance requests yet.</p>
        )}
      </div>
    </div>
  );
}
