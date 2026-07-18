import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import api from '../../shared/utils/api';
import { toast } from 'sonner';

const STATUS_OPTIONS_BENEFICIARY = ['', 'Active', 'Verified', 'Flagged', 'Inactive'];
const STATUS_OPTIONS_ASSISTANCE = ['', 'Submitted', 'UnderReview', 'Approved', 'Released', 'Denied'];

function downloadBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [bFilter, setBFilter] = useState({ barangay: '', status: '' });
  const [aFilter, setAFilter] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [loadingB, setLoadingB] = useState(false);
  const [loadingA, setLoadingA] = useState(false);

  const downloadBeneficiaries = async () => {
    setLoadingB(true);
    try {
      const res = await api.get('/reports/beneficiaries', {
        params: { barangay: bFilter.barangay || undefined, status: bFilter.status || undefined },
        responseType: 'arraybuffer',
      });
      downloadBlob(res.data, `beneficiaries_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Beneficiaries report downloaded.');
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setLoadingB(false);
    }
  };

  const downloadAssistance = async () => {
    setLoadingA(true);
    try {
      const res = await api.get('/reports/assistance', {
        params: {
          status: aFilter.status || undefined,
          dateFrom: aFilter.dateFrom || undefined,
          dateTo: aFilter.dateTo || undefined,
        },
        responseType: 'arraybuffer',
      });
      downloadBlob(res.data, `assistance_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Assistance report downloaded.');
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setLoadingA(false);
    }
  };

  const inputCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        <p className="text-sm text-gray-500 mt-0.5">Download Excel exports of system data</p>
      </div>

      {/* Beneficiaries Report */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <FileSpreadsheet size={22} className="text-blue-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">Beneficiaries List</h4>
            <p className="text-sm text-gray-500">Export all beneficiary records with program enrollments</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text" placeholder="Filter by barangay…"
            value={bFilter.barangay}
            onChange={e => setBFilter(f => ({ ...f, barangay: e.target.value }))}
            className={inputCls}
          />
          <select
            value={bFilter.status}
            onChange={e => setBFilter(f => ({ ...f, status: e.target.value }))}
            className={inputCls}
          >
            {STATUS_OPTIONS_BENEFICIARY.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>

        <button
          onClick={downloadBeneficiaries}
          disabled={loadingB}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          <Download size={16} />
          {loadingB ? 'Generating…' : 'Download Excel'}
        </button>
      </div>

      {/* Assistance Report */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 bg-green-50 rounded-lg">
            <FileSpreadsheet size={22} className="text-green-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">Assistance Requests</h4>
            <p className="text-sm text-gray-500">Export assistance request records with status history</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={aFilter.status}
            onChange={e => setAFilter(f => ({ ...f, status: e.target.value }))}
            className={inputCls}
          >
            {STATUS_OPTIONS_ASSISTANCE.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <input type="date" value={aFilter.dateFrom}
            onChange={e => setAFilter(f => ({ ...f, dateFrom: e.target.value }))}
            className={inputCls} title="Date from" />
          <input type="date" value={aFilter.dateTo}
            onChange={e => setAFilter(f => ({ ...f, dateTo: e.target.value }))}
            className={inputCls} title="Date to" />
        </div>

        <button
          onClick={downloadAssistance}
          disabled={loadingA}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          <Download size={16} />
          {loadingA ? 'Generating…' : 'Download Excel'}
        </button>
      </div>
    </div>
  );
}
