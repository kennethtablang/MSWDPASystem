import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake, Search, UserCheck, UserRound, ShieldCheck, History, ArrowRight,
} from 'lucide-react';
import api from '../../shared/utils/api';
import notify from '../../shared/utils/notify';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const SERVICE_TYPES = [
  { value: 'Registration', label: 'Registration', hint: 'Enrolling a new client' },
  { value: 'ProfileUpdate', label: 'Profile update', hint: 'Correcting or updating details' },
  { value: 'RequestFiling', label: 'Filing a request', hint: 'Encoding an assistance request' },
  { value: 'DocumentSubmission', label: 'Document submission', hint: 'Receiving requirements' },
  { value: 'Release', label: 'Release', hint: 'Handing over cash or goods' },
  { value: 'Inquiry', label: 'Inquiry', hint: 'Answering a follow-up' },
];

const REASONS = [
  { value: 'Elderly', label: 'Elderly / senior citizen' },
  { value: 'PersonWithDisability', label: 'Person with disability' },
  { value: 'Illiterate', label: 'Cannot read or write' },
  { value: 'NoDeviceOrInternet', label: 'No phone or internet access' },
  { value: 'MedicalCondition', label: 'Medical condition' },
  { value: 'NotPhysicallyPresent', label: 'Client could not travel' },
  { value: 'LanguageBarrier', label: 'Language barrier' },
  { value: 'Other', label: 'Other' },
];

const ID_TYPES = [
  'Barangay ID', 'PhilSys / National ID', 'Senior Citizen ID', 'PWD ID',
  'Voter’s ID', 'Driver’s License', 'Postal ID', 'PhilHealth ID', 'Other',
];

const label = (t) => t?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? '';

const EMPTY_FORM = {
  serviceType: 'RequestFiling',
  reason: 'Elderly',
  reasonNotes: '',
  beneficiaryPresent: true,
  representativeName: '',
  representativeRelation: '',
  representativeBeneficiaryId: null,
  representativeIdType: 'Barangay ID',
  representativeIdNumber: '',
  acknowledged: false,
  notes: '',
};

export default function AssistedServicePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  // null = untouched (fall back to the preselected client); clearing sets `false`.
  const [chosen, setChosen] = useState(null);

  // Arriving from a QR scan at the claim table carries the client and the
  // service type through, so the operator does not search for someone they
  // have just scanned.
  const prefillId = params.get('beneficiaryId');
  const prefillService = params.get('serviceType');

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    serviceType: prefillService ?? EMPTY_FORM.serviceType,
    // A release reached from a scan usually means someone else has appeared.
    beneficiaryPresent: prefillService !== 'Release',
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const { data: prefilled } = useQuery({
    queryKey: ['beneficiary', prefillId],
    queryFn: () => api.get(`/beneficiaries/${prefillId}`).then((r) => r.data),
    enabled: !!prefillId,
  });

  const client = chosen === null ? (prefilled ?? null) : (chosen || null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['beneficiaries', 'assisted-search', search],
    queryFn: () => api.get('/beneficiaries', { params: { search, page: 1, pageSize: 8 } })
      .then((r) => r.data.items ?? []),
    enabled: search.trim().length >= 2,
  });

  // Declared relatives double as the shortlist of people who may collect for
  // this client, so the usual grandchild does not have to be retyped each visit.
  const { data: representatives = [] } = useQuery({
    queryKey: ['assisted-service', client?.id, 'representatives'],
    queryFn: () => api.get(`/assisted-service/beneficiary/${client.id}/representatives`)
      .then((r) => r.data),
    enabled: !!client,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['assisted-service', client?.id],
    queryFn: () => api.get(`/assisted-service/beneficiary/${client.id}`).then((r) => r.data),
    enabled: !!client,
  });

  const saveMutation = useMutation({
    mutationFn: (body) => api.post('/assisted-service', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assisted-service', client.id] });
      notify.success(
        'Assisted service recorded.',
        'The transaction is now attributable to you in the audit trail.',
      );
      setForm(EMPTY_FORM);
    },
    onError: (err) => notify.error(err, 'Could not record the assisted service'),
  });

  const representativeMissing = !form.beneficiaryPresent && !form.representativeName.trim();
  const canSave = !!client && !representativeMissing && form.acknowledged;

  const submit = () => {
    saveMutation.mutate({
      beneficiaryId: client.id,
      serviceType: form.serviceType,
      reason: form.reason,
      reasonNotes: form.reasonNotes || null,
      beneficiaryPresent: form.beneficiaryPresent,
      representativeName: form.beneficiaryPresent ? null : form.representativeName,
      representativeRelation: form.beneficiaryPresent ? null : form.representativeRelation,
      representativeBeneficiaryId: form.beneficiaryPresent ? null : form.representativeBeneficiaryId,
      representativeIdType: form.beneficiaryPresent ? null : form.representativeIdType,
      representativeIdNumber: form.beneficiaryPresent ? null : form.representativeIdNumber,
      acknowledged: form.acknowledged,
      notes: form.notes || null,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100">
          <HeartHandshake size={22} className="text-primary-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assisted Service</h3>
          <p className="mt-0.5 max-w-2xl text-sm text-gray-500">
            For clients who cannot use the system themselves — elderly, persons with disability,
            or anyone without a phone. You operate the system on their behalf here, and the
            transaction is recorded against your account.
          </p>
        </div>
      </div>

      {/* Client selection */}
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-4">
        <label htmlFor="client-search" className="mb-1.5 block text-sm font-medium text-gray-700">
          Who are you assisting?
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="client-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or client number…"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <AnimatePresence>
          {search.trim().length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {isFetching ? (
                <p className="py-3 text-sm text-gray-400">Searching…</p>
              ) : results.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">
                  No match. If this is a new client, register them first.
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {results.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => { setChosen(b); setSearch(''); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">{b.fullName}</span>
                          <span className="block font-mono text-xs text-gray-400">
                            {b.clientNumber} · {b.barangay}
                          </span>
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

        {client && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50/60 px-3 py-2.5">
            <UserRound size={18} className="shrink-0 text-primary-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-primary-900">{client.fullName}</p>
              <p className="font-mono text-xs text-primary-800 dark:text-primary-300/70">{client.clientNumber}</p>
            </div>
            <button
              onClick={() => navigate(`/beneficiaries/${client.id}`)}
              className="shrink-0 text-xs font-medium text-primary-700 hover:underline"
            >
              Open profile
            </button>
            <button
              onClick={() => { setChosen(false); setForm(EMPTY_FORM); }}
              className="shrink-0 text-xs text-gray-500 hover:underline"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {client && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
          {/* Record form */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-5">
            <Field label="What are you doing for them?">
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICE_TYPES.map((s) => (
                  <label
                    key={s.value}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                      form.serviceType === s.value
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      className="sr-only"
                      checked={form.serviceType === s.value}
                      onChange={() => set({ serviceType: s.value })}
                    />
                    <span className="block font-medium text-gray-900">{s.label}</span>
                    <span className="block text-xs text-gray-500">{s.hint}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Why can't they transact themselves?" hint="Recorded so assisted cases can be reviewed and reported.">
              <select
                value={form.reason}
                onChange={(e) => set({ reason: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {form.reason === 'Other' && (
                <input
                  value={form.reasonNotes}
                  onChange={(e) => set({ reasonNotes: e.target.value })}
                  placeholder="Describe the circumstance"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </Field>

            <Field label="Who appeared at the office?">
              <div className="grid gap-2 sm:grid-cols-2">
                <Choice
                  active={form.beneficiaryPresent}
                  onClick={() => set({ beneficiaryPresent: true })}
                  icon={UserCheck}
                  title="The client themselves"
                  subtitle="They are here in person"
                />
                <Choice
                  active={!form.beneficiaryPresent}
                  onClick={() => set({ beneficiaryPresent: false })}
                  icon={UserRound}
                  title="A representative"
                  subtitle="Someone collecting on their behalf"
                />
              </div>
            </Field>

            <AnimatePresence>
              {!form.beneficiaryPresent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 rounded-lg border border-gold-300 bg-gold-50/60 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-900">
                      Authorised representative
                    </p>

                    {representatives.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs text-gold-900/80">
                          Declared relatives — pick one to fill the details:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {representatives.map((r) => (
                            <button
                              key={r.beneficiaryId}
                              type="button"
                              onClick={() => set({
                                representativeName: r.fullName,
                                representativeRelation: label(r.relation),
                                representativeBeneficiaryId: r.beneficiaryId,
                              })}
                              className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                form.representativeBeneficiaryId === r.beneficiaryId
                                  ? 'border-primary-500 bg-primary-50 text-primary-800 dark:text-primary-300'
                                  : 'border-gold-300 bg-white dark:bg-gray-100 text-gray-700 hover:border-primary-300'
                              }`}
                            >
                              {r.fullName} <span className="text-gray-400">· {label(r.relation)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Full name" small>
                        <input
                          value={form.representativeName}
                          onChange={(e) => set({ representativeName: e.target.value, representativeBeneficiaryId: null })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </Field>
                      <Field label="Relationship to client" small>
                        <input
                          value={form.representativeRelation}
                          onChange={(e) => set({ representativeRelation: e.target.value })}
                          placeholder="e.g. Grandchild"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </Field>
                      <Field label="ID presented" small>
                        <select
                          value={form.representativeIdType}
                          onChange={(e) => set({ representativeIdType: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="ID number" small>
                        <input
                          value={form.representativeIdNumber}
                          onChange={(e) => set({ representativeIdNumber: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </Field>
                    </div>

                    {representativeMissing && (
                      <p className="text-xs font-medium text-accent-700">
                        Name the representative before saving.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="Notes" hint="Anything a reviewer would need to understand this visit.">
              <textarea
                value={form.notes}
                onChange={(e) => set({ notes: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                type="checkbox"
                checked={form.acknowledged}
                onChange={(e) => set({ acknowledged: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Acknowledgement obtained.</span>{' '}
                The client or their representative was told what was done on their behalf and
                agreed to it. Required before saving.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setForm(EMPTY_FORM)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={submit}
                disabled={!canSave || saveMutation.isPending}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Recording…' : 'Record assisted service'}
              </button>
            </div>
          </div>

          {/* History */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100">
            <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
              <History size={16} className="text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-900">Assisted service history</h4>
              <span className="ml-auto text-xs text-gray-400">{history.length}</span>
            </header>

            {loadingHistory ? (
              <LoadingSpinner className="py-10" />
            ) : history.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">
                No assisted transactions recorded for this client yet.
              </p>
            ) : (
              <ul className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto">
                {history.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{label(h.serviceType)}</span>
                      {h.acknowledged && (
                        <ShieldCheck size={13} className="text-emerald-600" aria-label="Acknowledged" />
                      )}
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(h.createdAt).toLocaleDateString('en-PH')}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {label(h.reason)}
                      {h.assistedBy && <> · assisted by {h.assistedBy}</>}
                    </p>
                    {!h.beneficiaryPresent && h.representativeName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gold-800">
                        <ArrowRight size={11} />
                        Collected by {h.representativeName}
                        {h.representativeRelation && ` (${h.representativeRelation})`}
                        {h.representativeIdType && ` · ${h.representativeIdType}`}
                      </p>
                    )}
                    {h.notes && <p className="mt-1 text-xs italic text-gray-500">{h.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Field({ label: text, hint, small, children }) {
  return (
    <div>
      <label className={`mb-1 block font-medium text-gray-700 ${small ? 'text-xs' : 'text-sm'}`}>
        {text}
      </label>
      {hint && <p className="mb-1.5 text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

function Choice({ active, onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        active ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon size={17} className={`mt-0.5 shrink-0 ${active ? 'text-primary-700' : 'text-gray-400'}`} />
      <span>
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{subtitle}</span>
      </span>
    </button>
  );
}
