import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText, Users, HandCoins, Banknote } from 'lucide-react';
import api from '../../shared/utils/api';
import { downloadBlob } from '../../shared/utils/download';
import { Card, CardHeader, CardBody, StatCard } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import { Input, Select } from '../../shared/components/ui/FormField';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/ui/EmptyState';
import usePreferences from '../../shared/hooks/usePreferences';

const PERIODS = [
  { id: 'Daily', label: 'Daily' },
  { id: 'Monthly', label: 'Monthly' },
  { id: 'Annual', label: 'Annual' },
];

const PALETTE = ['#0038a8', '#ce1126', '#fcd116', '#059669', '#618cff', '#a36706', '#e64256', '#10b981'];
const STATUS_COLORS = {
  Submitted: '#618cff', UnderReview: '#fcd116', Approved: '#059669',
  Released: '#10b981', Denied: '#ce1126',
};
const BENEFICIARY_STATUS = ['', 'Active', 'Verified', 'Flagged', 'Inactive'];
const ASSISTANCE_STATUS = ['', 'Submitted', 'UnderReview', 'Approved', 'Released', 'Denied'];

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function ReportsPage() {
  const prefs = usePreferences();
  const [period, setPeriod] = useState('Monthly');
  const [refDate, setRefDate] = useState(today());
  const [programId, setProgramId] = useState('');
  // Staff assigned to one barangay start filtered to it; still changeable here.
  const [barangay, setBarangay] = useState(prefs.defaultBarangay ?? '');
  const [busy, setBusy] = useState('');

  // Export-specific filters
  const [bStatus, setBStatus] = useState('');
  const [aStatus, setAStatus] = useState('');
  const [aFrom, setAFrom] = useState('');
  const [aTo, setATo] = useState('');

  const { data: programs = [] } = useQuery({
    queryKey: ['welfare-programs', 'reports'],
    queryFn: () => api.get('/admin/welfare-programs', { params: { activeOnly: true } }).then(r => r.data),
  });

  const summaryParams = {
    period,
    referenceDate: refDate || undefined,
    barangay: barangay || undefined,
    programId: programId || undefined,
  };

  const { data: summary, isLoading } = useQuery({
    queryKey: ['report-summary', period, refDate, barangay, programId],
    queryFn: () => api.get('/reports/summary', { params: summaryParams }).then(r => r.data),
  });

  const download = async (key, url, params, filename, responseType = 'arraybuffer') => {
    setBusy(key);
    try {
      const res = await api.get(url, { params, responseType });
      downloadBlob(res.data, filename);
      toast.success('Report downloaded.');
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setBusy('');
    }
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Reports &amp; Analytics</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Daily, monthly, and annual statistics with PDF and Excel exports.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Period</label>
            <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    period === p.id ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Reference Date</label>
            <Input type="date" value={refDate} onChange={e => setRefDate(e.target.value)} className="w-44" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Welfare Program</label>
            <Select value={programId} onChange={e => setProgramId(e.target.value)} className="w-52">
              <option value="">All programs</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Barangay</label>
            <Input placeholder="All barangays" value={barangay} onChange={e => setBarangay(e.target.value)} className="w-44" />
          </div>
          <Button
            variant="primary"
            onClick={() => download('summary-pdf', '/reports/summary/pdf', summaryParams, `summary_${period}_${stamp}.pdf`)}
            loading={busy === 'summary-pdf'}
          >
            <FileText size={16} /> Statistical Report (PDF)
          </Button>
        </CardBody>
      </Card>

      {isLoading ? (
        <LoadingSpinner className="py-24" size="lg" />
      ) : summary ? (
        <>
          {/* Summary label + stat cards */}
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{summary.periodLabel}</span>
            {summary.barangay && <> · Barangay <span className="font-medium">{summary.barangay}</span></>}
            {summary.programName && <> · <span className="font-medium">{summary.programName}</span></>}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users} tint="primary" label="New Registrations" value={summary.totalRegistrations} />
            <StatCard icon={HandCoins} tint="gold" label="Assistance Requests" value={summary.totalAssistanceRequests} />
            <StatCard icon={Banknote} tint="emerald" label="Amount Released" value={peso(summary.totalAmountReleased)} />
          </div>

          {/* Demographics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Beneficiary Demographics</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="By Sex">
                <PieBreakdown data={summary.registrationsBySex} />
              </ChartCard>
              <ChartCard title="By Age Group">
                <BarBreakdown data={summary.registrationsByAgeGroup} />
              </ChartCard>
              <ChartCard title="By Barangay (Top 10)">
                <BarBreakdown data={summary.registrationsByBarangay} />
              </ChartCard>
              <ChartCard title="By Welfare Program">
                <BarBreakdown data={summary.registrationsByProgram} />
              </ChartCard>
            </div>
          </div>

          {/* Assistance distribution */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Assistance Distribution</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="By Status">
                <PieBreakdown data={summary.assistanceByStatus} colorFor={(d) => STATUS_COLORS[d.label]} />
              </ChartCard>
              <ChartCard title="By Assistance Type">
                <BarBreakdown data={summary.assistanceByType} />
              </ChartCard>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No data" description="No records match the selected period and filters." />
      )}

      {/* Exports */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Data Exports</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Beneficiaries */}
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><Users size={16} className="text-primary-600" /> Beneficiaries List</span>}
              subtitle="Full beneficiary records with program enrollments"
            />
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Select value={bStatus} onChange={e => setBStatus(e.target.value)} className="w-40">
                  {BENEFICIARY_STATUS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
                </Select>
                <span className="text-xs text-gray-400 self-center">Uses the program &amp; barangay filters above.</span>
              </div>
              <div className="flex gap-2">
                <Button variant="success" loading={busy === 'b-xlsx'}
                  onClick={() => download('b-xlsx', '/reports/beneficiaries',
                    { barangay: barangay || undefined, status: bStatus || undefined, programId: programId || undefined },
                    `beneficiaries_${stamp}.xlsx`)}>
                  <FileSpreadsheet size={16} /> Excel
                </Button>
                <Button variant="danger" loading={busy === 'b-pdf'}
                  onClick={() => download('b-pdf', '/reports/beneficiaries/pdf',
                    { barangay: barangay || undefined, status: bStatus || undefined, programId: programId || undefined },
                    `beneficiaries_${stamp}.pdf`)}>
                  <FileText size={16} /> PDF
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Assistance */}
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><HandCoins size={16} className="text-primary-600" /> Assistance Requests</span>}
              subtitle="Request records with status history"
            />
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Select value={aStatus} onChange={e => setAStatus(e.target.value)} className="w-40">
                  {ASSISTANCE_STATUS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
                </Select>
                <Input type="date" value={aFrom} onChange={e => setAFrom(e.target.value)} className="w-36" title="Date from" />
                <Input type="date" value={aTo} onChange={e => setATo(e.target.value)} className="w-36" title="Date to" />
              </div>
              <div className="flex gap-2">
                <Button variant="success" loading={busy === 'a-xlsx'}
                  onClick={() => download('a-xlsx', '/reports/assistance',
                    { status: aStatus || undefined, dateFrom: aFrom || undefined, dateTo: aTo || undefined, barangay: barangay || undefined, programId: programId || undefined },
                    `assistance_${stamp}.xlsx`)}>
                  <FileSpreadsheet size={16} /> Excel
                </Button>
                <Button variant="danger" loading={busy === 'a-pdf'}
                  onClick={() => download('a-pdf', '/reports/assistance/pdf',
                    { status: aStatus || undefined, dateFrom: aFrom || undefined, dateTo: aTo || undefined, barangay: barangay || undefined, programId: programId || undefined },
                    `assistance_${stamp}.pdf`)}>
                  <FileText size={16} /> PDF
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function NoData() {
  return <p className="text-sm text-gray-400 text-center py-16">No data for this period.</p>;
}

function BarBreakdown({ data, colorFor }) {
  if (!data || data.length === 0) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={data.length > 5 ? -20 : 0} textAnchor={data.length > 5 ? 'end' : 'middle'} height={data.length > 5 ? 50 : 24} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [v, 'Count']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={colorFor?.(d) ?? PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieBreakdown({ data, colorFor }) {
  if (!data || data.length === 0) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={72} strokeWidth={1}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={colorFor?.(d) ?? PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, name) => [v, name]} />
        <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
