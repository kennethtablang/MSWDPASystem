import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import DataTable from '../../shared/components/DataTable';
import StatusBadge from '../../shared/components/StatusBadge';
import Pagination from '../../shared/components/Pagination';

const STATUS_OPTIONS = ['', 'Active', 'Verified', 'Flagged', 'Inactive'];

export default function BeneficiariesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRegister = user?.role === 'MSWDStaff' || user?.role === 'Admin';

  const [page, setPage] = useState(1);
  // Search lives in the URL so the global header search can deep-link here.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const setSearch = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };
  const [barangay, setBarangay] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries', page, search, barangay, status],
    queryFn: () => api.get('/beneficiaries', {
      params: {
        page, pageSize: 20,
        search: search || undefined,
        barangay: barangay || undefined,
        status: status || undefined,
      }
    }).then(r => r.data),
  });

  const columns = [
    { key: 'clientNumber', header: 'Client No.', sortable: true },
    { key: 'fullName', header: 'Full Name', sortable: true },
    { key: 'barangay', header: 'Barangay', sortable: true },
    {
      key: 'programs', header: 'Programs',
      render: programs => programs?.length > 0
        ? programs.map(p => (
          <span key={p} className="inline-flex mr-1 mb-1 px-2 py-0.5 rounded text-xs bg-primary-50 text-primary-700">{p}</span>
        ))
        : <span className="text-gray-400 text-xs">None</span>
    },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'createdAt', header: 'Registered', sortable: true,
      render: v => v ? new Date(v).toLocaleDateString('en-PH') : '—'
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Beneficiaries</h3>
          <p className="text-sm text-gray-500 mt-0.5">{data?.totalCount ?? 0} registered beneficiaries</p>
        </div>
        {canRegister && (
          <button
            onClick={() => navigate('/beneficiaries/register')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
          >
            <UserPlus size={16} /> Register Beneficiary
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name or client number…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <input
          type="text" placeholder="Barangay…"
          value={barangay}
          onChange={e => { setBarangay(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          columnToggle
          onRowClick={row => navigate(`/beneficiaries/${row.id}`)}
          emptyMessage="No beneficiaries found. Try adjusting your filters."
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={20}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
