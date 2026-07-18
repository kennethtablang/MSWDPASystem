import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/utils/api';
import DataTable from '../../shared/components/DataTable';
import Pagination from '../../shared/components/Pagination';

const ACTION_OPTIONS = [
  '', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'View',
  'QrScan', 'StatusChange', 'DocumentUpload', 'DuplicateResolution'
];

const ACTION_BADGE = {
  Create: 'bg-green-100 text-green-700',
  Update: 'bg-blue-100 text-blue-700',
  Delete: 'bg-red-100 text-red-700',
  Login: 'bg-indigo-100 text-indigo-700',
  Logout: 'bg-gray-100 text-gray-500',
  View: 'bg-gray-100 text-gray-500',
  QrScan: 'bg-cyan-100 text-cyan-700',
  StatusChange: 'bg-yellow-100 text-yellow-700',
  DocumentUpload: 'bg-purple-100 text-purple-700',
  DuplicateResolution: 'bg-orange-100 text-orange-700',
};

const columns = [
  {
    key: 'timestamp', header: 'Time',
    render: v => new Date(v).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })
  },
  { key: 'userName', header: 'User', render: v => v ?? '—' },
  {
    key: 'action', header: 'Action',
    render: v => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_BADGE[v] ?? 'bg-gray-100 text-gray-500'}`}>{v}</span>
    )
  },
  { key: 'entityType', header: 'Entity' },
  { key: 'entityId', header: 'Entity ID', render: v => v ? <span className="font-mono text-xs text-gray-400">{v.slice(0, 8)}…</span> : '—' },
  { key: 'description', header: 'Description', render: v => v ?? '—' },
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, action, dateFrom, dateTo],
    queryFn: () => api.get('/audit-logs', {
      params: {
        page, pageSize: 30,
        search: search || undefined,
        action: action || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }
    }).then(r => r.data),
  });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
        <p className="text-sm text-gray-500 mt-0.5">System activity trail for accountability and compliance</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text" placeholder="Search by user or description…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="From" title="Date from" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="To" title="Date to" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          emptyMessage="No audit logs found."
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={30}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
