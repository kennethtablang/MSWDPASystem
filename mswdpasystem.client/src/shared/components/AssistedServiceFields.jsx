import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { HeartHandshake, UserCheck, UserRound } from 'lucide-react';
import api from '../utils/api';

/**
 * Inline assisted-service capture, embedded in the flow that does the actual work.
 *
 * A standalone page for this existed first, and it was the wrong shape: staff had
 * to complete a task, then navigate elsewhere and re-select the same client just to
 * record that they had done it. Recording that costs a second errand does not get
 * done. Here the record is a byproduct of the task instead.
 */
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

const humanise = (t) => t?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? '';

export default function AssistedServiceFields({ value, onChange, beneficiaryId, disabled = false }) {
  const set = (patch) => onChange({ ...value, ...patch });

  // Declared relatives double as the shortlist of people who may collect.
  const { data: representatives = [] } = useQuery({
    queryKey: ['assisted-service', beneficiaryId, 'representatives'],
    queryFn: () => api.get(`/assisted-service/beneficiary/${beneficiaryId}/representatives`)
      .then((r) => r.data),
    enabled: !!beneficiaryId && value.isAssisted,
  });

  const representativeMissing =
    value.isAssisted && !value.beneficiaryPresent && !value.representativeName.trim();

  return (
    <div className="rounded-xl border border-gray-200">
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={value.isAssisted}
          disabled={disabled}
          onChange={(e) => set({ isAssisted: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
            <HeartHandshake size={15} className="text-primary-700" />
            This client cannot transact for themselves
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            Tick for elderly clients, persons with disability, or anyone you are operating
            the system on behalf of. Recorded against your account.
          </span>
        </span>
      </label>

      <AnimatePresence>
        {value.isAssisted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-gray-100 p-4">
              <div>
                <label htmlFor="assisted-reason" className="mb-1 block text-sm font-medium text-gray-700">
                  Why can't they transact themselves?
                </label>
                <select
                  id="assisted-reason"
                  value={value.reason}
                  onChange={(e) => set({ reason: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {value.reason === 'Other' && (
                  <input
                    value={value.reasonNotes}
                    onChange={(e) => set({ reasonNotes: e.target.value })}
                    placeholder="Describe the circumstance"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Who appeared at the office?</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Choice
                    active={value.beneficiaryPresent}
                    onClick={() => set({ beneficiaryPresent: true })}
                    icon={UserCheck}
                    title="The client themselves"
                    subtitle="Here in person"
                  />
                  <Choice
                    active={!value.beneficiaryPresent}
                    onClick={() => set({ beneficiaryPresent: false })}
                    icon={UserRound}
                    title="A representative"
                    subtitle="Acting on their behalf"
                  />
                </div>
              </div>

              <AnimatePresence>
                {!value.beneficiaryPresent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 rounded-lg border border-gold-300 bg-gold-50/60 p-3.5">
                      {representatives.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs text-gold-900/80">
                            Declared relatives — tap to fill in:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {representatives.map((r) => (
                              <button
                                key={r.beneficiaryId}
                                type="button"
                                onClick={() => set({
                                  representativeName: r.fullName,
                                  representativeRelation: humanise(r.relation),
                                  representativeBeneficiaryId: r.beneficiaryId,
                                })}
                                className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                  value.representativeBeneficiaryId === r.beneficiaryId
                                    ? 'border-primary-500 bg-primary-50 text-primary-800 dark:text-primary-300'
                                    : 'border-gold-300 bg-white dark:bg-gray-100 text-gray-700 hover:border-primary-300'
                                }`}
                              >
                                {r.fullName} <span className="text-gray-400">· {humanise(r.relation)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Small label="Full name">
                          <input
                            value={value.representativeName}
                            onChange={(e) => set({
                              representativeName: e.target.value,
                              representativeBeneficiaryId: null,
                            })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </Small>
                        <Small label="Relationship to client">
                          <input
                            value={value.representativeRelation}
                            onChange={(e) => set({ representativeRelation: e.target.value })}
                            placeholder="e.g. Grandchild"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </Small>
                        <Small label="ID presented">
                          <select
                            value={value.representativeIdType}
                            onChange={(e) => set({ representativeIdType: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </Small>
                        <Small label="ID number">
                          <input
                            value={value.representativeIdNumber}
                            onChange={(e) => set({ representativeIdNumber: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </Small>
                      </div>

                      {representativeMissing && (
                        <p className="text-xs font-medium text-accent-700">
                          Name the representative before submitting.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <input
                  type="checkbox"
                  checked={value.acknowledged}
                  onChange={(e) => set({ acknowledged: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Acknowledgement obtained.</span>{' '}
                  The client or their representative was told what is being done on their
                  behalf and agreed to it.
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function Small({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
