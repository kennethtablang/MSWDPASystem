import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode, Search, CheckCircle, XCircle, History, Wallet,
  AlertTriangle, Clock, KeyboardIcon, HeartHandshake,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../shared/utils/api';
import StatusBadge from '../../shared/components/StatusBadge';
import QrScanner from '../../shared/components/QrScanner';
import usePreferences from '../../shared/hooks/usePreferences';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const dateFmt = (v) => (v ? new Date(v).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function QrVerificationPage() {
  const navigate = useNavigate();
  const prefs = usePreferences();
  const [clientNumber, setClientNumber] = useState('');
  const [result, setResult] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: (cn) => api.post('/qr-scan', { clientNumber: cn }).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      setClientNumber('');
      toast.success(`Verified ${data.fullName}`);
    },
    onError: (err) => {
      setResult(null);
      toast.error(err.response?.data?.message ?? 'Beneficiary not found.');
    },
  });

  const { mutate } = verifyMutation;
  // Stable identity keeps QrScanner's decode callback from being rebuilt each render.
  const handleScan = useCallback((cn) => mutate(cn), [mutate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = clientNumber.trim();
    if (trimmed) mutate(trimmed);
  };

  const isEligible = result?.status === 'Active' || result?.status === 'Verified';

  // A scan earlier the same day usually means the client already passed this
  // table — worth surfacing before anything is handed over.
  const scannedToday = useMemo(() => {
    if (!result?.previousScanAt) return false;
    const prev = new Date(result.previousScanAt);
    const now = new Date(result.scannedAt);
    return prev.toDateString() === now.toDateString();
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
          <QrCode size={28} className="text-primary-700" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">QR Code Verification</h3>
        <p className="mt-1 text-sm text-gray-500">
          Scan the beneficiary's QR code with the camera, or enter their client number manually
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
        {/* ---- Scanner + manual entry ---- */}
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-100 p-4 shadow-card">
          <QrScanner
            onScan={handleScan}
            disabled={verifyMutation.isPending}
            autoStart={prefs.autoStartQrCamera}
          />

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">or enter manually</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={clientNumber}
                onChange={(e) => setClientNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CABA-2026-0001"
                aria-label="Client number"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={!clientNumber.trim() || verifyMutation.isPending}
              className="w-full rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
            >
              {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
            </button>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-gray-400">
              <KeyboardIcon size={12} /> USB barcode scanners also work in this field
            </p>
          </form>
        </div>

        {/* ---- Result ---- */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={`${result.beneficiaryId}-${result.scannedAt}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`rounded-xl border-2 bg-white dark:bg-gray-100 p-6 shadow-card ${isEligible ? 'border-emerald-300' : 'border-accent-300'}`}
            >
              <div className={`mb-5 flex items-center gap-2 border-b pb-4 ${isEligible ? 'border-emerald-100' : 'border-accent-100'}`}>
                {isEligible
                  ? <CheckCircle size={22} className="shrink-0 text-emerald-500" />
                  : <XCircle size={22} className="shrink-0 text-accent-500" />}
                <div className="min-w-0">
                  <p className={`text-base font-bold ${isEligible ? 'text-emerald-700' : 'text-accent-700'}`}>
                    {isEligible ? 'Verified Beneficiary' : 'Not Eligible for Release'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Scanned {new Date(result.scannedAt).toLocaleString('en-PH')}
                  </p>
                </div>
                <StatusBadge status={result.status} className="ml-auto shrink-0" />
              </div>

              {!isEligible && (
                <Callout tone="danger" icon={AlertTriangle}>
                  This record is <strong>{result.status}</strong>. Do not release assistance —
                  refer the client to a Head Coordinator.
                </Callout>
              )}
              {scannedToday && (
                <Callout tone="warning" icon={Clock}>
                  Already scanned today at{' '}
                  <strong>{new Date(result.previousScanAt).toLocaleTimeString('en-PH')}</strong>.
                  Confirm this is not a repeat claim.
                </Callout>
              )}

              <dl className="space-y-3 text-sm">
                <Row label="Full Name" value={result.fullName} bold />
                <Row label="Client Number" value={result.clientNumber} mono />
                <Row label="Barangay" value={result.barangay} />
                <Row label="Contact No." value={result.contactNumber ?? '—'} />
                {result.programs?.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400">Active Programs</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {result.programs.map((p) => (
                        <span key={p} className="rounded bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{p}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              {/* FR-3.5: assistance history on successful verification */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center gap-2">
                  <History size={15} className="text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-900">Assistance History</h4>
                  <span className="ml-auto text-xs text-gray-400">
                    {result.totalRequests} {result.totalRequests === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2">
                  <Stat icon={Wallet} label="Total released" value={peso.format(result.totalReleasedAmount ?? 0)} />
                  <Stat label="Last released" value={dateFmt(result.lastReleasedAt)} />
                  <Stat label="Pending" value={result.pendingRequests ?? 0} tone={result.pendingRequests > 0 ? 'warning' : 'default'} />
                </div>

                {result.assistanceHistory?.length ? (
                  <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {result.assistanceHistory.map((h) => (
                      <li
                        key={h.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{h.assistanceType}</p>
                          <p className="truncate font-mono text-[11px] text-gray-400">
                            {h.requestNumber} · {dateFmt(h.requestedAt)}
                            {h.programName ? ` · ${h.programName}` : ''}
                          </p>
                        </div>
                        {h.amount != null && (
                          <span className="shrink-0 text-sm font-semibold text-gray-700">{peso.format(h.amount)}</span>
                        )}
                        <StatusBadge status={h.status} className="shrink-0" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-400">
                    No assistance has been requested for this beneficiary yet.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                {isEligible && (
                  // Closes the loop at the claim table: the operator has just
                  // identified this client, so recording who collected should not
                  // mean searching for them again on another page.
                  <button
                    onClick={() => navigate(
                      `/assisted-service?beneficiaryId=${result.beneficiaryId}&serviceType=Release`,
                    )}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800"
                  >
                    <HeartHandshake size={15} /> Record release / representative
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/beneficiaries/${result.beneficiaryId}`)}
                    className="flex-1 rounded-lg border border-primary-200 px-4 py-2 text-sm text-primary-700 transition-colors hover:bg-primary-50"
                  >
                    View Full Profile
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    New Scan
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden rounded-xl border border-dashed border-gray-200 p-10 text-center lg:block"
            >
              <QrCode size={34} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Awaiting scan</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-gray-400">
                Verification results and the beneficiary's assistance history will appear here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Callout({ tone, icon: Icon, children }) {
  const tones = {
    danger: 'bg-accent-50 text-accent-800 border-accent-200',
    warning: 'bg-gold-50 text-gold-900 border-gold-300',
  };
  return (
    <div className={`mb-4 flex gap-2 rounded-lg border px-3 py-2.5 text-xs ${tones[tone]}`}>
      <Icon size={15} className="mt-px shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${tone === 'warning' ? 'bg-gold-50' : 'bg-gray-50'}`}>
      <p className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
        {Icon && <Icon size={11} />} {label}
      </p>
      <p className={`mt-0.5 truncate text-sm font-semibold ${tone === 'warning' ? 'text-gold-800' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs font-medium text-gray-400">{label}</dt>
      <dd className={`text-right ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${mono ? 'font-mono text-sm' : 'text-sm'}`}>
        {value}
      </dd>
    </div>
  );
}
