import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { HousePlus, Users } from 'lucide-react';
import api from '../../shared/utils/api';
import { useAuth } from '../../shared/context/AuthContext';
import { Card } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import FormField, { Input } from '../../shared/components/ui/FormField';
import DataTable from '../../shared/components/DataTable';
import Modal from '../../shared/components/Modal';
import Pagination from '../../shared/components/Pagination';
import usePreferences from '../../shared/hooks/usePreferences';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.role === 'MSWDStaff' || user?.role === 'Admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = usePreferences().defaultPageSize;

  const { data, isLoading } = useQuery({
    queryKey: ['households', page, search, pageSize],
    queryFn: () => api.get('/households', { params: { page, pageSize, search: search || undefined } }).then(r => r.data),
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
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <HousePlus size={16} /> New Household
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by household no., barangay, or head of household…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-96"
        />
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          emptyMessage="No households found."
          onRowClick={(row) => navigate(`/households/${row.id}`)}
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="New Household" size="md">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <FormField label="Head of Household" error={errors.headOfHouseholdName?.message}>
            <Input {...register('headOfHouseholdName')} placeholder="Juan Dela Cruz (optional)" error={errors.headOfHouseholdName?.message} />
          </FormField>
          <FormField label="Barangay" required error={errors.barangay?.message}>
            <Input {...register('barangay')} placeholder="Poblacion" error={errors.barangay?.message} />
          </FormField>
          <FormField label="Address" required error={errors.address?.message}>
            <Input {...register('address')} placeholder="Purok 1, Poblacion, Caba, La Union" error={errors.address?.message} />
          </FormField>
          <p className="text-xs text-gray-500">A household number (HH-{new Date().getFullYear()}-####) is generated automatically.</p>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Household'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
