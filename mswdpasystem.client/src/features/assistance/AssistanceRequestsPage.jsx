import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import DataTable from '../../shared/components/DataTable';
import StatusBadge from '../../shared/components/StatusBadge';
import Pagination from '../../shared/components/Pagination';
import Modal from '../../shared/components/Modal';

const TABS = ['All', 'Submitted', 'UnderReview', 'Approved', 'Released', 'Denied'];
const TAB_LABELS = { UnderReview: 'Under Review' };

export default function AssistanceRequestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isStaff = user?.role === 'MSWDStaff' || user?.role === 'Admin';
  const isHC = user?.role === 'HeadCoordinator' || user?.role === 'Admin';

  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ newStatus: '', notes: '', denialReason: '' });

  const beneficiaryId = searchParams.get('beneficiaryId');

  const { data, isLoading } = useQuery({
    queryKey: ['assistance', page, tab, beneficiaryId],
    queryFn: () => api.get('/assistance', {
      params: {
        page, pageSize: 20,
        status: tab === 'All' ? undefined : tab,
        beneficiaryId: beneficiaryId || undefined,
      }
    }).then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/assistance/${id}/status`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistance'] });
      toast.success('Status updated successfully.');
      setStatusModal(null);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Update failed.'),
  });

  const columns = [
    { key: 'requestNumber', header: 'Request No.', render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'beneficiaryName', header: 'Beneficiary' },
    { key: 'assistanceType', header: 'Type' },
    {
      key: 'amount', header: 'Amount',
      render: v => v ? `₱${Number(v).toLocaleString()}` : '—'
    },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} type="assistance" /> },
    {
      key: 'createdAt', header: 'Submitted',
      render: v => new Date(v).toLocaleDateString('en-PH')
    },
    ...(isHC ? [{
      key: 'id', header: 'Actions',
      render: (id, row) => row.status === 'Submitted' || row.status === 'UnderReview' ? (
        <button
          onClick={e => { e.stopPropagation(); setStatusModal(row); setStatusForm({ newStatus: 'Approved', notes: '', denialReason: '' }); }}
          className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          Update Status
        </button>
      ) : null
    }] : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assistance Requests</h3>
          {beneficiaryId && <p className="text-sm text-blue-600 mt-0.5">Filtered by beneficiary</p>}
        </div>
        {isStaff && (
          <button
            onClick={() => navigate('/assistance/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-blue-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {TAB_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          onRowClick={row => navigate(`/assistance/${row.id}`)}
          emptyMessage="No assistance requests found."
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={20}
          onPageChange={setPage}
        />
      </div>

      {/* Status update modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={`Update Status — ${statusModal?.requestNumber ?? ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              value={statusForm.newStatus}
              onChange={e => setStatusForm(f => ({ ...f, newStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Released">Released</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={statusForm.notes}
              onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {statusForm.newStatus === 'Denied' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Denial Reason <span className="text-red-500">*</span></label>
              <textarea
                value={statusForm.denialReason}
                onChange={e => setStatusForm(f => ({ ...f, denialReason: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setStatusModal(null)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => updateStatusMutation.mutate({
                id: statusModal.id,
                newStatus: statusForm.newStatus,
                notes: statusForm.notes || null,
                denialReason: statusForm.denialReason || null,
              })}
              disabled={updateStatusMutation.isPending || (statusForm.newStatus === 'Denied' && !statusForm.denialReason)}
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {updateStatusMutation.isPending ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
