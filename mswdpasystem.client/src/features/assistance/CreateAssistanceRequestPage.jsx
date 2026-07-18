import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Search } from 'lucide-react';
import api from '../../shared/utils/api';

const schema = z.object({
  beneficiaryId: z.string().min(1, 'Select a beneficiary'),
  assistanceTypeId: z.string().min(1, 'Select an assistance type'),
  welfareProgramId: z.string().optional().or(z.literal('')),
  amount: z.string().optional().or(z.literal('')),
  purpose: z.string().max(1000).optional().or(z.literal('')),
});

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-accent-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-accent-600">{error}</p>}
    </div>
  );
}

export default function CreateAssistanceRequestPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries-search', search],
    queryFn: () => api.get('/beneficiaries', { params: { search, pageSize: 10 } }).then(r => r.data.items),
    enabled: search.length >= 2,
  });

  const { data: assistanceTypes = [] } = useQuery({
    queryKey: ['assistance-types'],
    queryFn: () => api.get('/admin/assistance-types', { params: { activeOnly: true } }).then(r => r.data),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['welfare-programs'],
    queryFn: () => api.get('/admin/welfare-programs', { params: { activeOnly: true } }).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: payload => api.post('/assistance', payload),
    onSuccess: res => {
      toast.success(`Request ${res.data.requestNumber} submitted successfully.`);
      navigate('/assistance');
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Submission failed.'),
  });

  const onSubmit = data => {
    mutation.mutate({
      beneficiaryId: data.beneficiaryId,
      assistanceTypeId: data.assistanceTypeId,
      welfareProgramId: data.welfareProgramId || null,
      amount: data.amount ? parseFloat(data.amount) : null,
      purpose: data.purpose || null,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/assistance')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Assistance Requests
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">New Assistance Request</h3>
        <p className="text-sm text-gray-500 mb-6">Search for the beneficiary and fill in the request details.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Beneficiary search */}
          <Field label="Beneficiary" error={errors.beneficiaryId?.message} required>
            {selectedBeneficiary ? (
              <div className="flex items-center justify-between px-3 py-2 border border-primary-300 rounded-lg bg-primary-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{selectedBeneficiary.fullName}</p>
                  <p className="text-xs text-gray-500">{selectedBeneficiary.clientNumber}</p>
                </div>
                <button type="button" onClick={() => { setSelectedBeneficiary(null); setValue('beneficiaryId', ''); setSearch(''); }}
                  className="text-xs text-primary-600 hover:underline">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or client number…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {beneficiaries?.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {beneficiaries.map(b => (
                      <button key={b.id} type="button"
                        onClick={() => { setSelectedBeneficiary(b); setValue('beneficiaryId', b.id); setSearch(''); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{b.fullName}</p>
                        <p className="text-xs text-gray-400">{b.clientNumber} · {b.barangay}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <input type="hidden" {...register('beneficiaryId')} />
          </Field>

          <Field label="Assistance Type" error={errors.assistanceTypeId?.message} required>
            <select {...register('assistanceTypeId')} className={inputCls}>
              <option value="">Select type…</option>
              {assistanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>

          <Field label="Welfare Program" error={errors.welfareProgramId?.message}>
            <select {...register('welfareProgramId')} className={inputCls}>
              <option value="">None / General</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          <Field label="Amount Requested (₱)" error={errors.amount?.message}>
            <input {...register('amount')} type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" />
          </Field>

          <Field label="Purpose / Description" error={errors.purpose?.message}>
            <textarea {...register('purpose')} rows={3} className={`${inputCls} resize-none`}
              placeholder="Briefly describe the purpose of the assistance request…" />
          </Field>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/assistance')}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 text-sm text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60">
              {mutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
