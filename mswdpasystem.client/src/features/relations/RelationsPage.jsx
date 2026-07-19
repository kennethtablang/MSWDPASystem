import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Search, Plus, Trash2, Sparkles, GitCompareArrows } from 'lucide-react';
import api from '../../shared/utils/api';
import notify from '../../shared/utils/notify';
import { useAuth } from '../../shared/context/AuthContext';
import StatusBadge from '../../shared/components/StatusBadge';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import Modal from '../../shared/components/Modal';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const RELATIONSHIP_TYPES = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild',
  'AuntUncle', 'NieceNephew', 'Cousin', 'ParentInLaw', 'ChildInLaw',
  'SiblingInLaw', 'Guardian', 'Ward', 'Other',
];

const LABELS = {
  AuntUncle: 'Aunt / Uncle',
  NieceNephew: 'Niece / Nephew',
  ParentInLaw: 'Parent-in-law',
  ChildInLaw: 'Child-in-law',
  SiblingInLaw: 'Sibling-in-law',
};
const label = (t) => LABELS[t] ?? t;

/** Colour a relatedness score the same way the rest of the system reads severity. */
function scoreTone(score) {
  if (score >= 75) return 'bg-accent-100 text-accent-700';
  if (score >= 55) return 'bg-gold-100 text-gold-800';
  return 'bg-gray-100 text-gray-600';
}

export default function RelationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'MSWDStaff' || user?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [linkTarget, setLinkTarget] = useState(null);
  const [linkType, setLinkType] = useState('Sibling');
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [compareWith, setCompareWith] = useState(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['beneficiaries', 'relations-search', search],
    queryFn: () => api.get('/beneficiaries', { params: { search, page: 1, pageSize: 8 } })
      .then((r) => r.data.items ?? []),
    enabled: search.trim().length >= 2,
  });

  const { data: relatives = [], isLoading: loadingRelatives } = useQuery({
    queryKey: ['relationships', selected?.id],
    queryFn: () => api.get(`/relationships/${selected.id}`).then((r) => r.data),
    enabled: !!selected,
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ['relationships', selected?.id, 'suggestions'],
    queryFn: () => api.get(`/relationships/${selected.id}/suggestions`).then((r) => r.data),
    enabled: !!selected,
  });

  const { data: degree } = useQuery({
    queryKey: ['relationships', 'degree', selected?.id, compareWith?.id],
    queryFn: () => api.get('/relationships/degree', {
      params: { from: selected.id, to: compareWith.id },
    }).then((r) => r.data),
    enabled: !!selected && !!compareWith,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['relationships'] });
  };

  const linkMutation = useMutation({
    mutationFn: (body) => api.post('/relationships', body),
    onSuccess: () => {
      invalidate();
      notify.success('Family link saved.');
      setLinkTarget(null);
    },
    onError: (err) => notify.error(err, 'Could not save the family link'),
  });

  const unlinkMutation = useMutation({
    mutationFn: ({ beneficiaryId, relativeId }) =>
      api.delete(`/relationships/${beneficiaryId}/${relativeId}`),
    onSuccess: () => {
      invalidate();
      notify.success('Family link removed.');
      setUnlinkTarget(null);
    },
    onError: (err) => notify.error(err, 'Could not remove the family link'),
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Family Links</h3>
        <p className="mt-0.5 text-sm text-gray-500">
          Record how beneficiaries are related, and check the degree of relationship between any two records.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a beneficiary by name or client number…"
            aria-label="Search beneficiaries"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <AnimatePresence>
          {search.trim().length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              {isFetching ? (
                <p className="py-3 text-sm text-gray-400">Searching…</p>
              ) : results.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">No matching beneficiaries.</p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {results.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => { setSelected(b); setSearch(''); setCompareWith(null); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">{b.fullName}</span>
                          <span className="block font-mono text-xs text-gray-400">{b.clientNumber} · {b.barangay}</span>
                        </span>
                        <StatusBadge status={b.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selected ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <Network size={34} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Select a beneficiary</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
            Search above to see their declared relatives, suggested family links and degree of relationship.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Declared relatives */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100">
            <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
              <Network size={16} className="text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-900">
                Relatives of {selected.fullName}
              </h4>
              <span className="ml-auto text-xs text-gray-400">{relatives.length}</span>
            </header>

            {loadingRelatives ? (
              <LoadingSpinner className="py-10" />
            ) : relatives.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">
                No family links recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {relatives.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => navigate(`/beneficiaries/${r.relativeId}`)}
                        className="block truncate text-sm font-medium text-primary-700 hover:underline"
                      >
                        {r.fullName}
                      </button>
                      <span className="block font-mono text-xs text-gray-400">
                        {r.clientNumber} · {r.barangay}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {label(r.type)}
                    </span>
                    <button
                      onClick={() => setCompareWith({ id: r.relativeId, fullName: r.fullName })}
                      title="Check degree of relationship"
                      aria-label={`Check degree of relationship with ${r.fullName}`}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <GitCompareArrows size={14} />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => setUnlinkTarget(r)}
                        title="Remove link"
                        aria-label={`Remove family link with ${r.fullName}`}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-accent-50 hover:text-accent-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Suggested links */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100">
            <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
              <Sparkles size={16} className="text-gold-500" />
              <h4 className="text-sm font-semibold text-gray-900">Possible relatives</h4>
            </header>

            <p className="border-b border-gray-100 bg-gold-50/50 px-5 py-2.5 text-xs text-gold-900">
              Suggestions only, based on shared surname, address and household.
              <strong> Confirm with the client before linking.</strong>
            </p>

            {loadingSuggestions ? (
              <LoadingSpinner className="py-10" />
            ) : suggestions.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">
                No likely relatives found among unlinked records.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {suggestions.map((s) => (
                  <li key={s.beneficiaryId} className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{s.fullName}</span>
                        <span className="block font-mono text-xs text-gray-400">{s.clientNumber}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${scoreTone(s.score)}`}>
                        {s.score}%
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => { setLinkTarget(s); setLinkType('Sibling'); }}
                          className="shrink-0 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                        >
                          <Plus size={12} className="mr-0.5 inline" /> Link
                        </button>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.reasons.map((reason) => (
                        <span key={reason} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Degree-of-relationship result */}
      <AnimatePresence>
        {compareWith && degree && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-primary-200 bg-primary-50/60 p-5"
          >
            <div className="flex items-start gap-3">
              <GitCompareArrows size={18} className="mt-0.5 shrink-0 text-primary-700" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary-900">
                  {selected.fullName} &rarr; {compareWith.fullName}
                </p>
                <p className="mt-0.5 text-sm text-primary-800 dark:text-primary-300">
                  {degree.areRelated ? degree.description : 'No declared family link between these records.'}
                  {degree.degree != null && (
                    <span className="ml-2 rounded-full bg-primary-700 px-2 py-0.5 text-xs font-bold text-white">
                      Degree {degree.degree}
                    </span>
                  )}
                </p>
                {degree.path?.length > 1 && (
                  <p className="mt-2 text-xs text-primary-900/70">
                    Path: {degree.path.map((p) => `${p.fullName} (${label(p.type)})`).join(' → ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCompareWith(null)}
                className="shrink-0 text-xs text-primary-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link dialog */}
      <Modal
        isOpen={!!linkTarget}
        onClose={() => setLinkTarget(null)}
        title="Record a family link"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            How is <strong>{linkTarget?.fullName}</strong> related to{' '}
            <strong>{selected?.fullName}</strong>?
          </p>

          <div>
            <label htmlFor="rel-type" className="mb-1 block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <select
              id="rel-type"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {RELATIONSHIP_TYPES.map((t) => (
                <option key={t} value={t}>{label(t)}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              The reverse link is recorded automatically, so you only enter this once.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setLinkTarget(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => linkMutation.mutate({
                beneficiaryId: selected.id,
                relativeId: linkTarget.beneficiaryId,
                type: linkType,
              })}
              disabled={linkMutation.isPending}
              className="rounded-lg bg-primary-700 px-4 py-2 text-sm text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {linkMutation.isPending ? 'Saving…' : 'Save link'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={() => unlinkMutation.mutate({
          beneficiaryId: selected.id,
          relativeId: unlinkTarget.relativeId,
        })}
        loading={unlinkMutation.isPending}
        intent="delete"
        title="Remove family link?"
        message={`This removes the recorded ${label(unlinkTarget?.type ?? '')} link between ${selected?.fullName} and ${unlinkTarget?.fullName}.`}
        details="Both directions of the link are removed. Neither beneficiary record is otherwise changed."
        confirmLabel="Remove link"
      />
    </div>
  );
}
