import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { HousePlus, Users } from 'lucide-react';
import api from '../../shared/utils/api';
import { useAuth } from '../../shared/context/AuthContext';
import DataTable from '../../shared/components/DataTable';
import Modal from '../../shared/components/Modal';
import Pagination from '../../shared/components/Pagination';

const schema = z.object({
  headOfHouseholdName: z.string().max(150).optional().or(z.literal('')),
  barangay: z.string().min(1, 'Barangay is required').max(100),
  address: z.string().min(1, 'Address is required').max(255),
});

const columns = [
  { key: 'householdNumber', header: 'Household No.', render: v => (
    <span className="font-medium text-gray-900">{v}</span>
  )},
  { key: 'headOfHouseholdName', header: 'Head of Household', render: v => v || '—' },
  { key: 'barangay', header: 'Barangay' },
  { key: 'address', header: 'Address' },
  { key: 'memberCount', header: 'Members', render: v => (
    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
      <Users size={14} className="text-gray-400" /> {v}
    </span>
  )},
  { key: 'createdAt', header: 'Registered', render: v =>
    new Date(v).toLocaleDateString('en-PH')
  },
];

export default function HouseholdsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canCreate = user?.role === 'MSWDStaff' || user?.role === 'Admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['households', page, search],
    queryFn: () => api.get('/households', { params: { page, pageSize: 20, search: search || undefined } }).then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: body => api.post('/households', {
      barangay: body.barangay,
      address: body.address,
      headOfHouseholdName: body.headOfHouseholdName || null,
    }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['households'] });
      toast.success(`Household ${res.data?.householdNumber ?? ''} created.`);
      setModalOpen(false);
      reset();
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to create household.'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Households</h3>
          <p className="text-sm text-gray-500 mt-0.5">Household-level profiling and composition</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            <HousePlus size={16} /> New Household
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by household no., barangay, or head of household…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          emptyMessage="No households found."
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={20}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="New Household" size="md">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <Field label="Head of Household" error={errors.headOfHouseholdName?.message}>
            <input {...register('headOfHouseholdName')} className={inputCls} placeholder="Juan Dela Cruz (optional)" />
          </Field>
          <Field label="Barangay" error={errors.barangay?.message}>
            <input {...register('barangay')} className={inputCls} placeholder="Poblacion" />
          </Field>
          <Field label="Address" error={errors.address?.message}>
            <input {...register('address')} className={inputCls} placeholder="Purok 1, Poblacion, Caba, La Union" />
          </Field>
          <p className="text-xs text-gray-500">A household number (HH-{new Date().getFullYear()}-####) is generated automatically.</p>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {createMutation.isPending ? 'Creating…' : 'Create Household'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
