import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../shared/utils/api';
import Modal from '../../shared/components/Modal';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const STATUS_TABS = ['Pending', 'Confirmed', 'Rejected'];

const STATUS_BADGE = {
  Pending: 'bg-gold-100 text-gold-700',
  Confirmed: 'bg-accent-100 text-accent-700',
  Rejected: 'bg-emerald-100 text-emerald-700',
};

export default function DuplicateFlagsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Pending');
  const [resolveTarget, setResolveTarget] = useState(null);
  const [form, setForm] = useState({ resolution: 'Rejected', notes: '', keepId: null });

  const { data = [], isLoading } = useQuery({
    queryKey: ['duplicate-flags', tab],
    queryFn: () => api.get('/duplicate-flags', { params: { status: tab } }).then(r => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/duplicate-flags/${id}/resolve`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duplicate-flags'] });
      toast.success('Flag resolved.');
      setResolveTarget(null);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to resolve.'),
  });

  // FR-3.6: merge moves all history onto the surviving record, so it invalidates
  // beneficiary and assistance caches too.
  const mergeMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/duplicate-flags/${id}/merge`, body).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['duplicate-flags'] });
      qc.invalidateQueries({ queryKey: ['beneficiaries'] });
      qc.invalidateQueries({ queryKey: ['assistance-requests'] });
      toast.success(
        `Merged ${data.mergedClientNumber} into ${data.keptClientNumber} — ` +
        `${data.movedRequests} request(s) and ${data.movedDocuments} document(s) moved.`,
      );
      setResolveTarget(null);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to merge.'),
  });

  const isSaving = resolveMutation.isPending || mergeMutation.isPending;

  const submitResolution = () => {
    const { id } = resolveTarget;
    if (form.resolution === 'Merge') {
      mergeMutation.mutate({ id, keepBeneficiaryId: form.keepId, notes: form.notes || null });
    } else {
      resolveMutation.mutate({ id, resolution: form.resolution, notes: form.notes || null });
    }
  };

  const openResolve = (flag) => {
    setResolveTarget(flag);
    // Default to keeping the original — it holds the longer history in most cases.
    setForm({ resolution: 'Rejected', notes: '', keepId: flag.originalBeneficiaryId });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Duplicate Flags</h3>
        <p className="text-sm text-gray-500 mt-0.5">Review beneficiary records that may be duplicates</p>
      </div>

      <div className="flex gap-1 mb-4">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >{t}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-100 rounded-xl border border-gray-200">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400 p-8 text-center">No {tab.toLowerCase()} duplicate flags.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map(flag => (
              <div key={flag.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {/* Original */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-400 uppercase">Original Record</p>
                      <button onClick={() => navigate(`/beneficiaries/${flag.originalBeneficiaryId}`)}
                        className="font-semibold text-primary-700 hover:underline text-left">
                        {flag.originalName}
                      </button>
                      <p className="text-xs text-gray-500 font-mono">{flag.originalClientNumber}</p>
                    </div>
                    {/* Potential duplicate */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-400 uppercase">Possible Duplicate</p>
                      <button onClick={() => navigate(`/beneficiaries/${flag.duplicateBeneficiaryId}`)}
                        className="font-semibold text-primary-700 hover:underline text-left">
                        {flag.duplicateName}
                      </button>
                      <p className="text-xs text-gray-500 font-mono">{flag.duplicateClientNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[flag.status]}`}>
                      {flag.status}
                    </span>
                    <p className="text-xs text-gray-400">{new Date(flag.createdAt).toLocaleDateString('en-PH')}</p>
                    {flag.status === 'Pending' && (
                      <button
                        onClick={() => openResolve(flag)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                {flag.resolutionNotes && (
                  <p className="mt-2 text-xs text-gray-500 italic">Notes: {flag.resolutionNotes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve Duplicate Flag" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{resolveTarget?.originalName}</span> vs{' '}
            <span className="font-semibold">{resolveTarget?.duplicateName}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="radio" value="Rejected" checked={form.resolution === 'Rejected'}
                  onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}
                  className="mt-0.5" />
                <span><span className="font-medium">Not a duplicate</span> — keep both records active</span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="radio" value="Confirmed" checked={form.resolution === 'Confirmed'}
                  onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}
                  className="mt-0.5" />
                <span><span className="font-medium">Confirmed duplicate</span> — mark "{resolveTarget?.duplicateName}" as Inactive</span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="radio" value="Merge" checked={form.resolution === 'Merge'}
                  onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}
                  className="mt-0.5" />
                <span>
                  <span className="font-medium">Merge records</span> — move all assistance history,
                  documents and programs onto one record, then retire the other
                </span>
              </label>
            </div>
          </div>

          {form.resolution === 'Merge' && (
            <div className="rounded-lg border border-primary-200 bg-primary-50/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-300">
                Which record should be kept?
              </p>
              <div className="space-y-1.5">
                {[
                  { id: resolveTarget?.originalBeneficiaryId, name: resolveTarget?.originalName, cn: resolveTarget?.originalClientNumber, tag: 'Original' },
                  { id: resolveTarget?.duplicateBeneficiaryId, name: resolveTarget?.duplicateName, cn: resolveTarget?.duplicateClientNumber, tag: 'Possible duplicate' },
                ].map(rec => (
                  <label
                    key={rec.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white dark:bg-gray-100 px-3 py-2 text-sm transition-colors ${
                      form.keepId === rec.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={form.keepId === rec.id}
                      onChange={() => setForm(f => ({ ...f, keepId: rec.id }))}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-gray-900">{rec.name}</span>
                      <span className="block font-mono text-xs text-gray-500">{rec.cn} · {rec.tag}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-primary-900/70">
                The other record is retained as <strong>Inactive</strong> so its client number
                still resolves on old claim slips. This cannot be undone automatically.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setResolveTarget(null)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={submitResolution}
              disabled={isSaving || (form.resolution === 'Merge' && !form.keepId)}
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${
                form.resolution === 'Rejected' ? 'bg-primary-700 hover:bg-primary-800' : 'bg-accent-600 hover:bg-accent-700'
              }`}
            >
              {isSaving
                ? (form.resolution === 'Merge' ? 'Merging…' : 'Resolving…')
                : (form.resolution === 'Merge' ? 'Merge Records' : 'Confirm Resolution')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
