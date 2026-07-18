import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../shared/utils/api';
import StatusBadge from '../../shared/components/StatusBadge';

export default function QrVerificationPage() {
  const navigate = useNavigate();
  const [clientNumber, setClientNumber] = useState('');
  const [result, setResult] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: (clientNumber) => api.post('/qr-scan', { clientNumber }).then(r => r.data),
    onSuccess: (data) => {
      setResult(data);
      setClientNumber('');
    },
    onError: (err) => {
      setResult(null);
      toast.error(err.response?.data?.message ?? 'Beneficiary not found.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientNumber.trim()) return;
    verifyMutation.mutate(clientNumber.trim());
  };

  const isActive = result?.status === 'Active' || result?.status === 'Verified';

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
          <QrCode size={28} className="text-blue-700" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">QR Code Verification</h3>
        <p className="text-sm text-gray-500 mt-1">
          Scan a beneficiary QR code or enter their client number manually
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={clientNumber}
            onChange={e => setClientNumber(e.target.value.toUpperCase())}
            placeholder="e.g. CABA-2025-0001"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!clientNumber.trim() || verifyMutation.isPending}
          className="px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {result && (
        <div className={`bg-white rounded-xl border-2 p-6 ${isActive ? 'border-green-300' : 'border-red-300'}`}>
          {/* Status banner */}
          <div className={`flex items-center gap-2 mb-5 pb-4 border-b ${isActive ? 'border-green-100' : 'border-red-100'}`}>
            {isActive
              ? <CheckCircle size={22} className="text-green-500" />
              : <XCircle size={22} className="text-red-500" />}
            <div>
              <p className={`text-base font-bold ${isActive ? 'text-green-700' : 'text-red-700'}`}>
                {isActive ? 'Verified Beneficiary' : 'Inactive / Not Eligible'}
              </p>
              <p className="text-xs text-gray-400">Scanned at {new Date(result.scannedAt).toLocaleString('en-PH')}</p>
            </div>
            <StatusBadge status={result.status} className="ml-auto" />
          </div>

          {/* Info */}
          <dl className="space-y-3 text-sm">
            <Row label="Full Name" value={result.fullName} bold />
            <Row label="Client Number" value={result.clientNumber} mono />
            <Row label="Barangay" value={result.barangay} />
            <Row label="Contact No." value={result.contactNumber ?? '—'} />
            {result.programs?.length > 0 && (
              <div>
                <dt className="text-xs text-gray-400 font-medium">Programs</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {result.programs.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">{p}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => navigate(`/beneficiaries/${result.beneficiaryId}`)}
              className="flex-1 px-4 py-2 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Full Profile
            </button>
            <button
              onClick={() => setResult(null)}
              className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              New Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className={`mt-0.5 ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
