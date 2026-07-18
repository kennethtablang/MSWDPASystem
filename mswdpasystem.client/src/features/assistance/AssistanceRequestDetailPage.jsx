import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import Modal from '../../shared/components/Modal';

const STATUS_ICONS = {
  Submitted: Clock,
  UnderReview: Clock,
  Approved: CheckCircle,
  Released: Truck,
  Denied: XCircle,
};

const STATUS_COLORS = {
  Submitted: 'text-primary-500',
  UnderReview: 'text-gold-500',
  Approved: 'text-emerald-500',
  Released: 'text-emerald-500',
  Denied: 'text-accent-500',
};

const NEXT_STATUSES = {
  Submitted: ['UnderReview', 'Approved', 'Denied'],
  UnderReview: ['Approved', 'Denied'],
  Approved: ['Released'],
};

export default function AssistanceRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isHC = user?.role === 'HeadCoordinator' || user?.role === 'Admin';

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ newStatus: '', notes: '', denialReason: '' });

  const { data: req, isLoading } = useQuery({
    queryKey: ['assistance-request', id],
    queryFn: () => api.get(`/assistance/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: body => api.put(`/assistance/${id}/status`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistance-request', id] });
      qc.invalidateQueries({ queryKey: ['assistance'] });
      toast.success('Status updated.');
      setModal(false);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Update failed.'),
  });

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!req) return <p className="text-gray-500 p-8">Request not found.</p>;

  const nextStatuses = NEXT_STATUSES[req.status] ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate('/assistance')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Back to Requests
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-gray-400 mb-1">{req.requestNumber}</p>
            <h2 className="text-xl font-bold text-gray-900">{req.assistanceType}</h2>
            {req.welfareProgram && (
              <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-xs">{req.welfareProgram}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} type="assistance" />
            {isHC && nextStatuses.length > 0 && (
              <button
                onClick={() => { setForm({ newStatus: nextStatuses[0], notes: '', denialReason: '' }); setModal(true); }}
                className="px-3 py-1.5 text-sm bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
              >
                Update Status
              </button>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-6 pt-5 border-t border-gray-100">
          {[
            ['Beneficiary', req.beneficiaryName],
            ['Client No.', req.beneficiaryClientNumber],
            ['Amount', req.amount ? `₱${Number(req.amount).toLocaleString()}` : '—'],
            ['Submitted', new Date(req.createdAt).toLocaleDateString('en-PH', { dateStyle: 'long' })],
            ['Purpose', req.purpose ?? '—'],
            ...(req.denialReason ? [['Denial Reason', req.denialReason]] : []),
          ].map(([label, value]) => (
            <div key={label} className={label === 'Purpose' ? 'col-span-2' : ''}>
              <dt className="text-xs text-gray-400 font-medium">{label}</dt>
              <dd className="mt-0.5 text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={() => navigate(`/beneficiaries/${req.beneficiaryId}`)}
          className="mt-4 text-sm text-primary-600 hover:underline"
        >
          View Beneficiary Profile →
        </button>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Status History</h4>
        <ol className="relative ml-3">
          {req.statusHistory?.map((h, idx) => {
            const Icon = STATUS_ICONS[h.status] ?? Clock;
            const color = STATUS_COLORS[h.status] ?? 'text-gray-400';
            return (
              <li key={idx} className={`flex gap-4 pb-6 ${idx < req.statusHistory.length - 1 ? 'border-l-2 border-gray-100 ml-2.5' : ''}`}>
                <div className={`-ml-3.5 mt-0.5 shrink-0 ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{h.status === 'UnderReview' ? 'Under Review' : h.status}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(h.changedAt).toLocaleString('en-PH')}</p>
                  {h.notes && <p className="text-sm text-gray-600 mt-1 italic">"{h.notes}"</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Update Request Status" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              value={form.newStatus}
              onChange={e => setForm(f => ({ ...f, newStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {nextStatuses.map(s => <option key={s} value={s}>{s === 'UnderReview' ? 'Under Review' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          {form.newStatus === 'Denied' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Denial Reason <span className="text-accent-500">*</span>
              </label>
              <textarea
                value={form.denialReason}
                onChange={e => setForm(f => ({ ...f, denialReason: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => updateMutation.mutate({ newStatus: form.newStatus, notes: form.notes || null, denialReason: form.denialReason || null })}
              disabled={updateMutation.isPending || (form.newStatus === 'Denied' && !form.denialReason)}
              className="px-4 py-2 text-sm text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Updating…' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
